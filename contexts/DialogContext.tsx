"use client";
import React, { createContext, useCallback, useContext, useState } from "react";

export interface DialogConfig {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

interface DialogContextType {
  dialogs: DialogConfig[];
  openDialog: (type: string, props?: Record<string, unknown>) => string;
  closeDialog: (id: string) => void;
  closeAll: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogConfig[]>([]);

  const openDialog = useCallback(
    (type: string, props?: Record<string, unknown>) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      setDialogs((prev) => [...prev, { id, type, props }]);
      return id;
    },
    [],
  );

  const closeDialog = useCallback((id: string) => {
    setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setDialogs([]);
  }, []);

  return (
    <DialogContext.Provider
      value={{ dialogs, openDialog, closeDialog, closeAll }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
