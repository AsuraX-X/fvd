"use server";

import {
  CONCIERGE_MAX_MESSAGE_LENGTH,
  expertSearchTerms,
  FAQ_ANSWER_THRESHOLD,
  hasExpertIntent,
  matchFaqs,
} from "@/lib/concierge";
import { PUBLIC_EXPERT_WHERE } from "@/lib/experts";
import { prisma } from "@/lib/prisma";

export type ConciergeExpert = {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string | null;
  headline: string | null;
  rate: number | null;
  rating: number | null;
};

export type ConciergeReply =
  | { kind: "faq"; question: string; answer: string; related: string[] }
  | { kind: "experts"; experts: ConciergeExpert[] }
  | { kind: "no-experts" }
  | { kind: "ask-specialty" }
  | { kind: "fallback"; suggestions: string[] };

export type AskConciergeState =
  | { success: true; reply: ConciergeReply }
  | { success: false; message: string };

const MAX_EXPERT_RESULTS = 4;
const FALLBACK_SUGGESTIONS = [
  "How do I get paid?",
  "How do I leave a review for an expert?",
  "Who will see my profile?",
];

// Higher weight = stronger signal that the expert does what was asked for.
const FIELD_WEIGHTS = {
  specialty: 3,
  headline: 3,
  firstName: 2,
  surname: 2,
  location: 2,
  bio: 1,
} as const;
type SearchField = keyof typeof FIELD_WEIGHTS;
const SEARCH_FIELDS = Object.keys(FIELD_WEIGHTS) as SearchField[];

async function searchExperts(
  terms: string[],
  { strongMatchOnly }: { strongMatchOnly: boolean },
): Promise<ConciergeExpert[]> {
  if (terms.length === 0) return [];

  const candidates = await prisma.profile.findMany({
    where: {
      ...PUBLIC_EXPERT_WHERE,
      OR: terms.flatMap((term) =>
        SEARCH_FIELDS.map((field) => ({
          [field]: { contains: term, mode: "insensitive" as const },
        })),
      ),
    },
    select: {
      id: true,
      firstName: true,
      surname: true,
      avatar: true,
      specialty: true,
      headline: true,
      location: true,
      bio: true,
      rate: true,
    },
    take: 50,
  });

  const ranked = candidates
    .map((expert) => {
      let score = 0;
      for (const term of terms) {
        // Count each term once, by the strongest field it appears in.
        score += Math.max(
          0,
          ...SEARCH_FIELDS.filter((field) =>
            expert[field]?.toLowerCase().includes(term),
          ).map((field) => FIELD_WEIGHTS[field]),
        );
      }
      return { expert, score };
    })
    // Without an explicit "find me…" the query may be an unanswered question,
    // so a passing mention in someone's bio isn't enough to show them.
    .filter(({ score }) => score >= (strongMatchOnly ? 2 : 1))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_EXPERT_RESULTS)
    .map(({ expert }) => expert);

  if (ranked.length === 0) return [];

  const ratings = await prisma.review.groupBy({
    by: ["expertId"],
    where: { expertId: { in: ranked.map((expert) => expert.id) } },
    _avg: { rating: true },
  });
  const averageRatings = new Map(
    ratings.map((group) => [group.expertId, group._avg.rating]),
  );

  return ranked.map((expert) => ({
    id: expert.id,
    name: `${expert.firstName} ${expert.surname}`.trim(),
    avatar: expert.avatar,
    specialty: expert.specialty,
    headline: expert.headline,
    rate: expert.rate,
    rating: averageRatings.get(expert.id) ?? null,
  }));
}

// `mode: "experts"` is set by the widget right after it asked "what kind of
// expert?", so the next message is treated as a search even without "find".
export async function askConcierge(
  rawMessage: string,
  mode: "auto" | "experts" = "auto",
): Promise<AskConciergeState> {
  // Open to signed-out visitors too: it only reads FAQs and public listings.
  const message = rawMessage.trim().slice(0, CONCIERGE_MAX_MESSAGE_LENGTH);
  if (!message) {
    return { success: false, message: "Type a question to get started." };
  }

  const wantsExperts = mode === "experts" || hasExpertIntent(message);
  const terms = expertSearchTerms(message);
  const faqMatches = matchFaqs(message);
  const [bestFaq] = faqMatches;

  if (wantsExperts) {
    if (terms.length === 0) return { success: true, reply: { kind: "ask-specialty" } };
    const experts = await searchExperts(terms, { strongMatchOnly: false });
    return {
      success: true,
      reply: experts.length > 0 ? { kind: "experts", experts } : { kind: "no-experts" },
    };
  }

  if (bestFaq && bestFaq.score >= FAQ_ANSWER_THRESHOLD) {
    return {
      success: true,
      reply: {
        kind: "faq",
        question: bestFaq.question,
        answer: bestFaq.answer,
        related: faqMatches
          .slice(1, 3)
          .filter((match) => match.score >= FAQ_ANSWER_THRESHOLD / 2)
          .map((match) => match.question),
      },
    };
  }

  // e.g. a bare "animation" or "illustrator in Accra".
  const experts = await searchExperts(terms, { strongMatchOnly: true });
  if (experts.length > 0) {
    return { success: true, reply: { kind: "experts", experts } };
  }

  const suggestions = faqMatches.slice(0, 3).map((match) => match.question);
  return {
    success: true,
    reply: {
      kind: "fallback",
      suggestions: suggestions.length > 0 ? suggestions : FALLBACK_SUGGESTIONS,
    },
  };
}
