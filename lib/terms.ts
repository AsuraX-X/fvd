// Bump this whenever the Terms of Service or Privacy Policy change materially:
// every user whose `termsVersion` doesn't match is sent back to /accept-terms.
export const TERMS_VERSION = "2026-09-30";

export const TERMS_REQUIRED_MESSAGE =
  "Please accept the Terms of Service and Privacy Policy to continue.";

export const hasAcceptedTerms = (user: { termsVersion?: string | null }) =>
  user.termsVersion === TERMS_VERSION;

// Only allow same-origin relative paths as a post-acceptance redirect target.
export const safeNextPath = (next: unknown) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";

export const acceptTermsPath = (next?: string) =>
  next ? `/accept-terms?next=${encodeURIComponent(next)}` : "/accept-terms";
