# Spendscape Frontend

Production frontend foundation for Spendscape, built with the Next.js App
Router and strict TypeScript.

## Stack

- Next.js 16 and React 19
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- TanStack Query
- Zustand
- React Hook Form and Zod
- ESLint with Next.js Core Web Vitals rules

## Local development

The supported package manager is npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

Run all checks together with `npm run check`.

## Source structure

```text
src/
├── app/             Routes, layouts, and route-level states
├── components/
│   ├── layout/      Shared application shell components
│   ├── motion/      Reusable motion primitives
│   └── ui/          shadcn/ui primitives
├── features/        Feature-owned UI, hooks, schemas, and data access
├── hooks/           Cross-feature React hooks
├── lib/             Library configuration and shared infrastructure
├── providers/       Root client providers
├── stores/          Cross-feature Zustand stores
├── types/           Shared TypeScript types
├── utils/           Pure, framework-independent helpers
└── visualizations/  Shared interactive data visualizations
```

Feature-specific code should remain inside its feature. Promote code to a
shared directory only when multiple features consume it.

## Adding shadcn/ui components

```bash
npx shadcn add button
```

The generated components live in `src/components/ui`.

## Backend status

Supabase is configured through `@supabase/ssr` with separate browser, server,
and proxy clients. Copy `.env.example` to `.env.local` and use the values from
the authoritative backend contract.

The generated schema lives at `src/types/database.types.ts`. Regenerate it
after backend migrations; never edit it by hand.
