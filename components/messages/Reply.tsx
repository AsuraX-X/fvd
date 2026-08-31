import MessageAttachments from "./MessageAttachments";

type Attachment = { id: string; url: string; fileName: string; size: number };

const Reply = ({
  message,
  time,
  seen,
  attachments,
}: {
  message: string;
  time: string;
  seen: boolean;
  attachments: Attachment[];
}) => {
  return (
    <div className="flex items-start flex-col">
      <div className="bg-secondary rounded-2xl rounded-bl-md p-4 text-primary w-fit max-w-full">
        <MessageAttachments attachments={attachments} />
        {message && <p className="text-sm">{message}</p>}
      </div>
      <p className="text-[10px] text-body mt-0.5">
        <span className="uppercase">{time}</span>
        {seen && " · Seen"}
      </p>
    </div>
  );
};

export default Reply;
