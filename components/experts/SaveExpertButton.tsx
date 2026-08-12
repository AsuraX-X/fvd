"use client";

import { toggleSavedExpert } from "@/app/experts/actions";
import { Star } from "lucide-react";
import { useState, useTransition } from "react";

interface SaveExpertButtonProps {
  expertId: string;
  initialSaved: boolean;
  className?: string;
  size?: number;
  showLabel?: boolean;
}

const SaveExpertButton = ({
  expertId,
  initialSaved,
  className,
  size = 16,
  showLabel = false,
}: SaveExpertButtonProps) => {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const optimisticSaved = !saved;
    setSaved(optimisticSaved);

    startTransition(async () => {
      const result = await toggleSavedExpert(expertId);
      setSaved(result.success ? result.saved : !optimisticSaved);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      <Star size={size} fill={saved ? "currentColor" : "none"} />
      {showLabel && (saved ? "Saved" : "Save")}
    </button>
  );
};

export default SaveExpertButton;
