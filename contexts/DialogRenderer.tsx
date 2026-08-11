"use client";
import ApplyDialog from "@/components/common/ApplyDialog";
import { AnimatePresence } from "motion/react";
import { useDialog } from "./DialogContext";

export interface DialogProps {
  close: () => void;
  [key: string]: unknown;
}

// Map dialog types to their components
const DIALOG_COMPONENTS: Record<string, React.ComponentType<DialogProps>> = {
  apply: ApplyDialog as React.ComponentType<DialogProps>,
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
