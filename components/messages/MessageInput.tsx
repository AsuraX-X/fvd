"use client";

import { useRef } from "react";

const MAX_ROWS = 4;

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

const MessageInput = ({ value, onChange, onKeyDown }: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const maxHeight = lineHeight * MAX_ROWS;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  return (
    <textarea
      ref={textareaRef}
      name="message"
      id="message"
      placeholder="Write a message..."
      className="w-full p-2 focus-visible:outline-0 text-sm resize-none overflow-y-auto"
      rows={1}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onInput={handleInput}
    />
  );
};

export default MessageInput;
