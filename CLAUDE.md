# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This repo uses **pnpm only** — never use npm or yarn (`pnpm-lock.yaml` is authoritative).

```bash
pnpm dev                    # start dev server (Next.js, Turbopack)
pnpm build                  # production build
pnpm lint                   # eslint (flat config, eslint-config-next)
pnpm exec tsc --noEmit -p . # typecheck (no dedicated script in package.json)

pnpm exec prisma migrate dev --name <name>  # create + apply a migration (edit prisma/schema.prisma first)
pnpm exec prisma generate                   # regenerate the Prisma client (into generated/prisma)
pnpm db:seed                                # run prisma/seed.ts
pnpm db:seed:experts                        # run prisma/seed-experts.ts
```

There is no test suite / test runner configured in this repo.

## Architecture

Next.js 16 App Router + React 19 + TypeScript, Tailwind CSS v4, Prisma 7 (driver adapter, `@prisma/adapter-pg`), better-auth for auth, Vercel Blob for image uploads.

### Data layer

- `prisma/schema.prisma` is the source of truth. The generated client lives at `generated/prisma` (custom `output`, not the default `node_modules/.prisma`) and is imported as `@/generated/prisma/client`, never from `@prisma/client` directly. Access it via the shared singleton at `lib/prisma.ts` (`import { prisma } from "@/lib/prisma"`).
- **`User`** (better-auth's user table) and **`Profile`** are two separate models with a 1:1 relation, but `Profile.id === Profile.userId === User.id` — a Postgres trigger (see `prisma/migrations/20260707120000_add_profile`) auto-creates a `Profile` row with the same id whenever a `User` row is inserted. Prisma has no middleware/`$use` hook in this setup, so profile creation is DB-trigger-driven, not application code.
- `Profile.role` (`ADMIN` | `EXPERT` | `USER`) gates whether a profile shows up in the public experts directory (`role: "EXPERT"`) and what the dashboard displays.
- Experts have `ProfileLink[]` (external links) and `SelectedProject[]` (portfolio pieces with `imageUrl`/`title`/`url`), both ordered by an `order` int field and fully replaced (`deleteMany` + `createMany`) on profile save rather than diffed.
- `SavedExpert` is a join table (`userId` + `expertId`, unique pair) for the "save an expert" feature — `expertId` references `Profile.id`, not `User.id`.
- `Conversation` (`participantOneId`/`participantTwoId`, canonically ordered — smaller `Profile.id` always stored as `participantOneId` — via `@@unique([participantOneId, participantTwoId])`) and `Message` (`conversationId`, `senderId`, `content`, nullable `readAt`) back the messaging feature. Both participant fields are role-agnostic FKs to `Profile.id`; role-pairing rules (client↔expert, or admin↔anyone) are enforced in `getOrCreateConversation` (`app/messages/actions.ts`), not the DB — Postgres has no clean way to express that constraint declaratively.
- After changing `schema.prisma`, always run `prisma migrate dev` (needs a reachable `DATABASE_URL`) and then confirm `generated/prisma` picked up the change before writing code against new fields/models.

### Auth

- `lib/auth.ts` configures better-auth (Prisma adapter, email/password + Google OAuth, `@better-auth/infra` `dash()` plugin). `lib/auth-client.ts` is the client-side counterpart (`authClient`) used in client components.
- The catch-all route `app/api/auth/[...all]/route.ts` wraps better-auth's Next.js handler and manually adds CORS headers on top.
- Server-side session lookup is always the same pattern, repeated per-file (no shared helper exists):
  ```ts
  const session = await auth.api.getSession({ headers: await headers() });
  ```
- Route protection convention: `app/dashboard/layout.tsx` calls `redirect("/account?signin=true")` if there's no session, guarding every `app/dashboard/**` page. Because the layout doesn't pass the session down via context/props, individual dashboard pages that need `session.user.id` re-fetch the session themselves.
- Public pages that need to know "is this expert saved by the current viewer" (e.g. `components/experts/ExpertGrid.tsx`, `app/experts/[id]/page.tsx`) fetch the session as optional (no redirect) and treat a missing session as "not saved" / logged out.

### Server actions

- Actions live next to the routes that own them (e.g. `app/dashboard/profile/actions.ts`, `app/experts/actions.ts`), each file starting with `"use server"`. There is no central `lib/actions` directory.
- Two return-shape conventions coexist, pick based on the caller:
  - `useActionState`-style actions (`(prevState, formData) => Promise<{ success, message }>`) for forms, e.g. `updateProfile`/`updateExpertProfile` in `app/dashboard/profile/actions.ts`.
  - Directly-invoked actions called from an `onClick` via `useTransition` (e.g. `toggleSavedExpert` in `app/experts/actions.ts`), returning a discriminated union like `{ success: true; saved: boolean } | { success: false; message: string }`.
- Actions call `revalidatePath(...)` for every route whose server-rendered data the mutation affects (list page, detail page, dashboard page) rather than relying on client-side refetching.
- No session → actions return a `{ success: false, message }` error object; they do not throw or redirect (unlike pages, which redirect).
- An action that's called directly from a page's server-render body (not from a client `onClick`/transition) must never call `revalidatePath` — Next.js throws "used revalidatePath ... during render, which is unsupported." `getOrCreateConversation` (`app/messages/actions.ts`) is called this way from `app/messages/[id]/page.tsx` to auto-create a conversation on first visit, so it deliberately skips revalidation; `sendMessage`/`markConversationRead` in the same file are only ever invoked from a client component's `useTransition`, so they revalidate freely.

### Image handling

- `next.config.ts` `images.remotePatterns` explicitly allowlists `placehold.co`, `*.public.blob.vercel-storage.com`, and `picsum.photos` — any new remote image host must be added there or `next/image` will refuse to render it.
- User-uploaded images (avatars, project images) go through Vercel Blob: `lib/blob-upload.ts` (`uploadImageToBlob`, client-side) calls `@vercel/blob/client`'s `upload()` against `app/api/profile/blob-upload/route.ts`, which validates the session and that the upload path is scoped to `profile/${session.user.id}/...` before issuing a token.

### Real-time (Pusher)

- Messaging uses Pusher Channels for live delivery — chosen over a persistent socket server since the app deploys to Vercel serverless. `lib/pusher.ts` is the server-side singleton (`pusherServer`, mirrors `lib/prisma.ts`'s pattern); `lib/pusher-client.ts` is the browser-side singleton (`getPusherClient()`), imported only from client components.
- Channel convention: `private-conversation-<conversationId>`, event `new-message`. `sendMessage` triggers the event immediately after the `Message` row commits (never before) and swallows/logs a Pusher failure rather than failing the action, since the message is already persisted by that point.
- `app/api/pusher/auth/route.ts` authorizes private-channel subscriptions — it re-derives the session, parses the conversation id out of the channel name, and checks the caller is one of the conversation's two participants before calling `pusherServer.authorizeChannel(...)`.
- Env vars: `PUSHER_APP_ID`/`PUSHER_KEY`/`PUSHER_SECRET`/`PUSHER_CLUSTER` (server-only) plus `NEXT_PUBLIC_PUSHER_KEY`/`NEXT_PUBLIC_PUSHER_CLUSTER` (bundled client-side — never put the secret in a `NEXT_PUBLIC_*` var, since anyone could then self-sign channel auth).

### Frontend structure

- `components/` is organized by feature/section (`home/`, `experts/`, `dashboard/`, `dashboard/experts/`, `dashboard/profile/`, `common/`, `signin/`, `services/`), not by component type. There are sometimes two components with the same name for different contexts (e.g. `components/home/ExpertCard.tsx` vs `components/experts/ExpertCard.tsx` vs `components/dashboard/experts/ExpertCard.tsx`) — check the directory, not just the filename.
- Data fetching happens in `async` server components close to where it's rendered (e.g. `components/experts/ExpertGrid.tsx`, `components/home/Experts.tsx` both call `prisma` directly); pages tend to be thin wrappers. Client components (`"use client"`) are kept small and pulled out just for the interactive slice (e.g. `SaveExpertButton`, `RemoveSavedExpertButton`) rather than making whole cards/pages client components.
- Global providers are wired in `app/layout.tsx`: `RoleProvider` (from `contexts/RoleContext.tsx`, exposes the current user's `Profile.role` via `useRole()`) and `DialogProvider`/`DialogRenderer` (from `contexts/DialogContext.tsx` — a generic imperative dialog system: `openDialog(type, props)` pushes an entry that `DialogRenderer` looks up and mounts, `closeDialog(id)`/`closeAll()` remove it).
- `constants/index.ts` holds shared nav link arrays (`links`, `dashBoardLinks`, `quickLinks`, `social`) and static content lists (`strats`, `prods`) — check here before hardcoding nav items elsewhere.

### Styling

- Tailwind v4 via `@theme inline` in `app/globals.css` — colors are CSS custom properties (`--color-primary`, `--color-primary-light`, `--color-secondary`, `--color-secondary-light`, `--color-secondary-lighter`, `--color-body`) with light/dark values swapped under `@media (prefers-color-scheme: dark)`. Use the Tailwind color names (`bg-primary-light`, `text-body`, etc.), not raw hex values, so dark mode keeps working.
- Custom `@utility` classes are defined once and reused everywhere: `button-primary`, `button-secondary`, `link`, `form-label`, `form-input`, `small-header`, `font-body`. Prefer these over ad hoc Tailwind combos for buttons/forms/section headers.
- Fonts: `--font-montserrat` (body, sans) and `--font-cormorant` (display/serif, used automatically on `h1`/`h2`/`h3`) are loaded via `next/font/google` in `app/layout.tsx`.

### React Compiler / lint gotcha

- The React Compiler ESLint rule flags impure calls (e.g. `Math.random()`, `Date.now()`) made directly inside a component body as "Cannot call impure function during render." When randomness is needed in a server component (e.g. picking a random project image or a random subset of rows), put the `Math.random()` call inside a plain helper function defined outside the component and call the helper from within it.
- It also flags `setState` called synchronously inside a `useEffect` body (`react-hooks/set-state-in-effect`) — e.g. syncing a prop into state on change. Prefer a `key={...}` on the component to force a remount with fresh initial state instead (see `MessageThread` in `components/messages/MessageThread.tsx`, keyed by `conversationId` in `app/messages/[id]/page.tsx`).
- It also flags reassigning a `let` variable declared outside a `.map()`/render loop (`react-hooks/immutability`), e.g. tracking "did the day change" across list items with a mutable variable. Precompute the derived array (e.g. via `.map((item, index) => ...)` comparing against `array[index - 1]`) instead of mutating a variable during render.
