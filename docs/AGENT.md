# AGENT.md

# Spendscape Engineering Operating Manual

You are working on **Spendscape**.

Spendscape is a premium financial intelligence platform—not an expense tracker.

The goal is to create one of the world's most beautiful, intelligent, and insightful personal finance experiences.

---

# Read First

Before writing any code, read and follow:

1. docs/PRODUCT_VISION.md
2. docs/FRONTEND_PRD.md
3. docs/DESIGN_SYSTEM.md
4. docs/ARCHITECTURE.md
5. docs/VISUALIZATION_GUIDELINES.md
6. docs/BACKEND_CONTRACT.md
7. docs/PROJECT_STATE.md

These documents are the source of truth.

Never ignore them.

---

# Technology Stack

Frontend

- Next.js 16 App Router
- React 19
- TypeScript (Strict)
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- TanStack Query
- Zustand
- React Hook Form
- Zod
- D3.js
- React Three Fiber (only when necessary)

Backend

- Supabase
- PostgreSQL
- Storage
- RPCs
- RLS
- Authentication

---

# Non-Negotiable Rules

Never:

- Invent backend fields
- Modify database schema without request
- Change RPC contracts
- Break TypeScript
- Ignore lint errors
- Leave TODOs
- Duplicate code
- Use `any`
- Hardcode values
- Create mock backend APIs
- Mix feature logic into shared components

---

# Architecture

Always follow:

Feature

↓

Query

↓

Hook

↓

Component

↓

Visualization

Never fetch directly inside UI components.

Never bypass the architecture.

---

# Development Workflow

For every task:

1. Read the relevant docs.
2. Analyze existing code.
3. Explain the implementation plan.
4. Implement only the requested milestone.
5. Run:

- npm run typecheck
- npm run lint
- npm run build

6. Fix every issue.
7. Verify the application runs without runtime errors.
8. Stop.
9. Summarize changes.

Never continue automatically.

Always wait for approval.

---

# Code Quality

Write production-ready code.

Code should be:

- Typed
- Reusable
- Accessible
- Responsive
- Maintainable
- Self-documenting

Optimize for readability over cleverness.

---

# Design Standards

Everything should feel:

- Apple-quality
- Linear-quality
- Arc-quality

Prioritize:

- whitespace
- typography
- motion
- hierarchy
- accessibility

Avoid visual clutter.

---

# Motion

Animations should communicate.

Never animate for decoration.

Respect reduced motion.

Maintain 60fps.

---

# Data Visualization

Visualization is the product.

Every chart must answer a question.

Avoid generic dashboards.

Follow:

docs/VISUALIZATION_GUIDELINES.md

---

# Backend

The backend already exists.

Do not redesign it.

Use:

src/types/database.types.ts

as the single source of truth.

Never edit generated types manually.

---

# Runtime Validation

All external data must be validated.

Prefer Zod over unsafe casting.

---

# Performance

Prefer:

- Server Components
- Streaming
- Dynamic Imports
- Memoization
- Lazy Loading

Avoid unnecessary client components.

---

# Accessibility

Every feature must support:

- Keyboard navigation
- Screen readers
- Reduced motion
- WCAG AA contrast
- Semantic HTML

---

# Git Workflow

One milestone = one commit.

Do not create commits automatically.

---

# Definition of Done

A milestone is complete only if:

- Feature implemented
- Production-ready
- Runtime verified
- No browser console errors
- Responsive
- Accessible
- npm run typecheck passes
- npm run lint passes
- npm run build passes

---

# If Blocked

Never invent solutions.

Explain:

- Why you're blocked
- What information is missing
- The safest next step

---

# Priority Order

1. Correctness
2. Architecture
3. Performance
4. Accessibility
5. UX
6. Visual polish

Never sacrifice correctness for speed.

---

# Mission

Build a product that users love opening.

Every screen should feel handcrafted.

Every interaction should teach users something about their finances.

Spendscape should become known for its exceptional data visualization, premium design, and engineering quality.