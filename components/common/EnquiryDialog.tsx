"use client";
import { X } from "lucide-react";
import { motion } from "motion/react";
import EnquiryForm from "./EnquiryForm";

const EnquiryDialog = ({
  close,
  briefLabel,
}: {
  close: () => void;
  briefLabel?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed flex justify-center items-center z-10 inset-0 bg-black/10 backdrop-blur-2xl"
    >
      <div className="bg-primary relative overflow-hidden h-full w-full sm:w-auto sm:h-auto sm:flex-row flex-col flex gap-8  sm:rounded-2xl border border-primary-light">
        <button className="text-body/90 absolute top-4 right-4" onClick={close}>
          <X size={20} />
        </button>
        <div className="px-6 pt-10 pb-4">
          <h2 className="text-4xl italic mb-6 w-full">Get in the loop</h2>
          <p className="text-sm max-w-[24ch] text-body">
            Share your vision with us and our strategists will reach out within
            24 hours.
          </p>
        </div>
        <div className="bg-primary-light h-full flex-1 place-content-center  px-6 pt-10 pb-4">
          <EnquiryForm close={close} briefLabel={briefLabel} />
        </div>
      </div>
    </motion.div>
  );
};

export default EnquiryDialog;
