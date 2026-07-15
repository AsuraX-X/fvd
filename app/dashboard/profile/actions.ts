"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ProfileFormState = {
  success: boolean;
  message: string;
} | null;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  const firstName = String(formData.get("firstName") || "").trim();
  const surname = String(formData.get("surname") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const headline = String(formData.get("headline") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  if (!firstName || !surname) {
    return {
      success: false,
      message: "First name and surname are required.",
    };
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      firstName,
      surname,
      location: location || null,
      headline: headline || null,
      website: website || null,
      bio: bio || null,
    },
  });

  revalidatePath("/dashboard/profile");

  return { success: true, message: "Profile updated." };
}
