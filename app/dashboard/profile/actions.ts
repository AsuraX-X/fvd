"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAcceptedTerms, TERMS_REQUIRED_MESSAGE } from "@/lib/terms";
import { del, list } from "@vercel/blob";
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

  if (!session || !session.user.emailVerified) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  if (!hasAcceptedTerms(session.user)) {
    return { success: false, message: TERMS_REQUIRED_MESSAGE };
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

  if (!session || !session.user.emailVerified) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  if (!hasAcceptedTerms(session.user)) {
    return { success: false, message: TERMS_REQUIRED_MESSAGE };
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
    select: { id: true, role: true },
  });

  if (!profile) {
    return { success: false, message: "Profile not found." };
  }

  if (profile.role !== "EXPERT") {
    return { success: false, message: "Only experts can edit expert details." };
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

export type AccountActionState =
  | { success: true }
  | { success: false; message: string };

async function getVerifiedSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.emailVerified ? session : null;
}

function revalidateExpertVisibility(profileId: string) {
  revalidatePath("/");
  revalidatePath("/experts");
  revalidatePath(`/experts/${profileId}`);
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin/experts");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/users");
}

// Expert pauses/resumes their own listing. Only ever moves between LISTED and
// UNLISTED_BY_EXPERT — the conditional `where` makes UNLISTED_BY_ADMIN
// unreachable from here, even if an admin unlists them mid-request.
export async function setOwnListing(
  listed: boolean,
): Promise<AccountActionState> {
  const session = await getVerifiedSession();

  if (!session) {
    return { success: false, message: "You must be signed in to do that." };
  }

  const { count } = await prisma.profile.updateMany({
    where: {
      id: session.user.id,
      role: "EXPERT",
      listingStatus: listed ? "UNLISTED_BY_EXPERT" : "LISTED",
    },
    data: { listingStatus: listed ? "LISTED" : "UNLISTED_BY_EXPERT" },
  });

  if (count === 0) {
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { role: true, listingStatus: true },
    });

    if (profile?.role !== "EXPERT") {
      return { success: false, message: "Only experts can change their listing." };
    }

    if (profile.listingStatus === "UNLISTED_BY_ADMIN") {
      return {
        success: false,
        message:
          "Your profile was unlisted by an admin. Please contact us to have it relisted.",
      };
    }

    // Already in the requested state — treat as a no-op success.
  }

  revalidateExpertVisibility(session.user.id);

  return { success: true };
}

export async function removeExpertStatus(): Promise<AccountActionState> {
  const session = await getVerifiedSession();

  if (!session) {
    return { success: false, message: "You must be signed in to do that." };
  }

  const userId = session.user.id;

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({
      where: { id: userId },
      select: { role: true, listingStatus: true },
    });

    if (profile?.role !== "EXPERT") return false;

    await tx.profile.update({
      where: { id: userId },
      data: {
        role: "USER",
        // A self-pause shouldn't follow them into a future re-approval, but an
        // admin unlisting must survive — otherwise dropping and regaining
        // expert status would be a way around it.
        ...(profile.listingStatus === "UNLISTED_BY_EXPERT" && {
          listingStatus: "LISTED",
        }),
      },
    });

    // submitApplication allows one application per user, so clear the approved
    // one to let them re-apply. Reviews they received stay on their profile.
    await tx.application.deleteMany({ where: { userId } });

    return true;
  });

  if (!result) {
    return { success: false, message: "You don't have expert status." };
  }

  revalidateExpertVisibility(userId);
  revalidatePath("/dashboard/application");
  revalidatePath("/admin/applications");

  return { success: true };
}

export async function deleteAccount(
  confirmation: string,
): Promise<AccountActionState> {
  const session = await getVerifiedSession();

  if (!session) {
    return { success: false, message: "You must be signed in to do that." };
  }

  if (confirmation.trim().toUpperCase() !== "DELETE") {
    return { success: false, message: 'Type "DELETE" to confirm.' };
  }

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (profile?.role === "ADMIN") {
    const adminCount = await prisma.profile.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return {
        success: false,
        message: "You're the only admin. Make someone else an admin first.",
      };
    }
  }

  // Captured before the delete cascades them away, for blob cleanup below.
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantOneId: userId }, { participantTwoId: userId }] },
    select: { id: true },
  });
  // Application portfolios live under a random `applications/<uuid>/` path
  // (they can be submitted before sign-up), so they aren't covered by the
  // profile prefix and must be deleted by URL.
  const application = await prisma.application.findUnique({
    where: { userId },
    select: { portfolioUrl: true },
  });

  // Deleting the User cascades to sessions, accounts, profile (links, projects,
  // reviews received, saves of them), saved experts, conversations + messages,
  // and their application. Reviews they wrote and enquiries they sent are
  // SetNull and survive — see schema.prisma.
  await prisma.user.delete({ where: { id: userId } });

  await deleteBlobsWithPrefixes(
    [
      `profile/${userId}/`,
      ...conversations.map((conversation) => `messages/${conversation.id}/`),
    ],
    [application?.portfolioUrl].filter(isOwnApplicationBlob),
  );

  revalidatePath("/", "layout");

  return { success: true };
}

// Best-effort — the account is already gone, so a Blob failure only leaves
// orphaned files behind and must not surface as a failed deletion.
async function deleteBlobsWithPrefixes(prefixes: string[], urls: string[] = []) {
  try {
    if (urls.length > 0) {
      await del(urls);
    }
    for (const prefix of prefixes) {
      let cursor: string | undefined;
      do {
        const page = await list({ prefix, cursor });
        if (page.blobs.length > 0) {
          await del(page.blobs.map((blob) => blob.url));
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    }
  } catch (error) {
    console.error("Failed to clean up blobs for deleted account", error);
  }
}

// portfolioUrl may be an uploaded file or, in principle, any URL — only delete
// files that are our own application uploads.
function isOwnApplicationBlob(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const { hostname, pathname } = new URL(url);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") &&
      pathname.startsWith("/applications/")
    );
  } catch {
    return false;
  }
}
