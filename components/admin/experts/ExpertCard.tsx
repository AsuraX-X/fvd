"use client";

import { revokeExpert } from "@/app/admin/experts/actions";
import Link from "next/link";
import { useState, useTransition } from "react";

const ExpertCard = ({
  name,
  email,
  specialty,
  bio,
  id,
}: {
  name: string;
  email: string;
  specialty: string;
  bio: string;
  id: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleRevoke = () => {
    setError("");
    startTransition(async () => {
      const result = await revokeExpert(id);
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="text-sm bg-primary-light w-full space-y-3 p-4 rounded-2xl">
      <div>
        <p>{name}</p>
        <p className="text-body text-xs">
          {email} · {specialty}
        </p>
      </div>
      <div>
        <p>{bio}</p>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <Link href={`/experts/${id}`}>
            <button className="button-secondary text-xs px-2 py-1.5">
              View profile
            </button>
          </Link>
          <Link href={`/messages/${id}`}>
            <button className="button-primary text-xs px-2 py-1.5">
              Message
            </button>
          </Link>
          <button
            onClick={handleRevoke}
            disabled={isPending}
            className="button-secondary hover:text-[#ffa2a2] hover:border-[#ff6467] transition-colors text-xs px-2 py-1.5 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Revoke Expert
          </button>
        </div>
        {error && <p className="text-xs text-[#ffa2a2]">{error}</p>}
      </div>
    </div>
  );
};

export default ExpertCard;
