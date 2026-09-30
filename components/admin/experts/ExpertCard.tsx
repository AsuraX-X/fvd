"use client";

import { revokeExpert, setExpertListing } from "@/app/admin/experts/actions";
import type { ListingStatus } from "@/generated/prisma/enums";
import Link from "next/link";
import { useState, useTransition } from "react";

const LISTING_LABEL: Record<ListingStatus, string> = {
  LISTED: "Listed",
  UNLISTED_BY_EXPERT: "Paused by expert",
  UNLISTED_BY_ADMIN: "Unlisted by admin",
};

const ExpertCard = ({
  name,
  email,
  specialty,
  bio,
  id,
  listingStatus,
}: {
  name: string;
  email: string;
  specialty: string;
  bio: string;
  id: string;
  listingStatus: ListingStatus;
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const unlistedByAdmin = listingStatus === "UNLISTED_BY_ADMIN";

  const handleRevoke = () => {
    setError("");
    startTransition(async () => {
      const result = await revokeExpert(id);
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  const handleListing = () => {
    setError("");
    startTransition(async () => {
      const result = await setExpertListing(id, unlistedByAdmin);
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="text-sm bg-primary-light w-full space-y-3 p-4 rounded-2xl">
      <div className="flex justify-between gap-2 items-start">
        <div>
          <p>{name}</p>
          <p className="text-body text-xs">
            {email} · {specialty}
          </p>
        </div>
        <p
          className={`rounded-full border shrink-0 py-0.5 px-2 uppercase text-[10px] ${
            listingStatus === "LISTED"
              ? "border-secondary/20"
              : "border-[#ff6467] text-[#ffa2a2]"
          }`}
        >
          {LISTING_LABEL[listingStatus]}
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
            onClick={handleListing}
            disabled={isPending}
            className="button-secondary text-xs px-2 py-1.5 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {unlistedByAdmin ? "Relist" : "Unlist"}
          </button>
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
