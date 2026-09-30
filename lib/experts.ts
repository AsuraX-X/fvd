import type { Prisma } from "@/generated/prisma/client";

// The single definition of "publicly visible expert" — use it for every public
// listing/lookup so unlisted (by expert or admin) profiles never leak through.
export const PUBLIC_EXPERT_WHERE = {
  role: "EXPERT",
  listingStatus: "LISTED",
} satisfies Prisma.ProfileWhereInput;

export const isPublicExpert = (profile: {
  role: string;
  listingStatus: string;
}) =>
  profile.role === PUBLIC_EXPERT_WHERE.role &&
  profile.listingStatus === PUBLIC_EXPERT_WHERE.listingStatus;
