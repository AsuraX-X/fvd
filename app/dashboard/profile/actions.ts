"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ProfileFormState = {
  success: boolean;
  message: string;
} | null;

type BaseProfileFields = {
  firstName: string;
  surname: string;
  location: string | null;
  headline: string | null;
  website: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

type ParseResult =
  | { ok: true; data: BaseProfileFields }
  | { ok: false; message: string };

function parseBaseProfileFields(formData: FormData): ParseResult {
  const firstName = String(formData.get("firstName") || "").trim();
  const surname = String(formData.get("surname") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const headline = String(formData.get("headline") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const avatarUrl = String(formData.get("avatarUrl") || "").trim();

  if (!firstName || !surname) {
    return { ok: false, message: "First name and surname are required." };
  }

  return {
    ok: true,
    data: {
      firstName,
      surname,
      location: location || null,
      headline: headline || null,
      website: website || null,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
    },
  };
}

type LinkRow = { label?: string; url?: string };
type ProjectRow = { title?: string; url?: string; imageUrl?: string };

function parseIndexedRows(
  formData: FormData,
  prefix: "links" | "projects",
): Map<number, LinkRow | ProjectRow> {
  const rows = new Map<number, LinkRow | ProjectRow>();
  const pattern = new RegExp(`^${prefix}\\[(\\d+)\\]\\[(\\w+)\\]$`);

  for (const [key, value] of formData.entries()) {
    const match = key.match(pattern);
    if (!match) continue;

    const index = Number(match[1]);
    const field = match[2];
    const row = rows.get(index) ?? {};
    (row as Record<string, string>)[field] = String(value).trim();
    rows.set(index, row);
  }

  return rows;
}

function sortedRows<T>(rows: Map<number, T>): T[] {
  return Array.from(rows.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, row]) => row);
}

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

  const parsed = parseBaseProfileFields(formData);
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }

  await prisma.$transaction([
    prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        firstName: parsed.data.firstName,
        surname: parsed.data.surname,
        location: parsed.data.location,
        headline: parsed.data.headline,
        website: parsed.data.website,
        bio: parsed.data.bio,
        avatar: parsed.data.avatarUrl,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: `${parsed.data.firstName} ${parsed.data.surname}`.trim(),
        image: parsed.data.avatarUrl,
      },
    }),
  ]);

  revalidatePath("/dashboard/profile");

  return { success: true, message: "Profile updated." };
}

export async function updateExpertProfile(
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

  const parsed = parseBaseProfileFields(formData);
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }

  const specialty = String(formData.get("specialty") || "").trim();

  const rateInput = String(formData.get("rate") || "").trim();
  let rate: number | null = null;
  if (rateInput) {
    rate = Number(rateInput);
    if (!Number.isInteger(rate) || rate < 0) {
      return { success: false, message: "Rate must be a positive number." };
    }
  }

  const linkRows = sortedRows(parseIndexedRows(formData, "links")) as LinkRow[];
  const links: { label: string; url: string }[] = [];
  for (const row of linkRows) {
    const label = row.label ?? "";
    const url = row.url ?? "";
    if (!label && !url) continue;
    if (!label || !url) {
      return {
        success: false,
        message: "Each link needs both a label and a URL.",
      };
    }
    links.push({ label, url });
  }

  const projectRows = sortedRows(
    parseIndexedRows(formData, "projects"),
  ) as ProjectRow[];

  if (projectRows.length > 6) {
    return { success: false, message: "You can select up to 6 projects." };
  }

  const projects: { title: string; url: string; imageUrl: string }[] = [];
  for (let i = 0; i < projectRows.length; i++) {
    const row = projectRows[i];
    const title = row.title ?? "";
    const url = row.url ?? "";
    const imageUrl = row.imageUrl ?? "";
    if (!title && !url && !imageUrl) continue;
    if (!title || !url || !imageUrl) {
      return {
        success: false,
        message: `Project ${i + 1} is missing a title, link, or image.`,
      };
    }
    projects.push({ title, url, imageUrl });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return { success: false, message: "Profile not found." };
  }

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        firstName: parsed.data.firstName,
        surname: parsed.data.surname,
        location: parsed.data.location,
        headline: parsed.data.headline,
        website: parsed.data.website,
        bio: parsed.data.bio,
        avatar: parsed.data.avatarUrl,
        specialty: specialty || null,
        rate,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: `${parsed.data.firstName} ${parsed.data.surname}`.trim(),
        image: parsed.data.avatarUrl,
      },
    }),
    prisma.profileLink.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileLink.createMany({
      data: links.map((link, order) => ({
        ...link,
        order,
        profileId: profile.id,
      })),
    }),
    prisma.selectedProject.deleteMany({ where: { profileId: profile.id } }),
    prisma.selectedProject.createMany({
      data: projects.map((project, order) => ({
        ...project,
        order,
        profileId: profile.id,
      })),
    }),
  ]);

  revalidatePath("/dashboard/profile");

  return { success: true, message: "Profile updated." };
}
