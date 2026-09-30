"use client";

import {
  deleteAccount,
  removeExpertStatus,
  setOwnListing,
} from "@/app/dashboard/profile/actions";
import type { ListingStatus, Role } from "@/generated/prisma/enums";
import { SyntheticEvent, useState, useTransition } from "react";

type DangerZoneProps = {
  role: Role;
  listingStatus: ListingStatus;
};

const LISTING_DESCRIPTION: Record<ListingStatus, string> = {
  LISTED:
    "Temporarily hide your profile from the directory while you are not taking on work.",
  UNLISTED_BY_EXPERT:
    "Your profile is currently hidden from the directory. List yourself again whenever you're ready.",
  UNLISTED_BY_ADMIN:
    "An admin has unlisted your profile. Contact us to have it relisted.",
};

const DangerZone = ({ role, listingStatus }: DangerZoneProps) => {
  const isExpert = role === "EXPERT";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ row: string; message: string } | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState("");

  const run = (
    row: string,
    action: () => Promise<{ success: true } | { success: false; message: string }>,
    onSuccess?: () => void,
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError({ row, message: result.message });
      } else {
        onSuccess?.();
      }
    });
  };

  const handleListing = () =>
    run("listing", () => setOwnListing(listingStatus !== "LISTED"));

  const handleRemoveExpert = () => {
    if (
      !window.confirm(
        "Remove your expert status? Your public profile will be hidden and you'd need to re-apply.",
      )
    )
      return;
    run("expert", removeExpertStatus);
  };

  const handleDelete = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(
      "delete",
      () => deleteAccount(confirmation),
      // Full reload so the now-invalid session cookie and cached role are dropped.
      () => window.location.assign("/"),
    );
  };

  const errorFor = (row: string) =>
    error?.row === row && (
      <p className="text-xs text-[#e7000b] mt-2">{error.message}</p>
    );

  return (
    <div className="border border-red-800/50 bg-red-900/10 space-y-8 max-w-175 p-6  rounded-2xl">
      <h3 className="small-header font-body! mb-0 text-[#e7000b]">
        Danger Zone
      </h3>
      <div className="divide-y divide-red-800/50">
        <h2 className="text-xl pb-4">Account controls</h2>
        {isExpert && (
          <div className="py-4">
            <div className="flex justify-between gap-2 items-center">
              <div>
                <p className="text-sm">
                  {listingStatus === "LISTED"
                    ? "Pause my expert profile"
                    : "Your profile is unlisted"}
                </p>
                <p className="text-xs text-body">
                  {LISTING_DESCRIPTION[listingStatus]}
                </p>
              </div>
              <div>
                <button
                  onClick={handleListing}
                  disabled={isPending || listingStatus === "UNLISTED_BY_ADMIN"}
                  className="button-secondary text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {listingStatus === "LISTED" ? "Unlist me" : "List me again"}
                </button>
              </div>
            </div>
            {errorFor("listing")}
          </div>
        )}
        {isExpert && (
          <div className="py-4">
            <div className="flex justify-between gap-2 items-center">
              <div>
                <p className="text-sm">Remove my expert status</p>
                <p className="text-xs text-body">
                  Permanently removes your public profile and expert role. You
                  would need to re-apply.
                </p>
              </div>
              <div>
                <button
                  onClick={handleRemoveExpert}
                  disabled={isPending}
                  className="button-secondary border-[#e7000b] hover:bg-red-300/5 hover:border-[#e7000b] text-[#e7000b] text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove expert status
                </button>
              </div>
            </div>
            {errorFor("expert")}
          </div>
        )}
        <div className="py-4 space-y-2">
          <div>
            <p className="text-sm">Delete my account</p>
            <p className="text-xs text-body">
              Permanently deletes your account, profile, messages and saved
              experts. Reviews you&apos;ve written stay up as &quot;Former
              member&quot;. Type <span className="text-[#e7000b]">DELETE</span>{" "}
              to confirm.
            </p>
          </div>
          <form className="flex gap-4" onSubmit={handleDelete}>
            <input
              type="text"
              name="delete"
              id="delete"
              autoComplete="off"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="rounded-full border focus-visible:outline-0 focus-visible:border-[#e7000ca0] transition-colors text-sm px-4 py-1 border-red-800/25 w-full uppercase"
              placeholder="DELETE"
            />
            <button
              type="submit"
              disabled={
                isPending || confirmation.trim().toUpperCase() !== "DELETE"
              }
              className="button-primary bg-[#e7000b] border-[#e7000b] hover:bg-[#e7000c9b] hover:border-[#e7000c9b] text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </form>
          {errorFor("delete")}
        </div>
      </div>
    </div>
  );
};

export default DangerZone;
