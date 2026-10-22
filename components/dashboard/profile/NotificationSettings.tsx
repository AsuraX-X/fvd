"use client";

import { setMessageEmailNotifications } from "@/app/dashboard/profile/actions";
import { useState, useTransition } from "react";

const NotificationSettings = ({
  messageEmails,
}: {
  messageEmails: boolean;
}) => {
  const [enabled, setEnabled] = useState(messageEmails);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      const result = await setMessageEmailNotifications(next);
      if (!result.success) {
        setEnabled(!next);
        setError(result.message);
      }
    });
  };

  return (
    // Linked from the footer of "new message" emails.
    <div
      id="notifications"
      className="border border-primary-light space-y-4 max-w-175 p-6 rounded-2xl scroll-mt-24"
    >
      <h2 className="text-xl">Email notifications</h2>
      <div className="flex justify-between gap-4 items-center">
        <label htmlFor="message-emails" className="cursor-pointer">
          <p className="text-sm">New messages</p>
          <p className="text-xs text-body">
            Email me when someone messages me and I haven&apos;t read it yet.
            Account and application emails are always sent.
          </p>
        </label>
        <button
          id="message-emails"
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={isPending}
          className={`relative shrink-0 h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${enabled ? "bg-secondary" : "bg-primary-lighter/50"}`}
        >
          <span
            className={`absolute top-1 left-1 size-4 rounded-full bg-primary transition-transform ${enabled ? "translate-x-5" : ""}`}
          />
        </button>
      </div>
      {error && <p className="text-xs text-[#e7000b]">{error}</p>}
    </div>
  );
};

export default NotificationSettings;
