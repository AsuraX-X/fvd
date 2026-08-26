"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export type ApplyFormState = {
  success: boolean;
  message: string;
} | null;

type LinkRow = { label: string; url: string };

function parseLinkRows(formData: FormData): LinkRow[] {
  const rows = new Map<number, Partial<LinkRow>>();
  const pattern = /^links\[(\d+)\]\[(label|url)\]$/;

  for (const [key, value] of formData.entries()) {
    const match = key.match(pattern);
    if (!match) continue;

    const index = Number(match[1]);
    const field = match[2] as keyof LinkRow;
    const row = rows.get(index) ?? {};
    row[field] = String(value).trim();
    rows.set(index, row);
  }

  return Array.from(rows.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, row]) => row)
    .filter((row): row is LinkRow => Boolean(row.label && row.url));
}

export async function submitApplication(
  _prevState: ApplyFormState,
  formData: FormData,
): Promise<ApplyFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const specialty = String(formData.get("specialty") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const portfolioUrl = String(formData.get("portfolioUrl") || "").trim();

  if (!name || !email || !specialty || !bio) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const session = await auth.api.getSession({ headers: await headers() });

  const existing = session
    ? await prisma.application.findFirst({
        where: { userId: session.user.id },
      })
    : await prisma.application.findFirst({ where: { email, userId: null } });

  if (existing) {
    return {
      success: false,
      message: "You've already submitted an application.",
    };
  }

  const links = parseLinkRows(formData);

  await prisma.application.create({
    data: {
      name,
      email,
      specialty,
      bio,
      portfolioUrl: portfolioUrl || null,
      userId: session?.user.id,
      links: {
        create: links.map((link, index) => ({ ...link, order: index })),
      },
    },
  });

  return {
    success: true,
    message: "Thanks for applying — we'll be in touch soon.",
  };
}
