"use client";

import {
  archiveEnquiry,
  deleteEnquiry,
  markEnquiryRead,
} from "@/app/admin/enquiries/actions";
import { useState, useTransition } from "react";

const EnquiryCard = ({
  id,
  name,
  email,
  brief,
  status,
  date,
}: {
  id: string;
  name: string;
  email: string;
  brief: string;
  status: "new" | "read" | "archived";
  date: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);

  const handleMarkRead = () => {
    setError("");
    startTransition(async () => {
      const result = await markEnquiryRead(id);
      if (!result.success) setError(result.message);
    });
  };

  const handleArchive = () => {
    setError("");
    startTransition(async () => {
      const result = await archiveEnquiry(id);
      if (!result.success) setError(result.message);
    });
  };

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const result = await deleteEnquiry(id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setDeleted(true);
    });
  };

  if (deleted) return null;

  return (
    <div className="text-sm bg-primary-light p-4 rounded-2xl space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <p className="font-bold">{name}</p>
          <div className="flex items-center gap-2">
            <p className="uppercase px-2 py-1 rounded-full text-xs bg-secondary/10">
              {status}
            </p>
            <p className="text-xs text-body">{date}</p>
          </div>
        </div>
        <p className="text-xs text-body">{email}</p>
      </div>
      <div>{brief}</div>
      <div className="flex items-center gap-2">
        <a href={`mailto:${email}`}>
          <button className="button-primary px-2 py-1.5 text-xs">
            Reply by email
          </button>
        </a>
        {(status === "new" || status === "archived") && (
          <button
            onClick={handleMarkRead}
            disabled={isPending}
            className="button-secondary px-2 py-1.5 text-xs disabled:opacity-50"
          >
            Mark as read
          </button>
        )}
        {(status === "new" || status === "read") && (
          <button
            onClick={handleArchive}
            disabled={isPending}
            className="button-secondary px-2 py-1.5 text-xs disabled:opacity-50"
          >
            Archive
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="button-secondary px-2 py-1.5 text-xs hover:text-[#ffa2a2] hover:border-[#ff6467] transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-[#ffa2a2]">{error}</p>}
    </div>
  );
};

export default EnquiryCard;
