"use server";

import { REVIEW_MAX_LENGTH } from "@/constants";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { isPublicExpert } from "@/lib/experts";
import { prisma } from "@/lib/prisma";
import { hasAcceptedTerms, TERMS_REQUIRED_MESSAGE } from "@/lib/terms";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ToggleSavedExpertState =
  | { success: true; saved: boolean }
  | { success: false; message: string };

export async function toggleSavedExpert(
  expertId: string,
): Promise<ToggleSavedExpertState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.emailVerified) {
    return {
      success: false,
      message: "You must be signed in to save experts.",
    };
  }

  if (!hasAcceptedTerms(session.user)) {
    return { success: false, message: TERMS_REQUIRED_MESSAGE };
  }

  const existing = await prisma.savedExpert.findUnique({
    where: { userId_expertId: { userId: session.user.id, expertId } },
  });

  if (existing) {
    await prisma.savedExpert.delete({ where: { id: existing.id } });
  } else {
    const expert = await prisma.profile.findUnique({
      where: { id: expertId },
      select: { role: true, listingStatus: true },
    });

    if (!expert || !isPublicExpert(expert)) {
      return { success: false, message: "Expert not found." };
    }

    await prisma.savedExpert.create({
      data: { userId: session.user.id, expertId },
    });
  }

  revalidatePath("/experts");
  revalidatePath(`/experts/${expertId}`);
  revalidatePath("/dashboard/experts");

  return { success: true, saved: !existing };
}

export type SubmitReviewState = {
  success: boolean;
  message: string;
};

export async function submitReview(
  _prevState: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.emailVerified) {
    return {
      success: false,
      message: "You must be signed in to leave a review.",
    };
  }

  if (!hasAcceptedTerms(session.user)) {
    return { success: false, message: TERMS_REQUIRED_MESSAGE };
  }

  const expertId = formData.get("expertId");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (typeof expertId !== "string" || !expertId) {
    return { success: false, message: "Missing expert." };
  }

  if (expertId === session.user.id) {
    return { success: false, message: "You can't review yourself." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, message: "Please pick a rating from 1 to 5." };
  }

  if (!comment) {
    return { success: false, message: "Please write a review." };
  }

  if (comment.length > REVIEW_MAX_LENGTH) {
    return {
      success: false,
      message: `Reviews can be at most ${REVIEW_MAX_LENGTH} characters.`,
    };
  }

  const expert = await prisma.profile.findUnique({
    where: { id: expertId },
    select: { role: true, listingStatus: true },
  });

  if (!expert || !isPublicExpert(expert)) {
    return { success: false, message: "Expert not found." };
  }

  // Try to create first; a unique-constraint hit means the user already
  // reviewed this expert, so update instead. Avoids a separate existence check.
  let updated = false;
  try {
    await prisma.review.create({
      data: { userId: session.user.id, expertId, rating, comment },
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
    await prisma.review.update({
      where: { userId_expertId: { userId: session.user.id, expertId } },
      data: { rating, comment },
    });
    updated = true;
  }

  revalidatePath(`/experts/${expertId}`);

  return {
    success: true,
    message: updated
      ? "Your review has been updated."
      : "Thanks for your review!",
  };
}
