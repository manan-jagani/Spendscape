# Spendscape — Frontend Architecture

Version: 1.0
Status: Living Document
Owner: Engineering

---

# Purpose

This document defines how the frontend is structured.

Its goals are:

- Scalability
- Maintainability
- Reusability
- Performance
- Consistency

If two implementations are possible, choose the one that best follows this document.

---

# Architecture Principles

The application follows:

- Feature-first architecture
- Domain-driven organization
- Composition over inheritance
- Reusable UI primitives
- Thin UI components
- Strong typing
- Separation of concerns

---

# High Level Architecture

```
User
    │
    ▼
Next.js App Router
    │
    ▼
Server Components
    │
    ▼
Server Actions / Route Handlers
    │
    ▼
Supabase Client
    │
    ▼
Supabase
    │
    ▼
PostgreSQL
```

---

# Folder Structure

```
src/

app/

components/

features/

hooks/

lib/

providers/

stores/

types/

utils/

visualizations/
```

---

# Responsibilities

## app/

Contains:

- routes
- layouts
- loading.tsx
- error.tsx
- page.tsx

Never place business logic here.

---

## features/

Business features.

Example:

```
features/

dashboard/

transactions/

accounts/

budgets/

insights/

settings/

profile/
```

Each feature owns:

```
components/

hooks/

queries/

schemas/

types/

utils/

actions/
```

---

## components/

Shared UI.

Never store feature-specific components here.

Examples:

Button

Card

Dialog

Navbar

Sidebar

StatCard

Skeleton

---

## visualizations/

Shared visualization engine.

Contains:

Treemap

Sankey

Calendar Heatmap

Financial Galaxy

Bubble Chart

Sunburst

Timeline

Visualization helpers

---

## lib/

Infrastructure.

Contains:

Supabase

Query Keys

API

Constants

Utilities

Configuration

Never store UI here.

---

## stores/

Global Zustand stores only.

Examples:

Theme

Command Palette

Sidebar

User Preferences

Never duplicate server state.

---

## hooks/

Reusable hooks.

No feature logic.

Examples:

useMediaQuery()

useDebounce()

useMounted()

---

## utils/

Pure functions.

No React.

No Supabase.

No DOM.

---

# Data Flow

Never bypass this flow.

```
Supabase

↓

Typed Query

↓

TanStack Query

↓

Feature Hook

↓

Component

↓

Visualization
```

Never fetch directly inside components.

---

# State Management

Server State

TanStack Query

Local UI State

React State

Global UI State

Zustand

Never put fetched server data inside Zustand.

---

# Server Components

Default.

Prefer Server Components whenever possible.

Client Components only when required.

---

# Client Components

Only for:

Forms

Animations

Charts

Interactive Filters

Drag & Drop

Realtime

Everything else should remain server-rendered.

---

# Server Actions

Mutations only.

Examples:

Create Transaction

Update Account

Delete Budget

Never call SQL directly from the UI.

---

# Supabase

Single source of truth.

No duplicated models.

No mocked schemas.

Never hardcode IDs.

---

# Query Layer

Every query belongs inside:

```
lib/queries/
```

Components never call Supabase directly.

---

# Mutation Layer

Every mutation belongs inside:

```
lib/actions/
```

or

```
features/*/actions/
```

---

# Forms

Flow:

```
React Hook Form

↓

Zod

↓

Server Action

↓

Supabase

↓

Revalidate

↓

UI
```

---

# Authentication

Handled by:

Supabase Auth

Proxy

Server Components

Never manually check JWTs.

---

# Error Handling

Every async operation supports:

Loading

Success

Error

Retry

Empty

---

# Routing

App Router.

Protected Routes

Dashboard

Transactions

Accounts

Budgets

Insights

Settings

Public Routes

Landing

Login

Signup

---

# Code Standards

No `any`

Strict TypeScript

Small functions

Reusable components

Meaningful naming

Self-documenting code

---

# Naming

Components

PascalCase

Hooks

camelCase

Files

kebab-case

Folders

kebab-case

Types

PascalCase

Constants

UPPER_CASE

---

# Performance

Lazy loading

Memoization

Dynamic imports

Virtualized lists

Optimized images

Streaming

Server Components first

---

# Visualization Architecture

Visualizations are isolated.

```
visualizations/

Treemap/

Sankey/

Galaxy/

Timeline/

Heatmap/
```

Each visualization owns:

```
components/

hooks/

utils/

types/
```

---

# Design System

Every component must use:

Design Tokens

Spacing System

Typography Scale

Motion Tokens

Semantic Colors

Never hardcode styles.

---

# Dependency Rules

Allowed

Feature

↓

Shared Components

↓

Lib

↓

Utils

Not Allowed

Feature A

↓

Feature B

No circular dependencies.

---

# Testing Strategy

Future:

Unit Tests

Integration Tests

E2E Tests

Visual Regression

Accessibility Tests

---

# Build Requirements

Every PR must pass:

Typecheck

Lint

Build

Accessibility

No warnings.

---

# Scalability

Architecture should comfortably support:

100+

Components

50+

Pages

Millions of transactions

Multiple visualization engines

AI features

Future mobile application

---

# Engineering Principles

Always optimize for:

Maintainability

Readability

Scalability

Performance

Accessibility

Developer Experience

Never optimize only for fewer lines of code.