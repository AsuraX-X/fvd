"use client";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ApplyBtn = () => {
  return (
    <motion.button
      whileHover={{ width: "190px" }}
      transition={{ type: "spring", duration: 0.4, stiffness: 150 }}
      className="flex items-center justify-between gap-1 text-nowrap button-secondary"
    >
      Apply as an expert <ArrowRight size={16} />
    </motion.button>
  );
};

export default ApplyBtn;
