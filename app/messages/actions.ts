"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const MAX_MESSAGE_LENGTH = 4000;

export type MessageRow = {
  id: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
  senderId: string;
};

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
  if (!session) return { session: null, profile: null };

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
): Promise<SendMessageState> {
  const { session, profile: caller } = await getCallerProfile();

  if (!session) {
    return { success: false, message: "You must be signed in to send messages." };
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
  if (!trimmed) {
    return { success: false, message: "Message cannot be empty." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { success: false, message: "Message is too long." };
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: caller.id, content: trimmed },
  });

  try {
    await pusherServer.trigger(`private-conversation-${conversationId}`, "new-message", {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
    });
  } catch (error) {
    console.error("Failed to publish new-message event to Pusher", error);
  }

  revalidateConversationPaths(conversation.participantOneId, conversation.participantTwoId);

  return { success: true, data: message };
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
    select: { id: true, content: true, createdAt: true, readAt: true, senderId: true },
  });

  return { success: true, messages };
}
