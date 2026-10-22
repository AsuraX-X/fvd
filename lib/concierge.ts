import { faqs, prods, strats } from "@/constants";

// Rule-based matching for the site concierge (components/concierge). No AI —
// FAQ answers come from `faqs` in constants/index.ts, expert results from the
// public directory. Everything here is pure so it can be tuned in isolation.

export const CONCIERGE_MAX_MESSAGE_LENGTH = 300;

const STOPWORDS = new Set(
  (
    "a about above after again all also am an and any are as at be been before " +
    "being but by can could did do does doing for from get gets getting go got " +
    "had has have having he her here hers him his how i if in into is it its " +
    "just me more most my no not now of off on once only or other our out over " +
    "own please same she should so some such than that the their them then there " +
    "these they this those through to too under until up very was we were what " +
    "when where which while who whom why will with would you your yours " +
    "fvdlance portal site website hi hello hey thanks thank there anyone"
  ).split(" "),
);

// Maps variants onto one canonical token so "paid", "payment" and "money" all
// match the "How do I get paid?" FAQ. Keys are lowercase raw words.
const SYNONYMS: Record<string, string> = {
  paid: "pay",
  payment: "pay",
  payments: "pay",
  paying: "pay",
  pays: "pay",
  payout: "pay",
  payouts: "pay",
  money: "pay",
  earn: "earn",
  earning: "earn",
  earnings: "earn",
  income: "earn",
  sign: "signup",
  signup: "signup",
  register: "signup",
  registration: "signup",
  join: "signup",
  account: "signup",
  review: "review",
  reviews: "review",
  rating: "review",
  ratings: "review",
  star: "review",
  stars: "review",
  feedback: "review",
  hide: "unlist",
  hidden: "unlist",
  unlist: "unlist",
  unlisted: "unlist",
  invisible: "unlist",
  pause: "unlist",
  listed: "list",
  listing: "list",
  publish: "list",
  published: "list",
  visible: "list",
  visibility: "list",
  page: "profile",
  portfolio: "profile",
  seen: "see",
  sees: "see",
  view: "see",
  views: "see",
  update: "edit",
  change: "edit",
  modify: "edit",
  administrator: "admin",
  moderator: "admin",
  customer: "client",
  customers: "client",
  clients: "client",
  experts: "expert",
  freelancer: "expert",
  freelancers: "expert",
  creative: "expert",
  creatives: "expert",
};

const stem = (word: string) => {
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
};

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const tokenize = (text: string) =>
  new Set(
    words(text)
      .filter((word) => !STOPWORDS.has(word))
      .map((word) => SYNONYMS[word] ?? SYNONYMS[stem(word)] ?? stem(word)),
  );

// Answers the concierge knows on top of the public FAQ page.
const CONCIERGE_FAQS = [
  {
    question: "What is FVD?",
    answer:
      "FVD is a distributed creative collective blending strategy, storytelling, and production to bring brands to life. We also run a directory of vetted creative experts you can browse and message directly.",
  },
  {
    question: "What services do you offer?",
    answer: `Full-cycle brand building. Strategy & creative: ${strats.join(", ")}. Production & lifecycle: ${prods.join(", ")}. See the Services page for details, or contact us to discuss a project.`,
  },
  {
    question: "How do I contact or hire an expert?",
    answer:
      "Open the expert's profile from the Experts page and press \"Message\" to start a conversation with them. Agree the scope and price with them directly; you can find your conversations under Dashboard → Messages.",
  },
];

const FAQ_INDEX = [...faqs, ...CONCIERGE_FAQS].map((faq) => ({
  ...faq,
  questionTokens: tokenize(faq.question),
  answerTokens: tokenize(faq.answer),
  questionWords: new Set(words(faq.question)),
}));

export type FaqMatch = { question: string; answer: string; score: number };

// Score = mostly "how much of the query does this FAQ cover" (question hits
// count double answer hits), plus "how much of the FAQ question did the query
// hit" and "how many query words appear verbatim in the question" — both to
// prefer the more specific question on ties. 0..1.
export const matchFaqs = (query: string): FaqMatch[] => {
  const queryTokens = tokenize(query);
  if (queryTokens.size === 0) return [];
  const queryWords = words(query).filter((word) => !STOPWORDS.has(word));

  return FAQ_INDEX.map(({ question, answer, questionTokens, answerTokens, questionWords }) => {
    let points = 0;
    let questionHits = 0;
    for (const token of queryTokens) {
      if (questionTokens.has(token)) {
        points += 2;
        questionHits += 1;
      } else if (answerTokens.has(token)) {
        points += 1;
      }
    }
    const queryCoverage = points / (2 * queryTokens.size);
    const questionCoverage = questionHits / Math.max(questionTokens.size, 1);
    const verbatim =
      queryWords.filter((word) => questionWords.has(word)).length /
      Math.max(queryWords.length, 1);
    return {
      question,
      answer,
      score: 0.6 * queryCoverage + 0.25 * questionCoverage + 0.15 * verbatim,
    };
  })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
};

// A match at or above this is answered directly; below it we try other routes.
export const FAQ_ANSWER_THRESHOLD = 0.55;

const EXPERT_INTENT_WORDS = new Set([
  "find",
  "hire",
  "hiring",
  "need",
  "needs",
  "looking",
  "look",
  "search",
  "searching",
  "recommend",
  "recommendation",
  "suggest",
  "want",
  "someone",
  "somebody",
]);

// Words that signal intent or are too generic to search profiles with.
const NON_SEARCH_WORDS = new Set([
  ...EXPERT_INTENT_WORDS,
  "expert",
  "experts",
  "freelancer",
  "freelancers",
  "creative",
  "creatives",
  "help",
  "project",
  "work",
  "job",
  "good",
  "best",
  "great",
  "top",
  "cheap",
  "affordable",
  "available",
  "like",
  "me",
  "us",
  "who",
  "person",
  "people",
  "one",
]);

export const hasExpertIntent = (query: string) =>
  words(query).some((word) => EXPERT_INTENT_WORDS.has(word));

// Strips common suffixes so "animator" also finds "Animation" and "designer"
// finds "Design" when used as a case-insensitive `contains` filter.
const searchRoot = (word: string) => {
  const root = word.replace(
    /(ations?|ers?|ors?|ings?|ions?|ists?|ies|s)$/,
    "",
  );
  return root.length >= 4 ? root : word;
};

export const expertSearchTerms = (query: string) => [
  ...new Set(
    words(query)
      .filter(
        (word) =>
          !STOPWORDS.has(word) &&
          !NON_SEARCH_WORDS.has(word) &&
          (word.length >= 3 || /\d/.test(word)),
      )
      .map(searchRoot),
  ),
].slice(0, 6);
