"use client";

import { approveApplication, rejectApplication } from "@/app/admin/applications/actions";
import { ArrowUpRight } from "lucide-react";
import { useState, useTransition } from "react";

const ApplicationEntry = ({
  id,
  name,
  status,
  email,
  specialty,
  bio,
  links,
  portfolioUrl,
}: {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  email: string;
  specialty: string;
  bio: string;
  links: { name: string; link: string }[];
  portfolioUrl?: string | null;
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleApprove = () => {
    setError("");
    startTransition(async () => {
      const result = await approveApplication(id);
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  const handleReject = () => {
    setError("");
    startTransition(async () => {
      const result = await rejectApplication(id);
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="text-sm space-y-4 bg-primary-light p-6 rounded-2xl">
      <div>
        <div className="flex justify-between">
          <h2 className="font-body! font-bold ">{name}</h2>
          <div
            className={`uppercase px-2 py-1 rounded-full text-xs ${status === "pending" ? "bg-secondary/10" : status == "approved" ? "bg-[#10231f] text-[#5ee9b5]" : "bg-[#2a1418] text-[#ffa2a2]"}`}
          >
            {status}
          </div>
        </div>
        <p className="text-xs text-body">
          {email} · {specialty}
        </p>
      </div>
      <p>{bio}</p>
      <div className="flex gap-2">
        {links.map((link, i) => (
          <a
            href={link.link}
            key={i}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body hover:text-secondary transition-colors text-xs flex items-center gap-1"
          >
            {link.name} <ArrowUpRight size={16} />
          </a>
        ))}

        {portfolioUrl && (
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body hover:text-secondary transition-colors text-xs flex items-center gap-1"
          >
            Portfolio
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
      <div className="space-y-2">
        <div className="space-x-4">
          <button
            onClick={handleApprove}
            disabled={isPending || status === "approved"}
            className="button-primary bg-[#04ae79] border-[#04ae79] hover:opacity-90 hover:bg-[#04ae79] hover:border-[#04ae79] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={isPending || status === "rejected"}
            className="button-secondary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
        {error && <p className="text-xs text-[#ffa2a2]">{error}</p>}
      </div>
    </div>
  );
};

export default ApplicationEntry;
