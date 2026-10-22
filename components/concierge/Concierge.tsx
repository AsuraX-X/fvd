"use client";

import AvatarImage from "@/components/common/AvatarImage";
import { useDialog } from "@/contexts/DialogContext";
import { useRole } from "@/contexts/RoleContext";
import { CONCIERGE_MAX_MESSAGE_LENGTH } from "@/lib/concierge";
import { signInWithIntentPath } from "@/lib/terms";
import { MessageCircle, Send, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  askConcierge,
  type ConciergeExpert,
  type ConciergeReply,
} from "./actions";

type NewChatEntry =
  | { from: "user"; text: string }
  | { from: "bot"; reply: ConciergeReply | { kind: "error"; message: string } };
type ChatEntry = NewChatEntry & { id: number };

// Pages with their own fixed chat input, where a floating button would overlap.
const HIDDEN_PATH_PREFIXES = ["/admin", "/messages", "/dashboard/messages"];

const SPECIALTY_CHIPS = [
  "Illustration",
  "Animation",
  "Visual identity",
  "CGI",
  "Storyboard",
];

const Concierge = () => {
  const role = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const { openDialog } = useDialog();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"auto" | "experts">("auto");
  const [isPending, startTransition] = useTransition();
  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries, isPending]);

  if (HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const push = (...newEntries: NewChatEntry[]) =>
    setEntries((prev) => [
      ...prev,
      ...newEntries.map((entry) => ({ ...entry, id: nextId.current++ })),
    ]);

  const ask = (text: string) => {
    const message = text.trim();
    if (!message || isPending) return;
    push({ from: "user", text: message });
    setInput("");
    const askMode = mode;
    startTransition(async () => {
      const result = await askConcierge(message, askMode);
      if (!result.success) {
        push({
          from: "bot",
          reply: { kind: "error", message: result.message },
        });
        return;
      }
      // Stay in search mode only while we're still waiting for a specialty.
      setMode(result.reply.kind === "ask-specialty" ? "experts" : "auto");
      push({ from: "bot", reply: result.reply });
    });
  };

  const findExpert = () => {
    push(
      { from: "user", text: "Find an expert" },
      { from: "bot", reply: { kind: "ask-specialty" } },
    );
    setMode("experts");
  };

  // Signed-out visitors go through sign-in first; DialogIntentWatcher reopens
  // the dialog once they're back (same flow as the Footer / ApplyBtn).
  const contactUs = () => {
    setOpen(false);
    if (!role) {
      router.push(signInWithIntentPath(pathname, "contact"));
      return;
    }
    openDialog("enquiry", { briefLabel: "Message" });
  };

  const applyAsExpert = () => {
    setOpen(false);
    if (!role) {
      router.push(signInWithIntentPath(pathname, "apply"));
      return;
    }
    openDialog("apply");
  };

  const chip = (label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="rounded-full border border-secondary/20 px-3 py-1 text-xs transition-colors hover:border-secondary hover:bg-primary-light disabled:opacity-50"
    >
      {label}
    </button>
  );

  const renderReply = (
    reply: ConciergeReply | { kind: "error"; message: string },
  ) => {
    switch (reply.kind) {
      case "faq":
        return (
          <>
            <p className="font-bold">{reply.question}</p>
            <p>{reply.answer}</p>
            {reply.related.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {reply.related.map((question) =>
                  chip(question, () => ask(question)),
                )}
              </div>
            )}
          </>
        );
      case "experts":
        return (
          <>
            <p>Here are some experts who might be a good fit:</p>
            <ul className="space-y-2">
              {reply.experts.map((expert) => (
                <ExpertRow
                  key={expert.id}
                  expert={expert}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
            <Link
              href="/experts"
              onClick={() => setOpen(false)}
              className="link text-xs underline"
            >
              Browse all experts
            </Link>
          </>
        );
      case "no-experts":
        return (
          <>
            <p>
              I couldn&apos;t find a listed expert matching that. Try a
              different word (like &ldquo;animation&rdquo; or
              &ldquo;branding&rdquo;), browse the directory, or tell us what you
              need and we&apos;ll match you.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/experts"
                onClick={() => setOpen(false)}
                className="rounded-full border border-secondary/20 px-3 py-1 text-xs transition-colors hover:border-secondary hover:bg-primary-light"
              >
                Browse experts
              </Link>
              {chip("Contact us", contactUs)}
            </div>
          </>
        );
      case "ask-specialty":
        return (
          <>
            <p>
              What kind of expert are you looking for? Describe the skill or
              project.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {SPECIALTY_CHIPS.map((specialty) =>
                chip(specialty, () => ask(specialty)),
              )}
            </div>
          </>
        );
      case "fallback":
        return (
          <>
            <p>
              Sorry, I don&apos;t have an answer for that. Maybe one of these
              helps, or you can message the team directly.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {reply.suggestions.map((question) =>
                chip(question, () => ask(question)),
              )}
              {chip("Contact us", contactUs)}
            </div>
          </>
        );
      case "error":
        return <p>{reply.message}</p>;
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            aria-label="FVD concierge"
            className="fixed right-4 bottom-22 z-10 flex h-136 max-h-[calc(100dvh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-primary-light bg-primary shadow-xl sm:right-6 sm:w-96"
          >
            <header className="flex items-center justify-between border-b border-primary-light px-4 py-3">
              <div>
                <p className="text-lg italic font-display">Concierge</p>
                <p className="text-[11px] text-body">FAQs and expert search</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-body/90"
                aria-label="Close concierge"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
              <BotBubble>
                <p>
                  Hi! I can answer questions about FVD or help you find an
                  expert.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {chip("Find an expert", findExpert)}
                  {chip("How do I get paid?", () => ask("How do I get paid?"))}
                  {chip("How do I leave a review?", () =>
                    ask("How do I leave a review?"),
                  )}
                  {(role === "USER" || !role) &&
                    chip("Apply as an expert", applyAsExpert)}
                  {chip("Contact us", contactUs)}
                </div>
              </BotBubble>

              {entries.map((entry) =>
                entry.from === "user" ? (
                  <p
                    key={entry.id}
                    className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-3 py-2 text-primary"
                  >
                    {entry.text}
                  </p>
                ) : (
                  <BotBubble key={entry.id}>
                    {renderReply(entry.reply)}
                  </BotBubble>
                ),
              )}

              {isPending && (
                <BotBubble>
                  <p className="animate-pulse">…</p>
                </BotBubble>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-primary-light px-4 py-3"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={CONCIERGE_MAX_MESSAGE_LENGTH}
                placeholder={
                  mode === "experts"
                    ? "e.g. motion designer"
                    : "Ask a question…"
                }
                aria-label="Message the concierge"
                className="form-input"
              />
              <button
                type="submit"
                disabled={isPending || !input.trim()}
                aria-label="Send"
                className="button-primary p-2! disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close concierge" : "Open concierge"}
        aria-expanded={open}
        className="fixed right-4 bottom-4 z-10 flex size-14 items-center justify-center rounded-full border border-secondary bg-secondary text-primary shadow-lg transition-colors hover:bg-secondary-light sm:right-6 sm:bottom-6"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
};

const BotBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="w-fit max-w-[90%] space-y-2 rounded-2xl rounded-bl-sm bg-primary-light px-3 py-2">
    {children}
  </div>
);

const ExpertRow = ({
  expert,
  onNavigate,
}: {
  expert: ConciergeExpert;
  onNavigate: () => void;
}) => {
  const initials = expert.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const fallback = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold">
      {initials}
    </span>
  );

  return (
    <li>
      <Link
        href={`/experts/${expert.id}`}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-primary bg-primary/60 p-2 transition-colors hover:border-secondary/30"
      >
        {expert.avatar ? (
          <AvatarImage
            src={expert.avatar}
            alt={`${expert.name} photo`}
            className="size-10 shrink-0 rounded-full object-cover"
            fallback={fallback}
          />
        ) : (
          fallback
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{expert.name}</p>
          <p className="truncate text-xs text-body">
            {expert.specialty ?? expert.headline ?? "Expert"}
          </p>
        </div>
        <div className="shrink-0 text-right text-[11px] text-body">
          {expert.rating !== null && (
            <p className="flex items-center justify-end gap-0.5">
              <Star size={11} className="fill-current" />{" "}
              {expert.rating.toFixed(1)}
            </p>
          )}
          <p>
            {expert.rate
              ? `from ¢${expert.rate.toLocaleString()}`
              : "Rate on request"}
          </p>
        </div>
      </Link>
    </li>
  );
};

export default Concierge;
