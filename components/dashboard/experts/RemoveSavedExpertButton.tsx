"use client";

import { toggleSavedExpert } from "@/app/experts/actions";
import { useTransition } from "react";

const RemoveSavedExpertButton = ({ expertId }: { expertId: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleSavedExpert(expertId);
        })
      }
      className="text-body hover:text-red-400 transition-colors"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
};

export default RemoveSavedExpertButton;
