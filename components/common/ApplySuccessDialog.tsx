"use client";
import { X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const ApplySuccessDialog = ({ close }: { close: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed flex justify-center items-center z-20 inset-0 bg-black/10 backdrop-blur-2xl"
    >
      <div className="bg-primary py-4 px-6 h-full w-full sm:w-auto sm:h-auto sm:max-w-100 flex flex-col justify-center sm:rounded-2xl border border-primary-light">
        <div className="flex justify-between w-full items-center">
          <p className="small-header mb-0">Application submitted</p>
          <button className="text-body/90" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <h2 className="text-4xl italic mb-6 w-full">You&apos;re in the queue</h2>
        <p className="text-sm text-body mb-6">
          Thanks for applying. We&apos;ll review your application and be in
          touch soon. You can check its status anytime from your dashboard.
        </p>
        <Link
          href="/dashboard/application"
          onClick={close}
          className="button-primary w-full text-center"
        >
          Done
        </Link>
      </div>
    </motion.div>
  );
};

export default ApplySuccessDialog;
