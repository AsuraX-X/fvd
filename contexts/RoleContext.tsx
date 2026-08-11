"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Role = "ADMIN" | "EXPERT" | "USER" | null;

const RoleContext = createContext<Role>(null);

export const RoleProvider = ({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) => <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;

export const useRole = () => useContext(RoleContext);
