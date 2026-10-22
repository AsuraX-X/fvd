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

// Set by proxy.ts on /dashboard and /admin requests so their layouts know
// which page to return to after sign-in.
export const REQUEST_PATH_HEADER = "x-request-path";

export const requestedPath = (headersList: Headers, fallback: string) =>
  safeNextPath(headersList.get(REQUEST_PATH_HEADER) ?? fallback);

// Sign-in page that returns the user to `next` afterwards (see app/account).
export const signInPath = (next?: string) =>
  next
    ? `/account?signin=true&next=${encodeURIComponent(next)}`
    : "/account?signin=true";

// Adds/overwrites one query param on a relative path, keeping the rest.
export const withSearchParam = (path: string, key: string, value: string) => {
  const url = new URL(path, "http://placeholder");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
};

// Dialogs that DialogIntentWatcher reopens after sign-in.
export const DIALOG_INTENTS = ["apply", "enquiry", "contact"] as const;
export type DialogIntent = (typeof DIALOG_INTENTS)[number];

// Sign in, then come back to `path` with that dialog reopened.
export const signInWithIntentPath = (path: string, intent: DialogIntent) =>
  signInPath(withSearchParam(path, "intent", intent));
