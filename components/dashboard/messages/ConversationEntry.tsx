import Link from "next/link";

type ConversationEntryProps = {
  href: string;
  name: string;
  lastMessage: string;
  date: string;
};

const ConversationEntry = ({ href, name, lastMessage, date }: ConversationEntryProps) => {
  return (
    <Link href={href}>
      <div className="flex hover:bg-secondary/5 transition-colors py-4 px-6 justify-between text-sm">
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-body">{lastMessage}</p>
        </div>
        <p className="text-body text-xs">{date}</p>
      </div>
    </Link>
  );
};

export default ConversationEntry;
