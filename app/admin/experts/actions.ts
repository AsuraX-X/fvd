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

export type SetExpertListingState =
  | { success: true }
  | { success: false; message: string };

// Admin unlist → UNLISTED_BY_ADMIN (from LISTED or UNLISTED_BY_EXPERT, so an
// admin can lock in a self-paused expert). Admin relist only clears
// UNLISTED_BY_ADMIN — it never overrides an expert's own decision to pause.
export async function setExpertListing(
  profileId: string,
  listed: boolean,
): Promise<SetExpertListingState> {
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

  const { count } = await prisma.profile.updateMany({
    where: listed
      ? { id: profileId, role: "EXPERT", listingStatus: "UNLISTED_BY_ADMIN" }
      : {
          id: profileId,
          role: "EXPERT",
          listingStatus: { not: "UNLISTED_BY_ADMIN" },
        },
    data: { listingStatus: listed ? "LISTED" : "UNLISTED_BY_ADMIN" },
  });

  if (count === 0) {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { role: true, listingStatus: true },
    });

    if (profile?.role !== "EXPERT") {
      return { success: false, message: "Expert not found." };
    }

    if (listed && profile.listingStatus === "UNLISTED_BY_EXPERT") {
      return {
        success: false,
        message: "This expert unlisted themselves — only they can relist.",
      };
    }

    // Otherwise it was already in the requested state.
  }

  revalidatePath("/");
  revalidatePath("/experts");
  revalidatePath(`/experts/${profileId}`);
  revalidatePath("/admin/experts");
  revalidatePath("/dashboard", "layout");

  return { success: true };
}
