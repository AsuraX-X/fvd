"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ToggleSavedExpertState =
  | { success: true; saved: boolean }
  | { success: false; message: string };

export async function toggleSavedExpert(
  expertId: string,
): Promise<ToggleSavedExpertState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      success: false,
      message: "You must be signed in to save experts.",
    };
  }

  const existing = await prisma.savedExpert.findUnique({
    where: { userId_expertId: { userId: session.user.id, expertId } },
  });

  if (existing) {
    await prisma.savedExpert.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedExpert.create({
      data: { userId: session.user.id, expertId },
    });
  }

  revalidatePath("/experts");
  revalidatePath(`/experts/${expertId}`);
  revalidatePath("/dashboard/experts");

  return { success: true, saved: !existing };
}
