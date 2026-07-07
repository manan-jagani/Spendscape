# Spendscape — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
Overhaul the Accounts experience to feel like a premium financial operating system, create a reusable PremiumHover motion wrapper to unify hover interactions across the entire application, and redesign every visualization to match Apple/Linear/Stripe-level quality — starting with Category Constellation (D3-force) replacing the generic D3 treemap.

## Constraints & Preferences
- DO NOT redesign the application's overall design language — keep existing colors, typography, glass materials, spacing scale, motion system, and premium aesthetic.
- Only unify interactions; do not change spacing, colors, typography, or layout.
- Use Framer Motion spring presets from `@/lib/motion` for all animations.
- All animations must be GPU-accelerated (transform and opacity only) — no layout thrashing.
- Respect `prefers-reduced-motion` — disable transforms, keep opacity transitions only.
- No duplicated animation code — every card uses the same reusable wrapper.
- Aim for interaction feel comparable to Linear, Arc Browser, and Apple Vision Pro.
- Deleting an account: if transactions reference it → archive instead; if no transactions → allow permanent deletion.
- Do NOT create duplicate components — reuse existing design system (Button, Card, Badge, Dialog, Sheet, Input, Select, Dropdown, motion presets).
- Keep strict typing.

## Progress
### Done
- Investigated existing accounts feature: discovered `useDeleteAccount` hook was missing (the root cause of delete not working), no toast system, no optimistic updates, plain CSS hover transforms inconsistent across components.
- **Expand types.ts**: Added `ACCOUNT_TYPE_ICONS` (lucide icons per type), `ACCOUNT_TYPE_ACCENT` (named accent map: emerald, gold, graphite, etc.), switched colors to OKLCH (desaturated, premium), added `SortOption` type and `SORT_OPTIONS` constant.
- **Created `useDeleteAccount` hook**: Checks transaction count first — if > 0, archives the account; if 0, hard deletes. Optimistic removal from cache with rollback on error.
- **Added optimistic updates + toasts** to all mutation hooks (`useCreateAccount`, `useUpdateAccount`, `useArchiveAccount`, `useRestoreAccount`, `useDeleteAccount`). Mutations update cache instantly and roll back on error. Toast notifications (success/error/info) via zustand store.
- **Redesigned AccountCard**: Premium glass card with accent color top strip, type icon in tinted container, animated balance number (eased count-up), decorative mini sparkline SVG, hover glow in accent color, reflection sweep on hover, three-dot dropdown menu (Edit/Archive/Restore/Delete). Uses `motion.button` directly with `SPRING.card` / `SPRING.press` for hover/press animations.
- **Redesigned AccountSheet**: Right-side detail sheet with large balance display, metadata grid (type, currency, created date), monthly cashflow (inflow/outflow from Supabase transactions query), recent transactions list, Edit/Archive/Delete action buttons, loading skeletons.
- **Updated AccountForm**: Account type icons in Select dropdown, balance field editable in both create and edit modes.
- **Rewrote AccountsPageClient**: Page header with metrics (Total Balance, account count, Net Worth), portfolio SVG donut chart, per-type summary cards, data-driven insight cards, search + filter toolbar (type, status, sort by 5 criteria), 2-3 column responsive grid with staggered spring animations, collapsible archived section, confirmation dialog for destructive actions, empty state with illustration, error state with retry.
- **Created PremiumHover component** (`src/components/motion/premium-hover.tsx`): Framer Motion wrapper with `mode="card"` (y: -4, scale: 1.015, press: 0.985) and `mode="row"` (x: 4, no scale). Uses `SPRING.card` / `SPRING.press` / `SPRING.gentle` presets. Respects reduced motion. Extends `ComponentPropsWithoutRef<"div">` for DOM compatibility.
- **Updated Card component**: Replaced inline Tailwind hover transforms (`hover:-translate-y-[3px] hover:scale-[1.01]`) with `<PremiumHover>` wrapper. Removed `transition-all` to avoid CSS Motion conflict (framer handles transform; `hover:glass-premium-hover` still applies CSS background/border/shadow changes).
- **Removed duplicate hover transforms** from MetricCard, BudgetCard, InsightCard, and TransactionRow — they now inherit PremiumHover animation through the updated Card component or via direct PremiumHover wrapping.
- MetricCard hover: removed `transition-transform hover:-translate-y-0.5 hover:shadow-card-hover` (now inherits PremiumHover via Card).
- BudgetCard hover: removed `transition-all duration-fast hover:-translate-y-0.5` (now inherits PremiumHover via Card).
- InsightCard hover: removed `transition-all duration-fast hover:-translate-y-0.5` (now inherits PremiumHover via Card).
- TransactionRow hover: removed `transition-all duration-normal hover:-translate-y-[1px] hover:scale-[1.002]` — wrapped in `<PremiumHover mode="row">` for consistent x:4 animation.
- AccountsPageClient local InsightCard and MetricCard: removed CSS hover transforms, wrapped in `<PremiumHover>` or used `whileHover` on `motion.div`.
- Verified `npm run typecheck` → 0 errors, `npm run lint` → 0 warnings, `npm run build` → compiled successfully in 2.5s.
- **Latest session**: Redesigned chart/dashboard color fix — removed `hsl(var(--oklch))` (invalid) across 8 files, replaced with bare `var(--)`; added `min-h-[250px]` to fix empty chart bug (circular ResizeObserver dependency in `useChartDimensions`); fixed D3 treemap crash (`hierarchy().sum().sort()` pipeline).
- **Latest session**: **Category Constellation** — completely replaced D3 treemap with D3-force simulation (`forceSimulation`, `forceCollide`, `forceManyBody`, `forceCenter`, `forceX`, `forceY`). Nodes sized 32-78px by spending proportion, placed with collision avoidance. Each node: 8 SVG layers (glow, shadow, gradient, shade, highlight, glass reflection arc, glass overlay, ring border). Select → pulse ring + intensified glow (SVG feGaussianBlur). Hover → scale 1.05, y: -4 via SPRING.card. Entrance → staggered spring from opacity 0 / scale 0.3 / y 40.
- **Latest session**: **Space background**: PRNG-seeded stars (55, twinkle animation), particles (35, drift), ambient glows (3). Dark/light radial gradients via `<rect>` with Tailwind `dark:block`/`dark:hidden` classes. Connecting lines on hover — `motion.line` from node edge to neighbor edges (<200px), fading with distance.
- **Latest session**: **Category icons**: lucide-react inside SVG `<foreignObject>`. Switch-based `CategoryIcon` helper component satisfies `react-hooks/static-components` lint rule (no dynamic component creation during render). Icon mapping: food→UtensilsCrossed, shopping→ShoppingBag, bills→Receipt, health→HeartPulse, entertainment→Gamepad2, travel→Plane, education→GraduationCap, investments→TrendingUp, default→CircleDollarSign.
- **Latest session**: Verified `npm run typecheck`, `npm run lint`, `npm run build` pass with zero errors/warnings.

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Gave glass-hero its own dedicated CSS variable set (`--glass-hero-*`) instead of sharing `--glass-premium-*` because `--glass-premium-*` in light mode is deliberately opaque paper (for normal cards), while glass-hero must remain translucent glass in both modes.
- Used `:root .glass-hero` rule to set `backdrop-filter: blur(40px)` for light mode — removing the paper override and explicitly adding the glass rule restores translucency.
- Removed CardContent horizontal padding via `.glass-hero [data-slot="card-content"] { padding-left: 0; padding-right: 0 }` — keeps CardHeader title padding intact while making the galaxy visualization full-bleed.
- For the Accounts page: created a dedicated `useDeleteAccount` hook instead of overloading archive/restore — keeps transaction-count check, conditional behavior, and optimistic updates isolated.
- For animations: removed `transition-all` from Card component to avoid CSS transition conflict with framer-motion's inline transform styles. CSS now handles only `background`, `border-color`, and `box-shadow` via `hover:glass-premium-hover`; framer-motion handles `y`, `scale` transforms.
- Used `whileTap={{ scale: 0.985, transition: SPRING.press }}` for press animation on all cards — matches existing button press behavior (`active:scale-[0.97]`).
- AccountCard uses `motion.button` directly instead of PremiumHover wrapper (because it's semantically a `<button>` element). Uses the same `SPRING.card`/`SPRING.press` presets for consistent feel.
- PremiumHover uses `React.ComponentPropsWithoutRef<"div">` as base interface (instead of `HTMLMotionProps<"div">`) to avoid type conflicts with components that spread standard div props (like Card). The spread to `motion.div` uses a cast.

## Next Steps
- Visual review in browser: verify Category Constellation renders correctly with actual data — check force layout feels organic, node layers composite correctly, colors match theme, tooltip positioning works.
- Verify reduced motion disables transforms entirely (opacity transitions only).
- Verify Category Constellation works with 1-2 categories edge case.

## Critical Context
- The `glass-hero` utility is only used on the Financial Galaxy ChartCard in the dashboard — glass-hero CSS changes are scoped to exactly one instance.
- `--glass-premium-bg` in light mode remains `oklch(1 0 0)` (opaque white) for all other cards — only glass-hero is translucent.
- PremiumHover is a `motion.div` wrapper; it cannot be used as a `<button>` element directly. AccountCard keeps its native `<button>` element replaced with `motion.button` — uses same spring presets.
- TransactionRow uses `mode="row"` for translateX animation; all other cards use default `mode="card"`.
- All mutation hooks now share the same optimistic update pattern: `onMutate` saves previous cache, `onError` restores it, `onSuccess` invalidates queries.
- Toast container is mounted inside `AccountsPageClient` with `position: fixed` bottom-right.
- PremiumHover accepts standard div props via `ComponentPropsWithoutRef<"div">` and casts them to motion.div props internally.
- Category Constellation uses D3-force from `d3-force` (bundled with `d3: ^7.9.0`). Import pattern: `import { forceSimulation, ... } from "d3-force"`. Simulation runs synchronously with `sim.stop()` + looped `sim.tick()` — no async timing.
- The `<foreignObject>` in each node renders the lucide icon as HTML. `CategoryIcon` helper uses a switch/case fallthrough pattern (not dynamic component references) to satisfy `react-hooks/static-components` ESLint rule.
- `useChartDimensions()` starts at {width:0, height:0} — `min-h-[250px]` on the container ref div is required to break the circular resize dependency.

## Relevant Files
- **src/app/globals.css**: Added `--glass-hero-*` CSS variable sets for light and dark modes. Updated `glass-hero` utility. Added `:root .glass-hero` glass restore rule, CardContent padding removal, and `::before` vignette mask.
- **src/features/accounts/types.ts**: Added `ACCOUNT_TYPE_ICONS`, `ACCOUNT_TYPE_ACCENT`, `SortOption`, `SORT_OPTIONS`. Colors in OKLCH.
- **src/components/ui/toast.tsx**: New — zustand-based toast store + `ToastContainer` component with framer-motion enter/exit animations.
- **src/features/accounts/hooks/use-delete-account.ts**: New — checks transaction count, archives or hard deletes, optimistic UI with rollback.
- **src/features/accounts/hooks/use-create-account.ts**: Updated — added toast on success/error.
- **src/features/accounts/hooks/use-update-account.ts**: Updated — optimistic update with rollback + toast.
- **src/features/accounts/hooks/use-archive-account.ts**: Updated — optimistic update with rollback + toast.
- **src/features/accounts/hooks/use-restore-account.ts**: Updated — optimistic update with rollback + toast.
- **src/components/motion/premium-hover.tsx**: New — reusable Framer Motion hover wrapper with `card` and `row` modes, spring presets, reduced-motion support. Uses `ComponentPropsWithoutRef<"div">` with internal cast to motion.div.
- **src/components/ui/card.tsx**: Updated — replaced inline Tailwind hover transforms with `<PremiumHover>` wrapper. Removed `transition-all` to avoid CSS/framer conflict.
- **src/features/accounts/components/account-card.tsx**: Redesigned — premium glass, reflections, glow, mini sparkline, animated balance, three-dot menu. Uses `motion.button` directly with `SPRING.card`/`SPRING.press`.
- **src/features/accounts/components/account-sheet.tsx**: Redesigned — detail side sheet with balance, metadata, cashflow, recent transactions.
- **src/features/accounts/components/account-form.tsx**: Updated — account type icons in Select, balance editable in both modes.
- **src/features/accounts/components/accounts-page-client.tsx**: Rewritten — header metrics, portfolio donut, summary cards, insights, search/filter, staggered grid, archived accordion, confirmation dialog, empty/error states. Local InsightCard/MetricCard use `PremiumHover` or `whileHover` from SPRING presets.
- **src/app/(app)/accounts/page.tsx**: Updated — cleaned metadata.
- **src/features/transactions/components/transaction-row.tsx**: Updated — wrapped in `<PremiumHover mode="row">`, removed inline hover transforms.
- **src/features/dashboard/components/metric-card.tsx**: Updated — removed `transition-transform hover:-translate-y-0.5 hover:shadow-card-hover` (inherits hover via Card + PremiumHover).
- **src/features/budgets/components/budget-card.tsx**: Updated — removed `transition-all duration-fast hover:-translate-y-0.5` (inherits via Card + PremiumHover).
- **src/features/insights/components/insight-card.tsx**: Updated — removed `transition-all duration-fast hover:-translate-y-0.5` (inherits via Card + PremiumHover).
- **src/visualizations/treemap/components/spending-treemap.tsx**: Rewritten — replaced D3 treemap with D3-force Category Constellation. Contains `ConstellationBackground` (stars, particles, nebula), `ConstellationConnectingLines` (hover connections), `CategoryIcon` (switch-based lucide icon mapping), `useForceLayout` (D3-force simulation), `SingleCategoryNode`, and `SpendingTreemap` export.
