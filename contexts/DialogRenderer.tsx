"use client";
import ApplyDialog from "@/components/common/ApplyDialog";
import ApplySuccessDialog from "@/components/common/ApplySuccessDialog";
import EmailVerifiedDialog from "@/components/common/EmailVerifiedDialog";
import EnquiryDialog from "@/components/common/EnquiryDialog";
import EnquirySuccessDialog from "@/components/common/EnquirySuccessDialog";
import { AnimatePresence } from "motion/react";
import { useDialog } from "./DialogContext";

export interface DialogProps {
  close: () => void;
  [key: string]: unknown;
}

// Map dialog types to their components
const DIALOG_COMPONENTS: Record<string, React.ComponentType<DialogProps>> = {
  apply: ApplyDialog as React.ComponentType<DialogProps>,
  "apply-success": ApplySuccessDialog as React.ComponentType<DialogProps>,
  "email-verified": EmailVerifiedDialog as React.ComponentType<DialogProps>,
  enquiry: EnquiryDialog as React.ComponentType<DialogProps>,
  "enquiry-success": EnquirySuccessDialog as React.ComponentType<DialogProps>,
  // Add more dialog types here as needed
};

export const DialogRenderer = () => {
  const { dialogs, closeDialog } = useDialog();

  return (
    <AnimatePresence>
      {dialogs.map((dialog) => {
        const DialogComponent = DIALOG_COMPONENTS[dialog.type];

        if (!DialogComponent) {
          console.warn(`Dialog type "${dialog.type}" not found`);
          return null;
        }

        return (
          <DialogComponent
            key={dialog.id}
            {...(dialog.props || {})}
            close={() => closeDialog(dialog.id)}
          />
        );
      })}
    </AnimatePresence>
  );
};
