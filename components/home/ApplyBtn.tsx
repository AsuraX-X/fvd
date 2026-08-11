"use client";
import { useDialog } from "@/contexts/DialogContext";
import { useRole } from "@/contexts/RoleContext";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ApplyBtn = ({
  content,
  variant,
  width,
}: {
  content: string;
  variant?: "primary" | "secondary";
  width?: number;
}) => {
  const { openDialog } = useDialog();
  const role = useRole();

  if (role === "EXPERT" || role === "ADMIN") return null;

  return (
    <motion.button
      initial={{ width }}
      whileHover={{ width: width && width + 10 }}
      transition={{ type: "spring", duration: 0.4, stiffness: 150 }}
      className={`flex items-center justify-between gap-1 text-nowrap ${variant === "secondary" ? "button-secondary" : "button-primary"}`}
      onClick={() => openDialog("apply")}
    >
      {content} <ArrowRight size={16} />
    </motion.button>
  );
};

export default ApplyBtn;
