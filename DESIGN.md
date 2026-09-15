---
name: nxClip Admin
description: Shared design system for the nxClip operations console.
colors:
  background: "#0b0c12"
  foreground: "#f4f4f7"
  card: "#141620"
  card-foreground: "#f4f4f7"
  popover: "#191b26"
  popover-foreground: "#f4f4f7"
  brand-violet: "#8b5cf6"
  brand-indigo: "#0069ed"
  brand-cyan: "#02a99b"
  primary: "#c4b5fd"
  primary-foreground: "#17151f"
  action: "#7c3aed"
  action-hover: "#6d28d9"
  action-foreground: "#f4f4f7"
  secondary: "#191b26"
  secondary-foreground: "#f4f4f7"
  muted: "#191b26"
  muted-foreground: "#a7a8b3"
  accent: "#1f2130"
  accent-foreground: "#f4f4f7"
  destructive: "#fc9198"
  destructive-foreground: "#17151f"
  border: "#282b39"
  input: "#282b39"
  ring: "#c4b5fd"
  chart-1: "#8b5cf6"
  chart-2: "#395fc1"
  chart-3: "#02a99b"
  chart-4: "#bb8d07"
  chart-5: "#a73b80"
  sidebar: "#141620"
  sidebar-foreground: "#a7a8b3"
  sidebar-primary: "#c4b5fd"
  sidebar-primary-foreground: "#17151f"
  sidebar-accent: "#242039"
  sidebar-accent-foreground: "#c4b5fd"
  sidebar-border: "#282b39"
  sidebar-ring: "#c4b5fd"
  canvas: "#0b0c12"
  surface: "#141620"
  surface-2: "#191b26"
  elevated: "#1f2130"
  ink: "#f4f4f7"
  faint: "#a7a8b3"
  line: "#282b39"
  line-strong: "#3b3e50"
  primary-strong: "#a892f6"
  success: "#65dba0"
  warning: "#f5bd61"
  info: "#60a5fa"
  chart-neutral: "#69738e"
  chart-muted: "#8180a5"
  chart-teal: "#57b9af"
typography:
  display:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "32px"
    fontWeight: 600
  kpi:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "30px"
    fontWeight: 600
  page-title:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 600
  headline:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  panel-title:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  body:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  ui:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  label:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  caption:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 400
  micro:
    fontFamily: "'General Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "10px"
    fontWeight: 500
  mono:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.action-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
  input:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "4px 10px"
  status-pill:
    rounded: "{rounded.full}"
    height: "20px"
---

# Design System: nxClip Admin

## Overview

**Creative North Star: "The Mission Control Console"**

nxClip Admin supports moderation, creator management, AI costs, and service health. The approved Overview establishes the shared visual language: charcoal canvas, navy surfaces, flat borders, compact controls, violet actions, and lavender navigation and focus. General Sans carries human-readable content; JetBrains Mono carries machine identifiers.

**Key Characteristics:**
- Tonal surfaces and fine borders make dense operational content readable.
- Violet actions, lavender emphasis, and explicit status labels have distinct roles.
- Shared tokens and components apply across every page and the synthetic preview.

### Sources and ownership

`app/src/styles/index.css` owns runtime colors, aliases, typography, radii, and shell dimensions. The frontmatter above records their current values. `app/src/components/ui/` contains the themed Radix/shadcn primitives; `app/src/components/` contains shared compositions. `app/src/layout/` owns AppShell, Sidebar, and Topbar. The `/design-system` route renders these real components.

Feature CSS arranges content. It must not introduce a local palette, redefine global theme tokens, or fork the shared navigation. Overview, its public synthetic preview, all authenticated pages, and login inherit the same theme. Login uses the shared form components without the authenticated shell.

## Colors

### Actions and emphasis

- `--action` fills primary buttons; `--action-hover` supplies the darker hover fill. Text uses `--action-foreground`.
- `--primary` is readable lavender for links, focus rings, active navigation, and selection. `--primary-foreground` is dark ink for lavender-filled badges. `--primary-strong` is the deeper lavender rung.
- `--ring`, `--sidebar-primary`, and `--sidebar-ring` follow `--primary`.

