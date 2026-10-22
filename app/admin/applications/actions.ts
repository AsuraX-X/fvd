"use server";

import { auth } from "@/lib/auth";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendInBackground,
} from "@/lib/emails";
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

  // Conditional on the current status so a double-click (or two admins at
  // once) only emails the applicant on the first transition.
  const { count } = await prisma.application.updateMany({
    where: { id: applicationId, status: { not: "APPROVED" } },
    data: { status: "APPROVED" },
  });

  if (count > 0) {
    sendInBackground(() =>
      sendApplicationApprovedEmail({
        name: application.name,
        email: application.email,
        hasAccount: Boolean(application.userId),
      }),
    );
  }

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

  const { count } = await prisma.application.updateMany({
    where: { id: applicationId, status: { not: "REJECTED" } },
    data: { status: "REJECTED" },
  });

  if (count > 0) {
    sendInBackground(() =>
      sendApplicationRejectedEmail({
        name: application.name,
        email: application.email,
      }),
    );
  }

  revalidateApplicationPaths();

  return { success: true };
}
