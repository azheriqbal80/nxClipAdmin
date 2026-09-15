---
name: nxClip Overview preview
description: Synthetic Overview scenarios using the application-wide design system.
---

# Overview preview

## Overview

The public `/overview-example` route demonstrates the approved Overview with deterministic dummy responses. It shares AppShell, Sidebar, Topbar, Panel, Button, SearchInput, Table, Sheet, and the analytic sections with the application. The global visual contract is the root `DESIGN.md`; all runtime tokens come from `app/src/styles/index.css`.

This feature owns its composition and fixture scenarios. It does not define a separate theme. `../overview/DESIGN.md` describes the authenticated implementation and its API mapping.

## Layout and behavior

Operational metrics and moderation lead, followed by shortcuts, health, users, subscriptions, and growth. The shared shell switches to a navigation drawer below 1024px. Content uses the responsive rules in `../overview/design/`: table overflow stays within its panel, charts and supporting panels stack on narrow screens, and KPI cards use one column on small phones.

Search lives in the moderation panel and supports Ctrl/Cmd+K. Filters, row selection, CSV export, content/metric drawers, and section anchors operate on fixture data. Drawers restore focus on close. The account menu and workspace use demo identity. Sample service health appears in the content, not in a duplicate sidebar.

The footer selects populated, loading, empty, and API-unavailable scenarios. Loading and errors stay distinct from a successful zero. All fixture exports remain labelled as sample data. The demo uses shared control focus styles; content-specific plain controls retain the Overview focus outline and reduced-motion behavior.

## Data and coverage

`fetchOverviewPreview` in `data.ts` is a local asynchronous boundary with no network requests. It follows the real UserStats and DirectoryUser shapes and reuses the pure analytics helpers.

| Item | Populated fixture |
| --- | --- |
| Moderation | 38 total: 26 publishing, 7 rejected, 5 generation failed |
| Queue depth | 14: 9 waiting, 3 active, 2 delayed |
| Failed jobs | 12, independent of queue counters |
| Spend | $1,128.40 over 30 days, down 9.5% |
| Users | 1,260 total, 1,218 active, 42 suspended |
| Signups | 84 over 7 days; 278 over 30 days |
| Plans | Free 945, Pro 252, Studio 63 |
| Growth | Capped 100-account directory sample; current-plan semantics |
| Paid share | 25% overall from aggregate counts |
| Moderation records | Five sample records with creator details |
| Service health | Six sample services, one degraded |

Plan colors follow global tokens: muted for Free and small cohorts, brand violet for Pro, teal for Studio. Current plan is distinct from plan at signup. Small cohorts are muted, empty cohorts remain gaps, and recent cohorts retain the maturity caveat. Chart-window changes do not redefine the fixed aggregate KPI windows.

## Maintenance

- Update shared tokens and components to change the design throughout the application.
- Keep feature CSS limited to composition and content density.
- Preserve visible fixture disclosure and explicit status labels.
- Keep fixture counts and API descriptions synchronized with `data.ts` and the authenticated Overview documentation.

The preview and authenticated pages use the same visual system. Browser verification on September 11, 2026 confirmed the shared shell, input/panel tokens, one main landmark, and contained page width.
