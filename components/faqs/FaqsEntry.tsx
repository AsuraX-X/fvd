"use client";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const FaqsEntry = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className=" border border-primary-light bg-primary/70 p-6 transition-colors duration-300 hover:bg-primary-light"
    >
      <div className="flex cursor-pointer list-none items-start justify-between gap-2 sm:gap-6">
        <h2 className="sm:text-xl text-sm font-body! leading-tight">{question}</h2>
        <div>
          <Plus />
        </div>
      </div>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <p className="mt-4 max-w-[60ch] text-sm leading-7 text-body">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};

export default FaqsEntry;