**The One Voice Rule.** The violet family owns interaction: darker violet for filled actions, lighter lavender for text and focus. Status colors retain their own meanings.

### Surfaces and borders

- `--canvas` → `--background`; `--surface` → `--card` and `--sidebar`.
- `--surface-2` → `--secondary`, `--muted`, and `--popover`.
- `--elevated` → `--accent`, used for lifted and hover surfaces.
- `--ink` → `--foreground` and text-on-surface aliases. `--muted-foreground` also supplies `--faint`.
- `--border` is the source for `--line`, `--input`, and `--sidebar-border`. A change applies to panels, fields, tables, navigation, dialogs, and menus, including portals.
- `--line-strong` is an intentionally stronger separator. Focus and validation borders use their semantic state colors.
- `--sidebar-accent` is the active-navigation fill; its foreground follows `--primary`.

### Status and data

Success, warning, destructive, and info tokens encode application state. Always accompany them with text or an icon. Health comes from API state; unavailable data must not become a successful zero or a static green dot.

The five categorical chart slots use brand violet, an indigo-family shade, brand cyan, gold, and magenta. The last two broaden separation under color-vision deficiency. The palette script validates their readable band and pairwise separation in normal vision and simulated color-vision deficiencies.

Overview plan charts use `--chart-muted` for Free and small cohorts, `--brand-violet` for Pro, and `--chart-teal` for Studio. `--chart-neutral` is an available neutral series token. Plan identity is separate from success/failure status. Bars represent current plans, not plans at signup.

The logo retains its supplied gradient. `--brand-indigo` stays inside brand gradients. Application panels and the canvas use flat tonal fills.

## Typography

General Sans is self-hosted in `app/public/fonts` at weights 400, 500, 600, and 700. JetBrains Mono is bundled through `@fontsource-variable/jetbrains-mono`. Machine IDs, hashes, and telemetry use the mono face.

| Role | Utility | Size / weight |
| --- | --- | --- |
| Display | `text-display font-semibold` | 32px / 600 |
| KPI | `text-kpi font-semibold` | 30px / 600 |
| Page title | `text-page-title font-semibold` | 24px / 600 |
| Section heading | `text-base font-semibold` | 16px / 600 |
| Panel heading | `text-subtitle font-medium` | 15px / 500 |
| Body | `text-sm` | 14px / 400 |
| Compact navigation | `text-ui font-medium` | 13px / 500 |
| Label | `text-xs font-medium` | 12px / 500 |
| Caption | `text-caption` | 11px / 400 |
| Micro | `text-micro font-medium` | 10px / 500 |

Inputs use a 16px mobile floor and 14px desktop text. Overview's content-specific chart labels and dense metadata remain composition decisions; they do not redefine the global type scale.

Lucide icons use currentColor at 12px, 14px, 16px, or 20px. The default UI icon is 16px. Logo assets retain their supplied colors; the small lockup uses a 32px mark, and the large login/splash lockup uses a 48px mark.

## Layout

The shared shell has a 64px top bar and a 240px desktop sidebar, reduced to 220px below 1280px. Below 1024px navigation opens in a Sheet. Desktop navigation can collapse; closing the mobile drawer restores focus to its trigger. Every shell provides a Skip to content link and one scrolling main landmark.

Pages retain the layouts needed for their tasks. Shared page headers wrap actions when space is constrained. Dense tables scroll inside their containers. Standard spacing follows Tailwind's 4px base with 8, 16, 24, and 32px steps; panel padding is usually 16–20px. Overview uses its approved grid composition and responsive breakpoints within the same shell.

### Motion and layers

Use the existing transition and Radix overlay classes. Overview's composite controls use `--motion-duration` (180ms) with ease-out and suppress transitions under reduced motion. Panels stay flat; overlays use the established dialog/menu layer, and the keyboard skip link sits above the shell.

## Elevation & Depth

