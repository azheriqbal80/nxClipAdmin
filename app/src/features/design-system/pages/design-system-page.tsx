import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/logo'
import {
  CheckCircle2,
  Heart,
  Coins,
  Image as ImageIcon,
  ListTree,
  Monitor,
  MoreHorizontal,
  PanelRightOpen,
  Plus,
  Smartphone,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/page-header'
import { Panel, PanelHeader } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/search-input'
import { StatusPill, PriorityPill } from '@/components/status-pill'
import { StatCard } from '@/components/stat-card'
import { UserAvatar } from '@/components/user-avatar'
import { DataTable, type Column } from '@/components/data-table'
import { Field } from '@/components/field'
import { Metric } from '@/components/metric'
import { EmptyState } from '@/components/empty-state'
import { Inbox } from 'lucide-react'
import type { ContentStatus } from '@/domain/content'
import { Sidebar } from '@/layout/sidebar'
import { Topbar, type ShellUser } from '@/layout/topbar'

/* ---- Section scaffolding ------------------------------------------------- */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

/** Resolve a custom property to what the browser actually computed. This page is
    the living spec, so a swatch must never be able to disagree with its token —
    the hexes that used to be passed in here had already gone stale. */
function useTokenValue(varName: string) {
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(varName).trim())
  }, [varName])
  return value
}

function Swatch({ name, varName, note }: { name: string; varName: string; note?: string }) {
  const value = useTokenValue(varName)
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-14 w-full" style={{ background: `var(${varName})` }} />
      <div className="px-3 py-2">
        <div className="text-xs font-medium text-foreground">{name}</div>
        <div className="break-all font-mono text-caption text-muted-foreground">{varName}</div>
        <div className="font-mono text-caption text-faint">{value || varName}</div>
        {note && <div className="mt-0.5 text-caption text-faint">{note}</div>}
      </div>
    </div>
  )
}

/** One rung of the radius scale, drawn at size so the corner is comparable. */
function RadiusSpecimen({
  name,
  cls,
  use,
}: {
  name: string
  cls: string
  use: string
}) {
  const radius = useTokenValue(`--radius-${name}`)
  const value = name === 'full' ? 'pill' : radius
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex h-20 items-end justify-end border border-line-strong bg-surface-2 p-2',
          cls,
        )}
      >
        <span className="font-mono text-caption text-faint">{value}</span>
      </div>
      <div>
        <div className="text-xs font-medium text-foreground">
          {name} <span className="font-mono text-caption text-faint">{cls}</span>
        </div>
        <div className="text-caption text-muted-foreground">{use}</div>
      </div>
    </div>
  )
}

function JumpNav({
  items,
}: {
  items: readonly { id: string; label: string }[]
}) {
  return (
    <Panel className="space-y-4 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">Use shared patterns first</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          This page is the operating contract for nxClip Admin. It documents the real shell,
          real states, and the product patterns that repeat across modules.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button key={item.id} asChild variant="secondary" size="sm">
            <a href={`#${item.id}`}>{item.label}</a>
          </Button>
        ))}
      </div>
    </Panel>
  )
}

function ResponsiveRule({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <Panel className="space-y-3 p-4">
      <span className="inline-flex size-9 items-center justify-center rounded-md bg-elevated text-primary">
        {icon}
      </span>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </Panel>
  )
}

function StateTile({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Panel className="space-y-4 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </Panel>
  )
}

function BrandRoleCard({
  title,
  role,
  guardrail,
  specimenClassName,
}: {
  title: string
  role: string
  guardrail: string
  specimenClassName: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn('mb-3 h-10 rounded-lg border border-border', specimenClassName)} />
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="text-sm text-muted-foreground">{role}</p>
        <p className="text-caption text-faint">{guardrail}</p>
      </div>
    </div>
  )
}

/* ---- Demo data ----------------------------------------------------------- */

interface DemoRow {
  id: string
  creator: string
  title: string
  type: string
  status: ContentStatus
  priority: 'high' | 'medium' | 'low'
}

