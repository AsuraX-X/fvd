"use client";
import { X } from "lucide-react";
import { motion } from "motion/react";
import ApplyForm from "./ApplyForm";

const ApplyDialog = ({ close }: { close: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed flex justify-center items-center z-10 inset-0 bg-black/10 backdrop-blur-2xl"
    >
      <div className="bg-primary py-4 px-6 h-full w-full sm:w-auto sm:h-auto flex flex-col justify-center sm:rounded-2xl border border-primary-light">
        <div className="flex justify-between w-full items-center">
          <p className="small-header mb-0">Apply to join</p>{" "}
          <button className="text-body/90" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <h2 className="text-4xl italic mb-6 w-full">Join the expert network</h2>
        <ApplyForm />
      </div>
    </motion.div>
  );
};

export default ApplyDialog;
