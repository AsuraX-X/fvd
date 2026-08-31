"use client";

import { setUserRole } from "@/app/admin/users/actions";
import { Role } from "@/generated/prisma/client";
import Link from "next/link";
import { useState, useTransition } from "react";

const UserCard = ({
  id,
  name,
  email,
  role,
}: {
  id: string;
  name: string;
  email: string;
  role: "admin" | "expert" | "user";
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const changeRole = (nextRole: Role) => {
    setError("");
    startTransition(async () => {
      const result = await setUserRole(id, nextRole);
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="text-sm bg-primary-light p-4 rounded-2xl space-y-2">
      <div className="flex justify-between gap-2 flex-col md:flex-row md:items-center">
        <div className="flex flex-1 justify-between items-center">
          <div>
            <p>{name}</p>
            <p className="text-xs text-body">{email}</p>
          </div>
          <div className="uppercase px-2 py-1 rounded-full text-xs bg-secondary/10">
            {role}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/messages/${id}`}>
            <button className="button-secondary px-2 py-1.5 text-xs">
              Message
            </button>
          </Link>
          {role !== "admin" && (
            <button
              disabled={isPending}
              onClick={() => changeRole(role === "expert" ? "USER" : "EXPERT")}
              className={`button-secondary px-2 py-1.5 text-xs disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed ${role === "expert" && "hover:text-[#ffa2a2] hover:border-[#ff6467] transition-colors"}`}
            >
              {role === "expert" ? "Revoke expert" : "Make expert"}
            </button>
          )}
          <button
            disabled={isPending}
            onClick={() => changeRole(role === "admin" ? "USER" : "ADMIN")}
            className={`button-secondary px-2 py-1.5 text-xs disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed ${role === "admin" && "hover:text-[#ffa2a2] hover:border-[#ff6467] transition-colors"}`}
          >
            {" "}
            {role === "admin" ? "Revoke Admin" : "Make admin"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-[#ffa2a2] text-right">{error}</p>}
    </div>
  );
};

export default UserCard;