const DEMO_ROWS: DemoRow[] = [
  { id: '019f-a71c', creator: 'Sarah Khan', title: 'Neon skyline remix', type: 'image', status: 'publishing', priority: 'high' },
  { id: '019f-b204', creator: 'John Miller', title: 'Boss fight clutch', type: 'clip', status: 'moderation_rejected', priority: 'high' },
  { id: '019f-c530', creator: 'Emily Carter', title: 'Patch notes meme', type: 'image', status: 'published', priority: 'low' },
  { id: '019f-d918', creator: 'David Lee', title: 'Golden-hour rooftop', type: 'image', status: 'generation_failed', priority: 'medium' },
  { id: '019f-e047', creator: 'Olivia Brown', title: 'Speedrun highlight', type: 'clip', status: 'processing', priority: 'medium' },
]

const COLUMNS: Column<DemoRow>[] = [
  {
    header: 'Creator',
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <UserAvatar name={r.creator} size="sm" />
        <span className="font-medium text-foreground">{r.creator}</span>
      </div>
    ),
  },
  { header: 'Content', cell: (r) => r.title },
  { header: 'ID', cell: (r) => <span className="font-mono text-xs text-faint">{r.id}</span> },
  { header: 'Type', cell: (r) => <span className="capitalize text-muted-foreground">{r.type}</span> },
  { header: 'Priority', cell: (r) => <PriorityPill priority={r.priority} /> },
  { header: 'Status', cell: (r) => <StatusPill status={r.status} /> },
  {
    header: '',
    align: 'right',
    cell: () => (
      <Button variant="ghost" size="icon-sm" aria-label="Row actions">
        <MoreHorizontal />
      </Button>
    ),
  },
]

const ALL_STATUSES: ContentStatus[] = [
  'draft',
  'processing',
  'generation_failed',
  'publishing',
  'moderation_rejected',
  'published',
  'deleted',
]

/** Every rung is a utility — anything outside this list fails `ds:audit`. */
const TYPE_SCALE: { label: string; cls: string; px: string }[] = [
  { label: 'KPI', cls: 'text-kpi leading-tight font-semibold tabular-nums', px: 'text-kpi · 30 / 600' },
  { label: 'Display', cls: 'text-display leading-tight font-semibold', px: 'text-display · 32 / 600' },
  { label: 'Page title (h1)', cls: 'text-page-title font-semibold', px: 'text-page-title · 24 / 600' },
  { label: 'Headline (h2)', cls: 'text-base font-semibold', px: 'text-base · 16 / 600' },
  { label: 'Panel title', cls: 'text-subtitle font-medium', px: 'text-subtitle · 15 / 500' },
  { label: 'Body', cls: 'text-sm', px: 'text-sm · 14 / 400' },
  { label: 'Compact navigation', cls: 'text-ui font-medium', px: 'text-ui · 13 / 500' },
  { label: 'Label', cls: 'text-xs font-medium', px: 'text-xs · 12 / 500' },
  { label: 'Eyebrow', cls: 'text-caption font-medium tracking-[0.12em] uppercase', px: 'text-caption · 11 / 500' },
  { label: 'Caption', cls: 'text-caption', px: 'text-caption · 11 / 400' },
  { label: 'Micro', cls: 'text-micro font-medium', px: 'text-micro · 10 / 500' },
  { label: 'Mono / IDs', cls: 'font-mono text-xs', px: 'font-mono · JetBrains Mono 12' },
]

/** The derived brand files and their intended surfaces. */
const BRAND_ASSETS = [
  { src: '/logo-mark.svg', px: 48, use: 'in-app chrome — no tile' },
  { src: '/favicon.svg', px: 48, use: 'browser tab — full-bleed tile' },
] as const

const ICON_SCALE: { cls: string; px: string; use: string }[] = [
  { cls: 'size-3', px: '12px', use: 'Dense inline glyph' },
  { cls: 'size-3.5', px: '14px', use: 'Dense controls, table sort, close buttons' },
  { cls: 'size-4', px: '16px', use: 'Default — left nav, top nav, buttons, links, KPI labels, cells' },
  { cls: 'size-5', px: '20px', use: 'Empty states and large explanatory blocks only' },
]

