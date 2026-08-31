import { formatFileSize } from "@/lib/format-file-size";
import { Download, Paperclip } from "lucide-react";

type Attachment = { id: string; url: string; fileName: string; size: number };

const MessageAttachments = ({ attachments }: { attachments: Attachment[] }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mb-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          download={attachment.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs hover:bg-primary/20 transition-colors"
        >
          <Paperclip size={14} className="shrink-0" />
          <span className="truncate max-w-40">{attachment.fileName}</span>
          <span className="text-primary/70 shrink-0">{formatFileSize(attachment.size)}</span>
          <Download size={14} className="ml-auto shrink-0" />
        </a>
      ))}
    </div>
  );
};

export default MessageAttachments;
