"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type RevokeExpertState =
  | { success: true }
  | { success: false; message: string };

export async function revokeExpert(
  profileId: string,
): Promise<RevokeExpertState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.emailVerified) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const callerProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (callerProfile?.role !== "ADMIN") {
    return { success: false, message: "You must be an admin to do that." };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    return { success: false, message: "Expert not found." };
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { role: "USER" },
  });

  revalidatePath("/admin/experts");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/users");
  revalidatePath("/experts");
  revalidatePath(`/experts/${profileId}`);
  revalidatePath("/dashboard/experts");

  return { success: true };
}
