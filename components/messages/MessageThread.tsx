"use client";

import { getPusherClient } from "@/lib/pusher-client";
import {
  markConversationRead,
  sendMessage,
  type MessageRow,
} from "@/app/messages/actions";
import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import Reply from "./Reply";

const MAX_MESSAGE_LENGTH = 4000;

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

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
    if (!trimmed || isPending) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticMessage: MessageRow = {
      id: tempId,
      content: trimmed,
      createdAt: new Date(),
      readAt: null,
      senderId: currentProfileId,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setContent("");
    setError(null);

    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);

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
      <div ref={listRef} className="flex-1 px-6 py-4 max-h-[80vh] overflow-scroll">
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
              <Bubble message={message.content} time={formatTime(message.createdAt)} />
            </div>
          );
        })}
      </div>
      <div className="py-3 px-6">
        <div className="py-2 border border-secondary/15 rounded-2xl px-4">
          <div>
            <MessageInput value={content} onChange={setContent} onKeyDown={handleKeyDown} />
          </div>
          <div className="flex border-t border-secondary/10 items-center pt-3 justify-between">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                disabled
                className="p-2 hover:bg-secondary/10 rounded-full disabled:opacity-40"
              >
                <Plus size={15} />
              </button>
              <div>
                <p className="text-xs text-body">
                  0/5 files · {content.length}/{MAX_MESSAGE_LENGTH}
                </p>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || !content.trim()}
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
