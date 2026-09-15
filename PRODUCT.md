# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: **Vite + React 19 + TypeScript + Tailwind CSS v4 + TanStack Query + TanStack Router + Radix UI + lucide-react + React Hook Form + Zod + MSW**. Font: **General Sans** (free stand-in for the reference's PolySans). App lives in `Admin/app/`. Chosen for a data/table-heavy internal SPA with cursor pagination and heavy server state; MSW lets the UI be built against a typed contract before the backend admin APIs exist.

## Users

Internal nxClip operators — content moderators, creator-support/QA, and AI-ops/engineering. **Single `admin` tier now** (matches the backend's one `admin` role, resolved via `GET /auth/me`), but nav and permissions are **structured so role tiers (Moderator / Support / Super-admin) can be added later without rework**. Not a public or creator-facing product.

## Product Purpose

A single internal operations console for the nxClip AI creator platform: triage and act on the **content moderation** queue, manage the **creator directory** (search, suspend, onboarding reset, role promote), monitor **AI job queues and spend**, audit the Explore/WES feed, and watch **service health**. It exists because nxClip's microservices (identity, content, feed, ai, notification) currently expose **no admin surfaces at all** — safety, support, and cost control have no home today. Success = an operator can find a piece of content or a creator and take the right action in seconds, and catch stuck/failed/expensive states before users or budgets are hurt.

## Positioning

One operational surface layered over nxClip's separate microservices via a future `/admin/*` gateway — consolidating moderation, creator support, and AI cost/queue control that no single existing tool provides.

## Operating Context

Desktop-first, high-density, used by staff at a workstation. Core loops: review the moderation queue → inspect media + prompt + failure reason → approve / take down (with feed-projection cleanup); search a creator → suspend / reset onboarding / promote; scan AI queues → retry failed jobs → review daily/monthly spend and top spenders; glance at service-health dots. Data flows through the API gateway; admin routes (`/admin/*`) are **to be built** and are currently served by MSW mocks against a typed contract.

## Capabilities and Constraints

- **Modules & priority:** Content Moderation Hub (P0) · Creator Directory (P1) · AI Queue + Cost (P1) · Explore WES read-only audit (P2) · System Health (left-rail dots). **Deferred (P3):** Social Distribution console, runtime model-provider toggles.
- **Auth:** Bearer access token (in memory) + refresh via `POST /auth/login`, `POST /auth/refresh`; admin gate via `GET /auth/me` → `roles.includes('admin')` **plus** server-side check later. The JWT `roles` claim is unreliable (Microsoft `ClaimTypes.Role`); prefer `/auth/me`. **No admin user is seeded yet.**
- **Backend reality:** the admin API does not exist yet. Build against a single typed admin client + MSW mocks; flipping mock→live `/admin/*` must be a one-line switch. Do not fabricate endpoints, credentials, or data.
- **Content statuses:** `draft`, `processing`, `generation_failed`, `publishing`, `moderation_rejected`, `published`, `deleted`. **Content types:** `image`, `meme`, `clip`.
- **Media:** auth-gated via `GET /content/{id}/media` (302 → short-lived signed URL); bucket stays private. Treat `cdnUrl` as non-permanent.
- **Realtime:** notification WebSocket is user-scoped (`user:{sub}`), not an admin firehose → admin queues are **polled** (TanStack Query), not live sockets.
- **Pagination:** cursor-based everywhere (`cursor` ISO + `limit`), never page/offset.
- **Take-down** must also remove/hide `feed.feed_projections` or Explore shows ghosts.

## Brand Commitments

- Product name shown in the panel: **"nxClip Admin"**, with an nxClip-style mark.
- The **Aivora** Behance case study (`designRefrence/screen.png`) is **visual inspiration only** — its aesthetic (near-black canvas, navy-purple surfaces, lavender accent, geometric sans, rounded panels, status pills, sidebar + top bar + 70/30 table+inspector) is the pinned visual world. Its name, logo, and copy must never be reproduced.
- The design system is delivered as a **living in-app page** (`/design-system`), rendered from real components so it stays in sync.

## Evidence on Hand

**Document precedence (authority ladder — higher wins on any conflict):**

1. **`docs/api-reference.md` + `docs/frontend-integration-guide.md`** — latest, updated; the **wire/API truth** (endpoint shapes, auth, statuses). **Highest weight; wins all conflicts.**
2. **`docs/admin-panel-spec-and-api.md`** — the single source of truth for admin-panel scope **and** the `/admin/*` API contract (merged from the backend's API docs; verified live). Admin authority, but yields to (1) on shared-wire matters.
3. **`docs/NexaClip_Web_UX_Flow.md` + `docs/NexaClip_UX_Flow_Document.md`** — **initial** consumer-app UX (web + mobile); product/domain background only, superseded by (1)/(2). Do not treat their fields as wire truth (e.g. `pending_review`, `meme` type live only here).

Cross-reference all docs for information, but resolve conflicts by this ladder.

- `designRefrence/screen.png` — pinned visual reference (Aivora).
- **Absent (must not fabricate):** live admin API, seeded admin credentials, production users/content/cost data.

## Product Principles

1. **Operate over impress** — task, state, and safety are always legible; expression never obscures the data.
2. **Contract-first** — one typed admin client; mocks now, live later, single switch.
3. **Real statuses, real health** — pills and health dots map to actual backend states; never fake static green.
4. **Density with clarity** — desktop-first 70/30 table + inspector; monospace for UUIDs / job IDs.
5. **Structured for growth** — single admin tier now, role-ready nav and permissions.

## Accessibility & Inclusion

WCAG 2.1 AA contrast on the dark theme; keyboard-operable tables, inspector, and dialogs; visible focus states.
