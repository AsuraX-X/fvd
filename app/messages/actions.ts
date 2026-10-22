"use server";

import { auth } from "@/lib/auth";
import { sendInBackground, sendNewMessageEmail } from "@/lib/emails";
import { prisma } from "@/lib/prisma";
import { hasAcceptedTerms, TERMS_REQUIRED_MESSAGE } from "@/lib/terms";
import { pusherServer } from "@/lib/pusher";
import { MESSAGE_ATTACHMENTS_MAX_TOTAL_BYTES } from "@/lib/upload-limits";
import { formatFileSize } from "@/lib/format-file-size";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;

export type MessageAttachmentRow = {
  id: string;
  url: string;
  fileName: string;
  size: number;
};

export type MessageRow = {
  id: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
  senderId: string;
  attachments: MessageAttachmentRow[];
};

export type NewAttachment = { url: string; fileName: string; size: number };

export type GetOrCreateConversationState =
  | { success: true; conversationId: string }
  | { success: false; message: string };

export type SendMessageState =
  | { success: true; data: MessageRow }
  | { success: false; message: string };

export type MarkConversationReadState =
  | { success: true }
  | { success: false; message: string };

export type ConversationSummary = {
  id: string;
  updatedAt: Date;
  otherProfile: {
    id: string;
    firstName: string;
    surname: string;
    avatar: string | null;
  };
  lastMessage: { content: string; createdAt: Date } | null;
};

export type GetConversationsState =
  | { success: true; conversations: ConversationSummary[] }
  | { success: false; message: string };

export type GetMessagesState =
  | { success: true; messages: MessageRow[] }
  | { success: false; message: string };

async function getCallerProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.emailVerified) {
    return { session: null, profile: null };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, role: true },
  });

  return { session, profile };
}

function revalidateConversationPaths(participantOneId: string, participantTwoId: string) {
  revalidatePath(`/messages/${participantOneId}`);
  revalidatePath(`/messages/${participantTwoId}`);
  revalidatePath("/dashboard/messages");
}

export async function getOrCreateConversation(
  otherProfileId: string,
): Promise<GetOrCreateConversationState> {
  const { session, profile: caller } = await getCallerProfile();

  if (!session) {
    return { success: false, message: "You must be signed in to send messages." };
  }
  if (!hasAcceptedTerms(session.user)) {
    return { success: false, message: TERMS_REQUIRED_MESSAGE };
  }
  if (!caller) {
    return { success: false, message: "Your profile could not be found." };
  }

  if (caller.id === otherProfileId) {
    return { success: false, message: "You can't start a conversation with yourself." };
  }

  const target = await prisma.profile.findUnique({
    where: { id: otherProfileId },
    select: { id: true, role: true },
  });

  if (!target) {
    return { success: false, message: "Profile not found." };
  }

  if (caller.role === target.role && caller.role !== "ADMIN") {
    return {
      success: false,
      message: "Messaging is only available between a client and an expert, or with an admin.",
    };
  }

  const [participantOneId, participantTwoId] = [caller.id, target.id].sort();

  // Called directly from the /messages/[id] page during render (first visit
  // auto-creates the conversation), so this must never call revalidatePath —
  // Next.js disallows revalidating during a render pass. sendMessage and
  // markConversationRead are only ever invoked from client transitions, so
  // they can revalidate safely.
  const conversation = await prisma.conversation.upsert({
    where: { participantOneId_participantTwoId: { participantOneId, participantTwoId } },
    create: { participantOneId, participantTwoId },
    update: {},
    select: { id: true },
  });

  return { success: true, conversationId: conversation.id };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  attachments: NewAttachment[] = [],
): Promise<SendMessageState> {
  const { session, profile: caller } = await getCallerProfile();

  if (!session) {
    return { success: false, message: "You must be signed in to send messages." };
  }
  if (!hasAcceptedTerms(session.user)) {
    return { success: false, message: TERMS_REQUIRED_MESSAGE };
  }
  if (!caller) {
    return { success: false, message: "Your profile could not be found." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participantOneId: true, participantTwoId: true },
  });

  if (
    !conversation ||
    (conversation.participantOneId !== caller.id &&
      conversation.participantTwoId !== caller.id)
  ) {
    return { success: false, message: "Conversation not found." };
  }

  const trimmed = content.trim();
  if (!trimmed && attachments.length === 0) {
    return { success: false, message: "Message cannot be empty." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { success: false, message: "Message is too long." };
  }
  if (attachments.length > MAX_ATTACHMENTS) {
    return { success: false, message: `You can attach up to ${MAX_ATTACHMENTS} files.` };
  }
  const totalAttachmentBytes = attachments.reduce((sum, a) => sum + a.size, 0);
  if (totalAttachmentBytes > MESSAGE_ATTACHMENTS_MAX_TOTAL_BYTES) {
    return {
      success: false,
      message: `Attachments can't exceed ${formatFileSize(MESSAGE_ATTACHMENTS_MAX_TOTAL_BYTES)} combined.`,
    };
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: caller.id,
      content: trimmed,
      attachments: {
        create: attachments.map((attachment, index) => ({ ...attachment, order: index })),
      },
    },
    include: { attachments: { orderBy: { order: "asc" } } },
  });

  try {
    await pusherServer.trigger(`private-conversation-${conversationId}`, "new-message", {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      attachments: message.attachments,
    });
  } catch (error) {
    console.error("Failed to publish new-message event to Pusher", error);
  }

  revalidateConversationPaths(conversation.participantOneId, conversation.participantTwoId);

  const recipientId =
    conversation.participantOneId === caller.id
      ? conversation.participantTwoId
      : conversation.participantOneId;
  sendInBackground(() =>
    notifyRecipientByEmail({
      conversationId,
      messageId: message.id,
      senderId: caller.id,
      recipientId,
      content: message.content,
      attachmentCount: message.attachments.length,
    }),
  );

  return { success: true, data: message };
}

