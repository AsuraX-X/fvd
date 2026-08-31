"use client";

import { uploadMessageAttachment } from "@/lib/blob-upload";
import { formatFileSize } from "@/lib/format-file-size";
import { getPusherClient } from "@/lib/pusher-client";
import {
  MESSAGE_ATTACHMENT_MAX_BYTES,
  MESSAGE_ATTACHMENTS_MAX_TOTAL_BYTES,
} from "@/lib/upload-limits";
import {
  markConversationRead,
  sendMessage,
  type MessageAttachmentRow,
  type MessageRow,
} from "@/app/messages/actions";
import { ArrowRight, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import Reply from "./Reply";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;

type MessageThreadProps = {
  conversationId: string;
  currentProfileId: string;
  initialMessages: MessageRow[];
};

type IncomingMessagePayload = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  attachments: MessageAttachmentRow[];
};

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(date: Date | string) {
  return new Date(date)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function dayKey(date: Date | string) {
  return new Date(date).toDateString();
}

const MessageThread = ({
  conversationId,
  currentProfileId,
  initialMessages,
}: MessageThreadProps) => {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startTransition(async () => {
      await markConversationRead(conversationId);
    });

    const pusher = getPusherClient();
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusher.subscribe(channelName);

    const handleNewMessage = (payload: IncomingMessagePayload) => {
      setMessages((prev) => {
        if (prev.some((message) => message.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            content: payload.content,
            createdAt: new Date(payload.createdAt),
            readAt: null,
            senderId: payload.senderId,
            attachments: payload.attachments,
          },
        ];
      });
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusher.unsubscribe(channelName);
    };
  }, [conversationId]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = content.trim();
    if ((!trimmed && files.length === 0) || isPending) return;

    const pendingFiles = files;
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticMessage: MessageRow = {
      id: tempId,
      content: trimmed,
      createdAt: new Date(),
      readAt: null,
      senderId: currentProfileId,
      attachments: pendingFiles.map((file, index) => ({
        id: `temp-attachment-${index}`,
        url: "",
        fileName: file.name,
        size: file.size,
      })),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setContent("");
    setFiles([]);
    setError(null);

    startTransition(async () => {
      let uploaded;
      try {
        uploaded = await Promise.all(
          pendingFiles.map((file) => uploadMessageAttachment(conversationId, file)),
        );
      } catch {
        setMessages((prev) => prev.filter((message) => message.id !== tempId));
        setError("Failed to upload attachments.");
        return;
      }

      const result = await sendMessage(conversationId, trimmed, uploaded);

      setMessages((prev) => {
        const withoutTemp = prev.filter((message) => message.id !== tempId);
        if (!result.success) return withoutTemp;
        if (withoutTemp.some((message) => message.id === result.data.id)) {
          return withoutTemp;
        }
        return [...withoutTemp, result.data];
      });

      if (!result.success) {
        setError(result.message);
      }
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const oversized = selected.filter((file) => file.size > MESSAGE_ATTACHMENT_MAX_BYTES);
    const withinSize = selected.filter((file) => file.size <= MESSAGE_ATTACHMENT_MAX_BYTES);
    const combined = [...files, ...withinSize].slice(0, MAX_ATTACHMENTS);
    const total = combined.reduce((sum, file) => sum + file.size, 0);

    if (total > MESSAGE_ATTACHMENTS_MAX_TOTAL_BYTES) {
      setError(
        `Attachments can't exceed ${formatFileSize(MESSAGE_ATTACHMENTS_MAX_TOTAL_BYTES)} combined.`,
      );
      return;
    }

    setFiles(combined);
    setError(
      oversized.length > 0
        ? `${oversized.map((file) => file.name).join(", ")} exceed${oversized.length === 1 ? "s" : ""} the ${formatFileSize(MESSAGE_ATTACHMENT_MAX_BYTES)} file limit.`
        : null,
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const messagesWithDividers = sortedMessages.map((message, index) => ({
    message,
    showDivider:
      index === 0 || dayKey(message.createdAt) !== dayKey(sortedMessages[index - 1].createdAt),
  }));

  return (
    <>
      <div ref={listRef} className="flex-1 md:px-6 py-4 max-h-[80vh] overflow-scroll">
        {messagesWithDividers.length === 0 && (
          <p className="text-center text-body text-sm py-10">
            No messages yet — say hello.
          </p>
        )}
        {messagesWithDividers.map(({ message, showDivider }) => {
          const Bubble = message.senderId === currentProfileId ? Message : Reply;

          return (
            <div key={message.id}>
              {showDivider && (
                <p className="uppercase text-body text-xs text-center py-4">
                  {formatDay(message.createdAt)}
                </p>
              )}
              <Bubble
                message={message.content}
                time={formatTime(message.createdAt)}
                seen={message.readAt !== null}
                attachments={message.attachments}
              />
            </div>
          );
        })}
      </div>
      <div className="py-3 md:px-6">
        <div className="py-2 border border-secondary/15 rounded-2xl px-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-1.5 rounded-full bg-secondary/10 pl-3 pr-1 py-1 text-xs"
                >
                  <span className="truncate max-w-32">{file.name}</span>
                  <span className="text-body/70">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-secondary/20 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div>
            <MessageInput value={content} onChange={setContent} onKeyDown={handleKeyDown} />
          </div>
          <div className="flex border-t border-secondary/10 items-center pt-3 justify-between">
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || files.length >= MAX_ATTACHMENTS}
                className="p-2 hover:bg-secondary/10 rounded-full disabled:opacity-40"
              >
                <Plus size={15} />
              </button>
              <div>
                <p className="text-xs text-body">
                  {files.length}/{MAX_ATTACHMENTS} files · {content.length}/{MAX_MESSAGE_LENGTH}
                </p>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || (!content.trim() && files.length === 0)}
                className="button-primary flex items-center gap-1 disabled:opacity-50"
              >
                Send <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </>
  );
};

export default MessageThread;
