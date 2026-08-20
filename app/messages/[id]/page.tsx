import { getConversations, getMessages, getOrCreateConversation } from "@/app/messages/actions";
import ExpertInfo from "@/components/messages/ExpertInfo";
import InboxEntry from "@/components/messages/InboxEntry";
import MessageThread from "@/components/messages/MessageThread";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatInboxDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/account?signin=true");
  }

  const [conversationResult, otherProfile] = await Promise.all([
    getOrCreateConversation(id),
    prisma.profile.findUnique({
      where: { id },
      select: {
        firstName: true,
        surname: true,
        avatar: true,
        specialty: true,
        headline: true,
        bio: true,
        rate: true,
      },
    }),
  ]);

  if (!otherProfile) {
    notFound();
  }

  if (!conversationResult.success) {
    return (
      <div className="min-h-[80vh] mt-30 mb-10 px-8 max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-body text-sm">{conversationResult.message}</p>
      </div>
    );
  }

  const { conversationId } = conversationResult;

  const [conversationsResult, messagesResult] = await Promise.all([
    getConversations(),
    getMessages(conversationId),
  ]);

  const conversations = conversationsResult.success ? conversationsResult.conversations : [];
  const messages = messagesResult.success ? messagesResult.messages : [];

  const otherName = `${otherProfile.firstName} ${otherProfile.surname}`.trim();

  return (
    <div className="min-h-[80vh] mt-30 mb-10 px-8 max-w-7xl mx-auto flex">
      <div className="bg-primary-light flex flex-col overflow-hidden  rounded-2xl flex-2">
        <div className="border-b p-4 border-secondary/10">
          <h2 className="small-header font-body! mb-2">Inbox</h2>
          <p className="text-sm">
            {conversations.length} active thread{conversations.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="divide-y overflow-scroll divide-secondary/10">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/messages/${conversation.otherProfile.id}`}>
              <InboxEntry
                active={conversation.otherProfile.id === id}
                name={`${conversation.otherProfile.firstName} ${conversation.otherProfile.surname}`.trim()}
                lastMessage={conversation.lastMessage?.content ?? "No messages yet"}
                date={formatInboxDate(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col flex-5">
        <MessageThread
          key={conversationId}
          conversationId={conversationId}
          currentProfileId={session.user.id}
          initialMessages={messages}
        />
      </div>
      <div className="bg-primary-light rounded-2xl flex-2">
        <ExpertInfo
          name={otherName}
          specialty={otherProfile.specialty}
          headline={otherProfile.headline}
          bio={otherProfile.bio}
          rate={otherProfile.rate}
          avatar={otherProfile.avatar}
        />
      </div>
    </div>
  );
};

export default page;