const ACTIVE_WINDOW_MS = 10 * 60 * 1000;

// Emails only on the first unread message, and not while the recipient is
// mid-conversation, so a burst of messages produces one email, not dozens.
async function notifyRecipientByEmail(message: {
  conversationId: string;
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  attachmentCount: number;
}) {
  const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS);

  const [earlierUnread, recentRecipientActivity, sender, recipient] = await Promise.all([
    prisma.message.count({
      where: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        readAt: null,
        id: { not: message.messageId },
      },
    }),
    prisma.message.count({
      where: {
        conversationId: message.conversationId,
        OR: [
          { senderId: message.recipientId, createdAt: { gte: activeSince } },
          { senderId: message.senderId, readAt: { gte: activeSince } },
        ],
      },
    }),
    prisma.profile.findUnique({
      where: { id: message.senderId },
      select: { firstName: true, surname: true },
    }),
    prisma.profile.findUnique({
      where: { id: message.recipientId },
      select: {
        firstName: true,
        messageEmailNotifications: true,
        user: { select: { email: true, emailVerified: true } },
      },
    }),
  ]);

  if (earlierUnread > 0 || recentRecipientActivity > 0) return;
  if (!sender || !recipient?.user.emailVerified) return;
  if (!recipient.messageEmailNotifications) return;

  await sendNewMessageEmail({
    to: recipient.user.email,
    recipientName: recipient.firstName,
    senderName: `${sender.firstName} ${sender.surname}`.trim() || "Someone",
    senderProfileId: message.senderId,
    content: message.content,
    attachmentCount: message.attachmentCount,
  });
}

export async function markConversationRead(
  conversationId: string,
): Promise<MarkConversationReadState> {
  const { session, profile: caller } = await getCallerProfile();

  if (!session) {
    return { success: false, message: "You must be signed in." };
  }
  if (!caller) {
    return { success: false, message: "Your profile could not be found." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participantOneId: true, participantTwoId: true },
  });

  if (
    !conversation ||
    (conversation.participantOneId !== caller.id &&
      conversation.participantTwoId !== caller.id)
  ) {
    return { success: false, message: "Conversation not found." };
  }

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: caller.id }, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath(`/messages/${conversation.participantOneId}`);
  revalidatePath(`/messages/${conversation.participantTwoId}`);

  return { success: true };
}

export async function getConversations(): Promise<GetConversationsState> {
  const { session, profile: caller } = await getCallerProfile();

  if (!session) {
    return { success: false, message: "You must be signed in." };
  }
  if (!caller) {
    return { success: false, message: "Your profile could not be found." };
  }

  const profileSelect = {
    id: true,
    firstName: true,
    surname: true,
    avatar: true,
  } as const;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantOneId: caller.id }, { participantTwoId: caller.id }],
    },
    include: {
      participantOne: { select: profileSelect },
      participantTwo: { select: profileSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    success: true,
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      otherProfile:
        conversation.participantOneId === caller.id
          ? conversation.participantTwo
          : conversation.participantOne,
      lastMessage: conversation.messages[0] ?? null,
    })),
  };
}

export async function getMessages(conversationId: string): Promise<GetMessagesState> {
  const { session, profile: caller } = await getCallerProfile();

  if (!session) {
    return { success: false, message: "You must be signed in." };
  }
  if (!caller) {
    return { success: false, message: "Your profile could not be found." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participantOneId: true, participantTwoId: true },
  });

  if (
    !conversation ||
    (conversation.participantOneId !== caller.id &&
      conversation.participantTwoId !== caller.id)
  ) {
    return { success: false, message: "Conversation not found." };
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      readAt: true,
      senderId: true,
      attachments: { orderBy: { order: "asc" } },
    },
  });

  return { success: true, messages };
}