Depth comes from canvas → surface → elevated tonal changes and a single neutral border. Cards, menus, and dialogs use the shared border treatment. The canvas has no decorative glow. Tooltips use the existing inverse foreground/background treatment for contrast.

## Shapes

| Token | Utility | Value | Role |
| --- | --- | --- | --- |
| `--radius-xs` | `rounded-xs` | 4px | Tiny marks and tooltip arrows |
| `--radius-sm` | `rounded-sm` | 6px | Small inset chips |
| `--radius-md` | `rounded-md` | 8px | Compact controls and menu items |
| `--radius-lg` | `rounded-lg` | 8px | Standard controls and navigation |
| `--radius-xl` | `rounded-xl` | 12px | Panels, cards, and dialogs |
| — | `rounded-full` | pill | Badges, avatars, and account chips |

The compact and standard control roles intentionally share an 8px radius. A 12px panel can contain 8px controls; small inset marks use 4–6px. Choose by role instead of assuming every nested token must have a different numeric value. Neutral edges are 1px; state and focus treatments remain explicit exceptions.

## Components

### Buttons and fields

`Button` variants are default (violet action), secondary (bordered raised fill), outline, ghost, destructive, and link. Default height is 32px; xs is 24px, sm is 28px, and lg is 36px. Default/lg text is 14px and compact text is 12px. Disabled controls use reduced opacity and suppress pointer interaction. Focus uses the shared 3px ring at 50% opacity.

`Input` and `Select` use the shared input-border alias and secondary fill. Error borders use destructive; focus uses ring. `SearchInput` composes Input with a search icon, optional trailing content, and a 36px height.

### Panels, headings, and tables

`Panel` supplies the 12px corner, card surface, and shared border. It can render a section and accepts optional title, description, and action props. `PanelHeader` owns the common heading treatment. `PageHeader` owns page titles and wrapping actions.

`Table` primitives own row borders, hover, selection, and the scroll container. `DataTable` composes them for standard feature tables. Overview uses the same primitives with compact cell layout. `StatCard` builds on Panel. `Metric`, `Field`, and `EmptyState` provide the recurring detail and state patterns.

### Navigation and overlays

`AppShell`, `Sidebar`, and `Topbar` are shared by authenticated pages and the synthetic preview. The rail shows workspace identity, configured navigation, live queue badges, and an account footer. The top bar shows navigation controls, breadcrumbs, and the account menu. Service health belongs in Overview and the Health page.

Sheets, dialogs, select menus, and dropdowns use the root theme even when portaled outside a feature. Modal content and navigation restore focus to their initiating controls. The preview uses sample identity and data, clearly labelled as illustrative.

### Status and identity

`StatusPill` and `PriorityPill` map domain values to semantic tones. Badge sizes are 20px standard and 16px compact. `UserAvatar` uses initials when no image is available. Logo packaging uses the background-free mark in the app and the full tile in browser/OS icons.

## Do's and Don'ts

### Do

- **Do** change shared theme values in `app/src/styles/index.css` and reuse existing components.
- **Do** keep global border aliases connected, including portaled overlays.
- **Do** distinguish darker violet actions from lavender text and focus.
- **Do** label synthetic fixtures and unavailable API data explicitly.
- **Do** validate responsive navigation, contained table overflow, and keyboard focus.

### Don't

- **Don't** create a page-specific palette or duplicate the shared shell.
- **Don't** use status colors to identify neutral chart series.
- **Don't** present demonstration records or service states as live results.
- **Don't** hardcode component colors or radii that bypass the design tokens.
- **Don't** replace a shared component with a local copy to change its appearance.

### Validation and maintenance

`node scripts/ds-audit.mjs` rejects component styling violations and feature-level theme overrides. `node scripts/palette-check.mjs` checks the five categorical chart colors, reserved status separation, surface text and primary-action contrast, and the documented token values. Run these from `app` after token changes and keep the live guide and metadata aligned.

Browser checks on September 11, 2026 confirmed matching borders and radii across Overview, Moderation, Creators, Settings, login, and account menus, plus mobile navigation and focus behavior. The complete automated browser suite was not run.
