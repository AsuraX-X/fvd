"use client";

import { motion } from "motion/react";

const InboxEntry = ({
  name,
  lastMessage,
  date,
  active = false,
}: {
  name: string;
  lastMessage: string;
  date: string;
  active?: boolean;
}) => {
  return (
    <motion.div
      whileHover={{
        backgroundColor: active ? "#303030" : "#252525",
      }}
      animate={{
        backgroundColor: active ? "#303030" : "#3030300",
      }}
      className="text-xs p-4 cursor-pointer"
    >
      <div className="flex items-center text-secondary/50 justify-between">
        <p className="font-medium text-sm">{name}</p>
        <p className="text-body">{date}</p>
      </div>
      <p className="text-body">{lastMessage}</p>
    </motion.div>
  );
};

export default InboxEntry;
