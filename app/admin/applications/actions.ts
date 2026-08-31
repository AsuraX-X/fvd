"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ApplicationActionState =
  | { success: true }
  | { success: false; message: string };

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.emailVerified) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  return profile?.role === "ADMIN" ? session : null;
}

function revalidateApplicationPaths() {
  revalidatePath("/admin/applications");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/experts");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard/application");
  revalidatePath("/experts");
}

export async function approveApplication(
  applicationId: string,
): Promise<ApplicationActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    return { success: false, message: "Application not found." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "APPROVED" },
  });

  if (application.userId) {
    const profile = await prisma.profile.findUnique({
      where: { userId: application.userId },
    });

    if (profile) {
      await prisma.profile.update({
        where: { userId: application.userId },
        data: {
          role: "EXPERT",
          specialty: profile.specialty ?? application.specialty,
          bio: profile.bio ?? application.bio,
          website: profile.website ?? application.portfolioUrl ?? undefined,
        },
      });
    }
  }

  revalidateApplicationPaths();

  return { success: true };
}

export async function rejectApplication(
  applicationId: string,
): Promise<ApplicationActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    return { success: false, message: "Application not found." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  revalidateApplicationPaths();

  return { success: true };
}
