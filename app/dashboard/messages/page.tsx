import { getConversations } from "@/app/messages/actions";
import ConversationEntry from "@/components/dashboard/messages/ConversationEntry";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US");
}

const page = async () => {
  const result = await getConversations();
  const conversations = result.success ? result.conversations : [];

  return (
    <div>
      <div className="bg-primary-light max-h-[80vh] divide-y overflow-scroll divide-secondary/10 rounded-2xl">
        {conversations.length === 0 && (
          <p className="text-body text-sm py-8 px-6">No conversations yet.</p>
        )}
        {conversations.map((conversation) => (
          <ConversationEntry
            key={conversation.id}
            href={`/messages/${conversation.otherProfile.id}`}
            name={`${conversation.otherProfile.firstName} ${conversation.otherProfile.surname}`.trim()}
            lastMessage={conversation.lastMessage?.content ?? "No messages yet"}
            date={formatDate(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}
          />
        ))}
      </div>
    </div>
  );
};

export default page;
