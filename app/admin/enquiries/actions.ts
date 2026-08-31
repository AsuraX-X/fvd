"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type EnquiryActionState =
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

function revalidateEnquiryPaths() {
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/overview");
}

export async function markEnquiryRead(
  enquiryId: string,
): Promise<EnquiryActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
  });

  if (!enquiry) {
    return { success: false, message: "Enquiry not found." };
  }

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { status: "READ" },
  });

  revalidateEnquiryPaths();

  return { success: true };
}

export async function archiveEnquiry(
  enquiryId: string,
): Promise<EnquiryActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
  });

  if (!enquiry) {
    return { success: false, message: "Enquiry not found." };
  }

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { status: "ARCHIVED" },
  });

  revalidateEnquiryPaths();

  return { success: true };
}

export async function deleteEnquiry(
  enquiryId: string,
): Promise<EnquiryActionState> {
  const session = await requireAdmin();

  if (!session) {
    return { success: false, message: "You must be an admin to do that." };
  }

  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
  });

  if (!enquiry) {
    return { success: false, message: "Enquiry not found." };
  }

  await prisma.enquiry.delete({ where: { id: enquiryId } });

  revalidateEnquiryPaths();

  return { success: true };
}
