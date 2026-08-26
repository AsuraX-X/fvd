"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type SetUserRoleState =
  | { success: true }
  | { success: false; message: string };

export async function setUserRole(
  profileId: string,
  role: Role,
): Promise<SetUserRoleState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const callerProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, role: true },
  });

  if (callerProfile?.role !== "ADMIN") {
    return { success: false, message: "You must be an admin to do that." };
  }

  if (callerProfile.id === profileId && role !== "ADMIN") {
    return {
      success: false,
      message: "You can't revoke your own admin access.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    return { success: false, message: "User not found." };
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/experts");
  revalidatePath("/admin/overview");
  revalidatePath("/experts");
  revalidatePath(`/experts/${profileId}`);
  revalidatePath("/dashboard/experts");

  return { success: true };
}
