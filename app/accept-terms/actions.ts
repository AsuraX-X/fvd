"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeNextPath, TERMS_VERSION } from "@/lib/terms";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AcceptTermsState = { success: boolean; message: string };

export async function acceptTerms(
  _prevState: AcceptTermsState,
  formData: FormData,
): Promise<AcceptTermsState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false, message: "You must be signed in to do that." };
  }

  if (formData.get("accept") !== "on") {
    return {
      success: false,
      message: "Tick the box to accept the Terms and Privacy Policy.",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { termsVersion: TERMS_VERSION, termsAcceptedAt: new Date() },
  });

  revalidatePath("/", "layout");
  redirect(safeNextPath(formData.get("next")));
}
