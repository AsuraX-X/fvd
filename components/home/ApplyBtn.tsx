"use client";
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
  return (
    <motion.button
      initial={{ width }}
      whileHover={{ width: width && width + 10 }}
      transition={{ type: "spring", duration: 0.4, stiffness: 150 }}
      className={`flex items-center justify-between gap-1 text-nowrap ${variant === "secondary" ? "button-secondary" : "button-primary"}`}
    >
      {content} <ArrowRight size={16} />
    </motion.button>
  );
};

export default ApplyBtn;