const SECTION_LINKS = [
  { id: 'brand', label: 'Brand' },
  { id: 'colors', label: 'Color' },
  { id: 'borders', label: 'Borders' },
  { id: 'radius', label: 'Radius' },
  { id: 'type', label: 'Type' },
  { id: 'chrome', label: 'Chrome' },
  { id: 'layout', label: 'Layout' },
  { id: 'states', label: 'States' },
  { id: 'table', label: 'Table' },
  { id: 'responsive', label: 'Responsive' },
] as const

const SHELL_USER: ShellUser = {
  displayName: 'Admin User',
  username: 'admin',
  email: 'admin@nxclip.com',
}


const SHELL_BADGES = {
  '/moderation': 11,
  '/queues': 31,
  '/publishing': 6,
}

/* ---- Page ---------------------------------------------------------------- */

export function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="System"
        title="Design System"
        description="The application-wide style guide for nxClip Admin. Shared tokens and components control every page, including Overview and its preview."
      />

      <JumpNav items={SECTION_LINKS} />

      <Section
        id="brand"
        title="Brand translation"
        description="The logo is the source, not a sticker. The guide should make the mark's color logic obvious: violet becomes interaction, indigo stays inside gradients, and cyan belongs to live data."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Panel className="space-y-5 p-5">
            <div className="space-y-2">
              <div className="text-caption font-medium tracking-[0.12em] text-faint uppercase">
                From the shipped artwork
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Translate the mark into roles, not generic dashboard color
              </h3>
              <p className="max-w-3xl text-sm text-muted-foreground">
                The raw logo carries violet, indigo, cyan, and a dark tile. The system keeps
                that color story, but it assigns each hue a job so the admin UI stays legible:
                the violet family owns action, indigo adds depth inside gradients, and cyan
                stays reserved for telemetry.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-sidebar p-4">
                <div className="mb-3 text-caption font-medium tracking-[0.12em] text-faint uppercase">
                  In-app chrome
                </div>
                <div className="rounded-xl border border-sidebar-border bg-sidebar px-4 py-5">
                  <Logo size="lg" />
                </div>
                <p className="mt-3 text-caption text-muted-foreground">
                  The tile background is removed here so the mark sits directly on the app
                  surface instead of reading like a stray app icon.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 text-caption font-medium tracking-[0.12em] text-faint uppercase">
                  Browser / app icon
                </div>
                <div className="flex min-h-36 items-center justify-center rounded-xl border border-border bg-surface-2">
                  <img src="/apple-touch-icon.png" width={96} height={96} alt="" className="size-24" />
                </div>
                <p className="mt-3 text-caption text-muted-foreground">
                  The full tile stays intact in browser and OS chrome, where a self-contained
                  icon is the correct shape.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="mb-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
                Raw artwork stops
              </div>
              <div className="flex flex-wrap gap-2">
                {['#7D0CB1', '#2618CA', '#1FEED3', '#437DFF', '#091B81', '#003DB0', '#22F1D1'].map((stop) => (
                  <Badge key={stop} variant="secondary" className="font-mono text-caption">
                    {stop}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-caption text-faint">
                The system does not copy these stops one-for-one. It preserves their hue story
                at interface-safe lightness values.
              </p>
            </div>
          </Panel>

          <div className="grid gap-4">
            <BrandRoleCard
              title="Violet actions, lavender emphasis"
              role="Action violet fills primary buttons. Lavender keeps links, active navigation, focus rings, and selected rows readable on dark surfaces."
              guardrail="If another accent competes with this, the page is drifting away from the logo contract."
              specimenClassName="bg-action"
            />
            <BrandRoleCard
              title="Indigo carries gradient depth"
              role="The logo's blue mass survives in brand surfaces and sweeps, never as a flat status-like fill."
              guardrail="Keep it inside `.brand-ramp` or layered brand gradients only."
              specimenClassName="brand-ramp"
            />
            <BrandRoleCard
              title="Cyan stays with live data"
              role="Charts, sparklines, and telemetry can echo the logo's highlight without becoming action-colored."
              guardrail="Do not use cyan for CTAs, selection states, or navigation."
              specimenClassName="bg-brand-cyan"
            />
          </div>
        </div>
      </Section>

      <Section
        id="colors"
        title="Color"
        description="Brand, status, and chart colors have separate roles. Values below come from the live theme. The palette check validates text contrast, action contrast, status separation, and the five categorical chart colors."
      >
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
              Brand ramp — measured off the mark: 56% indigo, 23% violet, 15% cyan
            </div>
            <div className="brand-ramp mb-3 h-10 rounded-lg border border-border" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Swatch name="Brand violet" varName="--brand-violet" note="Charts and brand identity" />
              <Swatch name="Brand indigo" varName="--brand-indigo" note="Brand gradients only" />
              <Swatch name="Brand cyan" varName="--brand-cyan" note="Charts and telemetry" />
            </div>
          </div>
          <div>
            <div className="mb-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
              Interaction &amp; surfaces
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Swatch name="Action" varName="--action" note="Primary button fill" />
              <Swatch name="Action hover" varName="--action-hover" />
              <Swatch name="Action text" varName="--action-foreground" />
              <Swatch name="Primary" varName="--primary" note="Links, focus, and selection" />
              <Swatch name="Primary ink" varName="--primary-foreground" note="Text on lavender fills" />
              <Swatch name="Primary strong" varName="--primary-strong" />
              <Swatch name="Background" varName="--background" />
              <Swatch name="Card" varName="--card" />
              <Swatch name="Popover" varName="--popover" note="Menus and dialogs" />
              <Swatch name="Surface 2" varName="--surface-2" />
              <Swatch name="Elevated / Accent" varName="--accent" />
            </div>
          </div>
          <div>
            <div className="mb-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
              Text &amp; reserved status hues
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Swatch name="Foreground" varName="--foreground" />
              <Swatch name="Muted fg" varName="--muted-foreground" />
              <Swatch name="Faint" varName="--faint" />
              <Swatch name="Success" varName="--success" note="Successful and healthy states" />
              <Swatch name="Warning" varName="--warning" note="Attention required" />
              <Swatch name="Destructive" varName="--destructive" note="Failure and destructive actions" />
              <Swatch name="Info" varName="--info" note="Informational states" />
            </div>
          </div>
          <div>
            <div className="mb-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
              Chart series — 1-3 use brand hues; 4-5 broaden their separation
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Swatch name="Chart 1" varName="--chart-1" note="= brand violet" />
              <Swatch name="Chart 2" varName="--chart-2" note="brand indigo family" />
              <Swatch name="Chart 3" varName="--chart-3" note="= brand cyan" />
              <Swatch name="Chart 4" varName="--chart-4" note="off-brand by design" />
              <Swatch name="Chart 5" varName="--chart-5" note="off-brand by design" />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Overview chart roles</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Swatch name="Chart neutral" varName="--chart-neutral" note="Available neutral series" />
              <Swatch name="Free plan" varName="--chart-muted" note="Free plan and small cohorts" />
              <Swatch name="Studio plan" varName="--chart-teal" note="Pro uses brand violet" />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Shared navigation</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Swatch name="Sidebar" varName="--sidebar" note="Follows surface" />
              <Swatch name="Sidebar text" varName="--sidebar-foreground" />
              <Swatch name="Active navigation" varName="--sidebar-accent" />
              <Swatch name="Active text" varName="--sidebar-accent-foreground" note="Follows primary" />
              <Swatch name="Focus" varName="--ring" note="Follows primary" />
              <Swatch name="Sidebar focus" varName="--sidebar-ring" note="Follows primary" />
            </div>
          </div>
        </div>
      </Section>

      <Section id="borders" title="Borders and inheritance" description="Change --border once to update neutral edges across panels, tables, inputs, navigation, dialogs, and menus.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Swatch name="Border source" varName="--border" />
          <Swatch name="Line alias" varName="--line" note="Follows border" />
          <Swatch name="Input alias" varName="--input" note="Follows border" />
          <Swatch name="Sidebar edge" varName="--sidebar-border" note="Follows border" />
          <Swatch name="Strong separator" varName="--line-strong" note="Intentionally stronger" />
        </div>
        <Panel title="Shared border in use" description="This panel, field, and secondary button use the same border source.">
          <div className="space-y-4 px-5 pb-5">
            <div className="flex flex-wrap items-center gap-3"><Input aria-label="Border example" placeholder="Shared input border" className="max-w-sm" /><Button variant="secondary">Secondary action</Button></div>
            <p className="text-sm text-muted-foreground">Focus and error borders use their semantic state colors. Portaled menus and dialogs inherit the root theme too. Feature CSS controls layout and must not override the shared palette.</p>
          </div>
        </Panel>
      </Section>

      <Section
        id="radius"
        title="Radius"
        description="Radius encodes scale: the larger the surface, the softer the corner. Five rungs plus rounded-full — 2xl and above are outside the system and fail ds:audit."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <RadiusSpecimen cls="rounded-xs" name="xs" use="Checkbox, tooltip arrow" />
          <RadiusSpecimen cls="rounded-sm" name="sm" use="Nested chips" />
          <RadiusSpecimen cls="rounded-md" name="md" use="Compact controls, menu items" />
          <RadiusSpecimen cls="rounded-lg" name="lg" use="Default control radius" />
          <RadiusSpecimen cls="rounded-xl" name="xl" use="Cards, panels, dialogs" />
          <RadiusSpecimen cls="rounded-full" name="full" use="Pills, avatars, chips" />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Container and control roles:</span> panels use
          <span className="font-mono"> xl</span>; standard and compact controls both use the 8px
          <span className="font-mono"> lg</span> and <span className="font-mono">md</span> tokens.
          Smaller inset marks use <span className="font-mono">xs</span> or <span className="font-mono">sm</span>.
        </p>
      </Section>

      <Section id="type" title="Typography" description="General Sans for UI; JetBrains Mono for IDs and telemetry.">
        <Panel className="divide-y divide-border">
          {TYPE_SCALE.map((t) => (
            <div key={t.label} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4">
              <span className={t.cls}>The quick brown fox</span>
              <span className="shrink-0 text-right">
                <span className="block text-xs text-muted-foreground">{t.label}</span>
                <span className="block font-mono text-caption text-faint">{t.px}</span>
              </span>
            </div>
          ))}
        </Panel>
      </Section>

      <Section
        id="icons"
        title="Iconography"
        description="Lucide only, currentColor, never filled. Four rungs on the native spacing scale — arbitrary sizes fail ds:audit."
      >
        <Panel className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          {ICON_SCALE.map((i) => (
            <div key={i.cls} className="flex items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-elevated text-primary">
                <ImageIcon className={i.cls} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-xs text-foreground">{i.cls}</span>
                <span className="block text-caption text-muted-foreground">
                  {i.px} · {i.use}
                </span>
              </span>
            </div>
          ))}
        </Panel>
      </Section>

      <Section
        id="brand-assets"
        title="Brand mark"
        description="Asset packaging and lockup sizing. The semantic color mapping lives above; this section covers how the mark is shipped and scaled."
      >
        <Panel className="space-y-5 p-5">
          <div className="flex flex-wrap items-end gap-8">
            {(['sm', 'lg'] as const).map((size) => (
              <div key={size} className="space-y-2">
                <Logo size={size} />
                <span className="block font-mono text-xs text-muted-foreground">
                  size=&quot;{size}&quot;
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-6 border-t border-border pt-5">
            {BRAND_ASSETS.map((a) => (
              <div key={a.src} className="space-y-2">
                <img
                  src={a.src}
                  width={a.px}
                  height={a.px}
                  alt=""
                  style={{ width: a.px, height: a.px }}
                />
                <span className="block font-mono text-xs text-foreground">{a.src}</span>
                <span className="block text-caption text-muted-foreground">{a.use}</span>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      <Section
        id="chrome"
        title="Chrome & shell"
        description="Every authenticated page uses this shared workspace rail, top bar, live queue badges, and account menu. Changes here apply across the application."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Panel className="overflow-hidden p-0">
            <div className="bg-background">
              <div className="flex min-h-[34rem]">
                <div className="hidden shrink-0 lg:flex">
                  <Sidebar badges={SHELL_BADGES} user={SHELL_USER} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Topbar user={SHELL_USER} onMenuClick={() => undefined} />
                  <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Panel>
                      <PanelHeader
                        eyebrow="Moderation"
                        title="Decision surface"
                        action={
                          <Badge variant="accent" className="px-2 py-0.5 text-caption">
                            Row select opens inspector
                          </Badge>
                        }
                      />
                      <DataTable
                        columns={COLUMNS}
                        rows={DEMO_ROWS}
                        rowKey={(r) => r.id}
                        selectedKey="019f-b204"
                      />
                    </Panel>

                    <Panel className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-caption font-medium tracking-[0.12em] text-faint uppercase">
                            Inspector
                          </div>
                          <div className="mt-1 text-subtitle font-semibold text-foreground">
                            Content decision
                          </div>
                        </div>
                        <Button variant="ghost" size="icon-sm" aria-label="Close panel">
                          <Plus className="rotate-45" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Metric label="Failed jobs" value={7} tone="danger" boxed />
                        <Metric label="Age" value="18m" tone="warning" boxed />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Status">
                          <StatusPill status="moderation_rejected" />
                        </Field>
                        <Field label="Priority">
                          <PriorityPill priority="high" />
                        </Field>
                        <Field label="Content ID">
                          <span className="font-mono text-xs text-faint">019f-b204</span>
                        </Field>
                        <Field label="Creator">John Miller</Field>
                      </div>
                      <div className="rounded-lg border border-border bg-surface-2 p-3">
                        <div className="text-xs font-medium text-foreground">
                          Failure reason
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Unsafe text overlay pattern matched. Moderator can approve, keep
                          rejected, or take the content down without leaving the queue.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button>Approve</Button>
                        <Button variant="destructive">Take down</Button>
                        <Button variant="secondary">Escalate</Button>
                      </div>
                    </Panel>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-elevated text-primary">
                  <ListTree className="size-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">Shell rules</div>
                  <p className="text-sm text-muted-foreground">
                    The rail owns workspace navigation and account identity. The top bar owns
                    breadcrumbs, the navigation toggle, and the account menu.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-medium text-foreground">One primary voice</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lavender marks the active path and focus; violet fills the main CTA. The shell
                    stays calm so module content does the work.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-medium text-foreground">Health is literal</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Navigation badges reflect queue data. Service health is shown on Overview
                    and the Health page, with explicit loading and unavailable states.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="space-y-3 p-5">
              <div className="text-caption font-medium tracking-[0.12em] text-faint uppercase">
                Shared components in play
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Sidebar</Badge>
                <Badge variant="secondary">Topbar</Badge>
                <Badge variant="secondary">PanelHeader</Badge>
                <Badge variant="secondary">DataTable</Badge>
                <Badge variant="secondary">Metric</Badge>
                <Badge variant="secondary">Field</Badge>
                <Badge variant="secondary">StatusPill</Badge>
              </div>
            </Panel>
          </div>
        </div>
      </Section>

      <Section id="buttons" title="Buttons" description="shadcn Button, themed. Default = violet action; lavender is reserved for links, focus, and selection.">
        <Panel className="flex flex-wrap items-center gap-3 p-5">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Take down</Button>
          <Button size="sm">
            <Plus /> Small
          </Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button variant="ghost" size="icon" aria-label="More">
            <MoreHorizontal />
          </Button>
        </Panel>
      </Section>

      <Section id="badges" title="Status & priority pills" description="Content statuses map to tones; priority for moderation triage.">
        <Panel className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <StatusPill key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityPill priority="high" />
            <PriorityPill priority="medium" />
            <PriorityPill priority="low" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge size="sm">Small</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Panel>
      </Section>

      <Section
        id="layout"
        title="Working layout"
        description="The signature admin pattern is not a card gallery. It is browse first, then decide in context: full-width table until a row is selected, then a 70/30 split with an inspector."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <StateTile
            title="Browse mode"
            description="The table gets the width until the operator commits to a row. This keeps scanning fast and avoids paying inspector space when nothing is selected."
          >
            <Panel className="overflow-hidden p-0">
              <PanelHeader
                eyebrow="Queues"
                title="Jobs waiting for action"
                action={<SearchInput placeholder="Filter jobs…" className="h-8 w-48" />}
              />
              <DataTable columns={COLUMNS} rows={DEMO_ROWS.slice(0, 4)} rowKey={(r) => r.id} />
            </Panel>
          </StateTile>

          <StateTile
            title="Decision mode"
            description="Once a row is selected, the inspector carries the context, key facts, and the destructive path. Decisions stay adjacent to the data that caused them."
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
              <Panel className="overflow-hidden p-0">
                <PanelHeader eyebrow="Moderation" title="Review queue" />
                <DataTable
                  columns={COLUMNS}
                  rows={DEMO_ROWS.slice(0, 4)}
                  rowKey={(r) => r.id}
                  selectedKey="019f-b204"
                />
              </Panel>
              <Panel className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-subtitle font-semibold text-foreground">
                    Selected item
                  </div>
                  <PanelRightOpen className="size-4 text-primary" />
                </div>
                <Field label="Status">
                  <StatusPill status="moderation_rejected" />
                </Field>
                <Field label="Creator">John Miller</Field>
                <Field label="Action">
                  <span className="text-sm text-muted-foreground">
                    Keep the operator in one decision surface.
                  </span>
                </Field>
              </Panel>
            </div>
          </StateTile>
        </div>
      </Section>

      <Section id="inputs" title="Inputs & controls" description="Text, search, toggle, and tabs.">
        <Panel className="grid gap-4 p-5 sm:grid-cols-2">
          <Input placeholder="Text input" />
          <SearchInput placeholder="Search creators…" />
          <div className="flex items-center gap-3">
            <Switch id="ds-switch" defaultChecked />
            <label htmlFor="ds-switch" className="text-sm text-muted-foreground">
              Auto-refresh queue
            </label>
          </div>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </Panel>
      </Section>

      <Section
        id="states"
        title="States & feedback"
        description="Every shared surface needs more than a default look. Loading, empty, degraded, and destructive states must read clearly under pressure."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <StateTile
            title="Loading"
            description="Loading keeps the structure visible so operators understand what is coming back."
          >
            <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </StateTile>

          <StateTile
            title="Empty"
            description="Empty states should preserve direction. Tell the operator what to do next, not only that nothing exists."
          >
            <Panel>
              <EmptyState
                icon={<Inbox />}
                title="No item selected"
                description="Select a row to see details and take action here."
                className="min-h-52"
              />
            </Panel>
          </StateTile>

          <StateTile
            title="Degraded / error"
            description="Problems must say what failed and what the safe next move is. Reserved status hues stay literal here."
          >
            <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-destructive/15 text-destructive">
                  <TriangleAlert className="size-5" />
                </span>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">
                    Cost summary unavailable
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The AI service did not return a usable spend summary. Keep queue
                    decisions available and offer retry instead of blanking the module.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill status="generation_failed" />
                <Button variant="secondary">Retry request</Button>
                <Button variant="ghost">View trace ID</Button>
              </div>
            </div>
          </StateTile>

          <StateTile
            title="Destructive path"
            description="The irreversible action must be explicit, isolated, and visually subordinate to the context that justified it."
          >
            <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
              <Field label="Content">Boss fight clutch</Field>
              <Field label="Risk">Repeated policy rejection across feed projections</Field>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive">Take down content</Button>
                <Button variant="secondary">Cancel</Button>
              </div>
              <p className="text-caption text-faint">
                Destructive copy names the outcome. Neutral alternatives stay adjacent.
              </p>
            </div>
          </StateTile>
        </div>
      </Section>

      <Section id="stats" title="Stat cards" description="KPI tiles follow the shared information order: label, comparison pill, figure, insight, support copy.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ImageIcon />}
            label="In moderation"
            value="12"
            delta="+3"
            deltaTone="muted"
            insight="Review volume is steady"
            description="Content awaiting human decision"
          />
          <StatCard
            icon={<Users />}
            label="Active creators"
            value="1,284"
            delta="+42"
            insight="Creator base is growing"
            description="Accounts active in the current period"
          />
          <StatCard
            icon={<ListTree />}
            label="Failed jobs"
            value="7"
            delta="+2"
            deltaTone="danger"
            insight="Needs operator attention"
            description="AI jobs requiring retry or inspection"
          />
          <StatCard
            icon={<Coins />}
            label="Spend (30d)"
            value="$438"
            delta="-8%"
            deltaTone="success"
            insight="Spend is down this period"
            description="Provider cost over the last 30 days"
          />
        </div>
      </Section>

      <Section
        id="metric"
        title="Metric"
        description="The micro-label + figure atom. Label always above the value, matching StatCard. Boxed for a nested tile; bare to compose inside a card."
      >
        <Panel className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Metric label="Waiting" value={14} />
          <Metric label="Failed" value={3} tone="danger" align="center" />
          <Metric icon={<Heart />} label="Likes" value="1.2k" boxed />
          <Metric label="Published" value={128} tone="success" boxed />
        </Panel>
      </Section>

      <Section id="table" title="Data table" description="The primary admin surface — flat, dense, selectable rows.">
        <Panel>
          <PanelHeader
            eyebrow="Moderation"
            title="Review queue"
            action={<SearchInput placeholder="Filter…" className="h-8 w-56" />}
          />
          <DataTable columns={COLUMNS} rows={DEMO_ROWS} rowKey={(r) => r.id} selectedKey="019f-b204" />
        </Panel>
      </Section>

      <Section id="misc" title="Avatars & loading" description="Identity and skeleton states.">
        <Panel className="flex flex-wrap items-center gap-6 p-5">
          <div className="flex items-center gap-2">
            <UserAvatar name="Sarah Khan" size="sm" />
            <UserAvatar name="John Miller" />
            <UserAvatar name="Emily Carter" size="lg" />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <CheckCircle2 className="size-5 text-success" />
        </Panel>
      </Section>

      <Section id="fields" title="Fields & empty states" description="Detail rows for inspectors, and the placeholder for empty surfaces.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="grid grid-cols-2 gap-4 p-5">
            <Field label="Status"><StatusPill status="published" /></Field>
            <Field label="Priority"><PriorityPill priority="high" /></Field>
            <Field label="Content ID">
              <span className="font-mono text-xs text-faint">019f-a71c</span>
            </Field>
            <Field label="Creator">Sarah Khan</Field>
          </Panel>
          <Panel>
            <EmptyState
              icon={<Inbox />}
              title="No item selected"
              description="Select a row to see its details here."
              className="min-h-40"
            />
          </Panel>
        </div>
      </Section>

      <Section
        id="responsive"
        title="Responsive rules"
        description="The product is desktop-first, but it still needs a coherent fallback on smaller screens. The system should state what collapses, what stays visible, and what keeps task flow intact."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ResponsiveRule
            icon={<Monitor className="size-5" />}
            title="Desktop"
            body="Persistent left rail, full top bar, and the full 70/30 decision pattern. Dense tables keep their width and inspectors stay sticky."
          />
          <ResponsiveRule
            icon={<PanelRightOpen className="size-5" />}
            title="Tablet"
            body="Navigation moves behind the drawer trigger, content keeps the same hierarchy, and inspectors stack below the primary surface when width gets tight."
          />
          <ResponsiveRule
            icon={<Smartphone className="size-5" />}
            title="Mobile"
            body="Stack cards and controls vertically, keep actions large enough to tap, and preserve the same information order rather than inventing a second interaction model."
          />
        </div>
      </Section>
    </div>
  )
}
