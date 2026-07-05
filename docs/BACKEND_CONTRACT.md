**"Generate Handoff" trigger confirmed** — locked alongside the Backend Architect role. Both are active for this conversation.

Now, the contract. This is written as a living technical document — precise enough that a frontend engineer with no prior context can integrate correctly on first attempt.

---

# Spendscape — Frontend Integration Contract

**Version:** 1.0  
**Produced by:** Backend Architecture  
**Status:** Authoritative. Do not deviate without a backend change request.  
**Supabase Project:** `hkcudyzcrnnavdkzlwsb` · Region: `ap-south-1` · Postgres 17

---

## 1. Environment Variables

Create `.env.local` in the project root. Never commit this file.

```bash
# ── Supabase ──────────────────────────────────────────────────────────────────

# Public project API URL. Safe to expose to the browser.
NEXT_PUBLIC_SUPABASE_URL=https://hkcudyzcrnnavdkzlwsb.supabase.co

# Publishable key (scoped, rotatable). Replaces the legacy anon key.
# Safe to expose to the browser. Used for all client-side Supabase calls.
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_3V92Z5jO8l-LASEq_jFmqg_L1Ii2Sqk

# ── Application ───────────────────────────────────────────────────────────────

# Full origin used to build the email-confirmation redirect URL during signup.
# Development:  http://localhost:3000
# Production:   https://your-production-domain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Rules:**
- `NEXT_PUBLIC_` variables are bundled into the client. They are intentionally public — the publishable key is designed to be exposed.
- Never add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` unless you are writing a trusted server-only script. It bypasses all RLS and must never reach the browser or be included in any client bundle.
- The legacy `anon` JWT key (`eyJhbGci...`) still works but is deprecated. Use the publishable key everywhere.

---

## 2. Required npm Packages

Install exactly these. Do not substitute alternatives.

```bash
npm install @supabase/supabase-js@^2.110.0 @supabase/ssr@^0.12.0
```

**Why both:**
- `@supabase/supabase-js` — the core client SDK (queries, auth, storage, RPCs)
- `@supabase/ssr` — the Next.js adapter that handles cookie-based session management across the Server Component / Client Component boundary. Without it, sessions silently break on refresh.

**Do not install:**
- `@supabase/auth-helpers-nextjs` — deprecated, replaced by `@supabase/ssr`
- `@supabase/auth-ui-react` — the backend does not use Supabase Auth UI flows

---

## 3. Supabase Client Architecture

There are exactly **three clients**. Each serves a distinct execution context. Using the wrong one in the wrong context will silently break session refresh or bypass RLS.

### 3a. Browser Client — Client Components only

```
lib/supabase/client.ts
```

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

**Rules:**
- Only call inside `'use client'` components
- Create a new instance per component or use a singleton via `useMemo` / module scope — both are safe
- Never import this in Server Components, Route Handlers, or Server Actions

---

### 3b. Server Client — Server Components, Route Handlers, Server Actions

```
lib/supabase/server.ts
```

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render — safe to ignore.
            // Middleware handles session refresh independently.
          }
        },
      },
    }
  );
}
```

**Rules:**
- Call `await createClient()` fresh on every request — never module-scope the instance
- This is the only client you use in `async` Server Components and Server Actions
- The `try/catch` in `setAll` is intentional and required — do not remove it

---

### 3c. Proxy Client — `proxy.ts` (Next.js 16 session refresh)

```
lib/supabase/middleware.ts   ← session logic lives here
proxy.ts                     ← Next.js 16 entry point
```

**`lib/supabase/middleware.ts`:**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

const PROTECTED = ['/dashboard', '/accounts', '/transactions', '/insights', '/settings'];
const AUTH_ONLY = ['/auth/login', '/auth/signup'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠ No logic between createServerClient and getUser().
  // Any early return here will randomly invalidate sessions.
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && PROTECTED.some(p => path.startsWith(p))) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ONLY.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}
```

**`proxy.ts` (project root):**

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Critical rules:**
- The file is named `proxy.ts` (not `middleware.ts`) — this is the Next.js 16 convention. The old `middleware.ts` convention is deprecated.
- `proxy()` must be exported (not `middleware()`).
- Do not add protected routes to the `matcher` directly — the session logic handles routing decisions internally.
- `getUser()` is always called on every matched request — this is by design to keep the session token refreshed.

---

## 4. Authentication Flow

All auth operations use Supabase Auth with email/password. No OAuth providers are configured (can be added without frontend contract changes).

### 4a. Sign Up

```typescript
// Server Action
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: 'Jane Doe' },  // stored in auth.users.raw_user_meta_data
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
});
```

**What happens on the backend:**
1. Supabase creates an `auth.users` row
2. A confirmation email is sent to the user
3. The `on_auth_user_created` trigger fires automatically and inserts a row into `public.profiles` with `full_name` from `raw_user_meta_data`
4. The user is NOT logged in yet — they must click the confirmation link

**Error codes to handle:**

| Supabase error message | User-facing message |
|---|---|
| `User already registered` | An account with that email already exists |
| `Password should be at least 6 characters` | Password must be at least 8 characters *(enforce 8 in your Zod schema)* |
| Any network error | Something went wrong. Try again. |

---

### 4b. Email Confirmation Callback

Route: `GET /auth/callback?code=<pkce_code>&next=<path>`

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
```

This route **must exist**. Without it, email confirmation links will 404.

---

### 4c. Sign In

```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password });
// On success: redirect to /dashboard or the `next` param
// On error: error.message === 'Invalid login credentials'
```

---

### 4d. Sign Out

```typescript
// Client Component
const supabase = createClient();  // browser client
await supabase.auth.signOut();
router.push('/auth/login');
router.refresh();  // clears the RSC cache — required
```

---

### 4e. Reading the Current User

```typescript
// Server Component / Server Action — authoritative, never stale
const { data: { user } } = await supabase.auth.getUser();

// Client Component — fast but potentially stale; only use for display
const { data: { user } } = await supabase.auth.getUser();

// Never use getSession() for access control — it reads from local cache
// and can be spoofed. Always use getUser() for gated data fetches.
```

**Available user fields:**

```typescript
user.id           // uuid — use this as user_id in all DB queries
user.email        // string
user.created_at   // ISO string
user.raw_user_meta_data.full_name  // set during signup
```

---

## 5. Database Types

The type file at `types/database.types.ts` is currently hand-authored. Regenerate it from the live schema whenever a migration is applied:

```bash
npx supabase gen types typescript \
  --project-id hkcudyzcrnnavdkzlwsb \
  > types/database.types.ts
```

Requires the Supabase CLI: `npm install -g supabase`

**Regenerate after every backend migration.** The backend engineer will notify you when a migration has been applied. Do not hand-edit the generated file — treat it as read-only output.

The `Database` type is used as the generic parameter for all three Supabase clients:

```typescript
createBrowserClient<Database>(...)
createServerClient<Database>(...)
```

---

## 6. Direct Table Access

These tables are accessible via the standard PostgREST REST API (`.from('table_name')`). All are protected by RLS — every query is automatically scoped to `auth.uid()`.

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
|---|---|---|---|---|---|
| `profiles` | ✅ own row | ❌ | ✅ own row | ❌ | Created automatically on signup via trigger |
| `accounts` | ✅ own | ✅ | ✅ own | ✅ own | `is_active` soft-delete preferred over hard delete |
| `categories` | ✅ own + system | ✅ | ✅ own only | ✅ own only | System rows (`is_system=true`) are read-only for users |
| `transactions` | ✅ own | ✅ | ✅ own | ✅ own | Use `increment_account_balance` RPC after insert |
| `budgets` | ✅ own | ✅ | ✅ own | ✅ own | |
| `insights` | ✅ own | ❌ | ✅ own (is_read only) | ❌ | Written exclusively by the backend/Edge Functions |

**Enforced constraints (the database will reject violations with a 23514 check_violation):**

| Column | Constraint |
|---|---|
| `transactions.amount` | Must be `> 0`. Direction is encoded in `kind`, never in sign. |
| `accounts.name` | Cannot be blank or whitespace-only |
| `profiles.currency` | Must match `^[A-Z]{3}$` (ISO 4217, e.g. `USD`, `INR`) |
| `accounts.currency` | Same as above |
| `transactions.currency` | Same as above |

---

## 7. RPC Contracts

All RPCs are `security definer` — they execute as the function owner (not the caller), but always scope results to `auth.uid()` internally. Callable by `authenticated` role only; `anon` calls will be rejected with a permission error.

---

### RPC 1 — `get_monthly_summary`

Replaces multiple parallel queries to `accounts`, `transactions`, and `categories`. Single round-trip.

```typescript
const { data, error } = await supabase.rpc('get_monthly_summary', {
  p_month: '2026-07-01',  // first day of target month — always day 01
});
```

**Request parameters:**

| Param | Type | Required | Notes |
|---|---|---|---|
| `p_month` | `string` (ISO date) | ✅ | First day of target month. e.g. `'2026-07-01'` |

**Response type:**

```typescript
interface MonthlySummary {
  total_balance: number;      // sum of all active account current_balance values
  income:        number;      // sum of income transactions in the month
  expense:       number;      // sum of expense transactions in the month
  net:           number;      // income − expense
  savings_rate:  number;      // (net / income) × 100, 1 decimal place. 0 if no income.
  categories: Array<{
    category_id:   string | null;  // null = uncategorized
    category_name: string | null;
    color:         string | null;
    total:         number;         // total expense for this category this month
  }>;                              // ordered by total desc, max 10 entries
}
```

**Error handling:**

```typescript
if (error) {
  // PGRST202: function not found — check RPC name spelling
  // 42501: permission denied — user is not authenticated
  console.error(error.code, error.message);
}
```

---

### RPC 2 — `get_transactions_page`

Paginated, filtered, and joined transaction list. Replaces separate fetches to `transactions`, `accounts`, and `categories`.

```typescript
const { data, error } = await supabase.rpc('get_transactions_page', {
  p_kind:        'expense',        // or 'income' | 'transfer' | null
  p_category_id: 'uuid-string',   // or null
  p_account_id:  'uuid-string',   // or null
  p_date_from:   '2026-07-01',    // ISO date, inclusive, or null
  p_date_to:     '2026-07-31',    // ISO date, inclusive, or null
  p_search:      'starbucks',     // matched against merchant + description, or null
  p_limit:       50,              // default 50, do not exceed 200
  p_offset:      0,               // page * limit
});
```

**Request parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `p_kind` | `'income' \| 'expense' \| 'transfer' \| null` | `null` | null = all kinds |
| `p_category_id` | `string \| null` | `null` | UUID string |
| `p_account_id` | `string \| null` | `null` | UUID string |
| `p_date_from` | `string \| null` | `null` | ISO date, inclusive |
| `p_date_to` | `string \| null` | `null` | ISO date, inclusive |
| `p_search` | `string \| null` | `null` | Trigram-indexed; fast at any volume |
| `p_limit` | `number` | `50` | Pagination page size |
| `p_offset` | `number` | `0` | Row offset: `page * p_limit` |

**Response type:**

```typescript
interface TransactionsPage {
  total: number;   // total matching rows across all pages — use for pagination UI
  rows: Array<{
    id:             string;
    account_id:     string;
    account_name:   string | null;
    category_id:    string | null;
    category_name:  string | null;
    category_color: string | null;
    kind:           'income' | 'expense' | 'transfer';
    amount:         number;   // always positive — direction is in `kind`
    currency:       string;   // ISO 4217, e.g. 'USD'
    merchant:       string | null;
    description:    string | null;
    occurred_at:    string;   // ISO 8601 timestamptz
    is_recurring:   boolean;
    notes:          string | null;
  }>;
}
```

---

### RPC 3 — `mark_insights_read`

Bulk-marks insights as read. Call after the user views the insights page.

```typescript
await supabase.rpc('mark_insights_read', {
  p_ids: ['uuid-1', 'uuid-2', 'uuid-3'],
});
// Returns void. No response body.
// Silently ignores IDs that don't belong to the current user.
```

**When to call:** After the `/insights` page renders and the user can see the unread insights. Collect the `id` values of all `is_read: false` rows and pass them in a single call. Do not call per-insight.

---

### RPC 4 — `increment_account_balance`

Updates `accounts.current_balance` atomically after a transaction is inserted.

```typescript
await supabase.rpc('increment_account_balance', {
  p_account_id: 'uuid-string',
  p_delta:      150.00,    // positive = credit (income), negative = debit (expense)
});
// Returns void.
```

**Call sequence for creating a transaction:**

```
1. INSERT into transactions
2. If insert succeeds → call increment_account_balance
3. If either fails → show error to user
```

The two operations are not in a database transaction (this is a known open issue tracked by the backend team). For the current scale this is acceptable. Do not attempt to wrap them in a client-side transaction — use the Server Action as provided.

---

## 8. Storage Bucket Contracts

### Bucket: `receipts`

| Property | Value |
|---|---|
| Visibility | **Private** |
| Max file size | 10 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `application/pdf` |
| Path convention | `{user_id}/{transaction_id}/{filename}` |

```typescript
// Upload
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(
    `${user.id}/${transactionId}/${file.name}`,
    file,
    { contentType: file.type, upsert: false }
  );

// Get a time-limited URL for display (60 minutes)
const { data: urlData } = await supabase.storage
  .from('receipts')
  .createSignedUrl(`${user.id}/${transactionId}/${filename}`, 3600);

// urlData.signedUrl — use this as the <img src> or download href
```

**After upload:** Store the storage path (`data.path`) in `transactions.metadata.receipt_path` (the `metadata jsonb` column exists for this purpose). Retrieve it later to reconstruct the signed URL.

```typescript
// After successful upload, update the transaction metadata:
await supabase
  .from('transactions')
  .update({ metadata: { receipt_path: data.path } })
  .eq('id', transactionId);
```

---

### Bucket: `avatars`

| Property | Value |
|---|---|
| Visibility | **Private** |
| Max file size | 2 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Path convention | `{user_id}/avatar.{ext}` |

```typescript
const ext = file.type.split('/')[1];  // 'jpeg', 'png', or 'webp'

// Upload (upsert: true replaces the existing avatar)
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.${ext}`, file, {
    contentType: file.type,
    upsert: true,
  });

// After upload: store the path in profiles.avatar_url
await supabase
  .from('profiles')
  .update({ avatar_url: data.path })
  .eq('id', user.id);

// Retrieve for display
const { data: urlData } = await supabase.storage
  .from('avatars')
  .createSignedUrl(`${user.id}/avatar.${ext}`, 3600);
```

**RLS enforcement (applies to both buckets):** The storage policies check that `auth.uid()::text` matches the first path segment. A user uploading to `{other_user_id}/...` will receive a `403`. Enforce the correct path on the frontend regardless — do not rely solely on the backend check.

---

## 9. Recommended Folder Structure

```
lib/
  supabase/
    client.ts          ← browser client factory (Client Components)
    server.ts          ← server client factory (Server Components, Actions)
    middleware.ts      ← updateSession() logic
  queries/
    dashboard.ts       ← get_monthly_summary RPC wrapper
    transactions.ts    ← get_transactions_page RPC wrapper
    accounts.ts        ← accounts table queries
    insights.ts        ← insights table queries + mark_insights_read
  mutations/
    transactions.ts    ← createTransaction Server Action
    accounts.ts        ← createAccount, updateAccount Server Actions
    insights.ts        ← markInsightsRead Server Action
  storage/
    receipts.ts        ← upload, getSignedUrl for receipts
    avatars.ts         ← upload, getSignedUrl for avatars
types/
  database.types.ts   ← generated by supabase CLI (do not hand-edit)
  api.types.ts        ← hand-authored: MonthlySummary, TransactionsPage, etc.
proxy.ts              ← Next.js 16 session proxy (project root)
```

Keep query wrappers thin — they should be typed pass-throughs, not business logic. Business logic belongs in Server Actions or RPCs.

---

## 10. Security Considerations

**Never do these:**

```typescript
// ❌ Never use getSession() for access control — it reads local cache
const { data: { session } } = await supabase.auth.getSession();
if (!session) redirect('/auth/login');  // WRONG — can be spoofed

// ✅ Always use getUser() — it validates with the Supabase Auth server
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/auth/login');
```

```typescript
// ❌ Never filter by user_id client-side after fetching all rows
const { data } = await supabase.from('transactions').select('*');
const mine = data.filter(t => t.user_id === user.id);  // WRONG — RLS already scopes this

// ✅ RLS automatically scopes all queries to auth.uid() — trust it
const { data } = await supabase.from('transactions').select('*');
```

```typescript
// ❌ Never pass user_id from the client to the database
await supabase.from('transactions').insert({ user_id: user.id, ... });
// This works but is redundant and fragile if user_id is spoofed

// ✅ The Server Action reads auth.uid() server-side, or RLS enforces it on insert
// The insert WITH CHECK policy ensures user_id = auth.uid() regardless
```

**Environment:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is intentionally public — it is scoped and safe
- `SUPABASE_SERVICE_ROLE_KEY` must only exist in Edge Functions and trusted server scripts, never in the Next.js app
- All pages under `/dashboard`, `/accounts`, `/transactions`, `/insights`, `/settings` are protected by the proxy — but Server Components must also call `getUser()` and redirect if null (defence in depth)

---

## 11. Data Fetching Strategy

Follow this decision tree for every new data fetch:

```
Is this data needed for the initial render?
  YES → Server Component fetch (async component, await createClient())
    Does it aggregate across multiple tables?
      YES → Use an RPC
      NO  → Direct .from() query
  NO → Client Component with TanStack Query
    Is it user-triggered (button click)?
      YES → useMutation → Server Action
      NO  → useQuery with supabase.rpc() or .from()
```

**Concrete rules:**
- Dashboard, Transactions page, Accounts page, Insights page → Server Component fetch on every navigation (no client-side stale data on first render)
- Filters, search, pagination → URL search params + Server Component re-render via `router.replace()`
- Forms (add transaction, add account) → Server Actions with `useActionState`
- Real-time updates (future) → Supabase Realtime subscriptions in Client Components

---

## 12. Error Handling Strategy

**Supabase error shape:**

```typescript
interface PostgrestError {
  code:    string;   // Postgres error code, e.g. '23514', '42501', 'PGRST202'
  message: string;
  details: string | null;
  hint:    string | null;
}
```

**Map these codes to user-facing messages:**

| Code | Meaning | User message |
|---|---|---|
| `23514` | Check constraint violation | "The value you entered isn't valid." |
| `23505` | Unique constraint violation | "This already exists." |
| `42501` | RLS / permission denied | "You don't have permission to do that." |
| `PGRST116` | No rows returned (`.single()`) | Handle as empty state, not an error |
| `PGRST202` | RPC not found | Backend/client version mismatch — log, don't show |
| Any `storage` error | Bucket/policy violation | "File upload failed. Check the file type and size." |

**Pattern for Server Actions:**

```typescript
// Return a typed state object — never throw from a Server Action
export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function createTransaction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Validate with Zod
  // 2. Get user (getUser(), never getSession())
  // 3. Insert
  const { error } = await supabase.from('transactions').insert({ ... });
  if (error) return { error: 'Could not save the transaction.' };
  // 4. Call RPC
  revalidatePath('/dashboard');
  return { success: true };
}
```

---

## 13. Caching Strategy

**Server Components** (Next.js App Router defaults):
- Every `fetch()` is cached per-request by default in Next.js 16
- Supabase queries do not use `fetch()` internally — they are uncached by default, which is correct. Dashboard data should always be fresh.
- Use `revalidatePath('/dashboard')` in Server Actions after mutations to clear the RSC cache for that route.

**TanStack Query** (Client Components):

```typescript
// Recommended default config — set once in QueryClient provider
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            60 * 1000,   // 1 minute — data is fresh for 60s
      gcTime:               5 * 60 * 1000,  // 5 minutes — keep in memory
      refetchOnWindowFocus: false,        // disable — Supabase data isn't truly real-time
      retry:                1,            // retry once on network error
    },
  },
})
```

**Cache invalidation pattern:**

```typescript
const queryClient = useQueryClient();

// After a mutation succeeds, invalidate the affected queries:
queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
queryClient.invalidateQueries({ queryKey: ['transactions'] });
```

**What to cache with TanStack Query vs. not:**

| Data | Cache? | Reason |
|---|---|---|
| Dashboard monthly summary | No — Server Component | Always fresh on navigation |
| Transaction list (paginated) | Yes — `useInfiniteQuery` | User may paginate repeatedly |
| Account list (dropdown) | Yes — `useQuery` | Rarely changes |
| Category list | Yes — `useQuery`, long staleTime | Extremely stable |
| Insights (unread count) | Yes — `useQuery` | Needed in sidebar badge |
| User profile | Yes — `useQuery` | Needed in header across all pages |

---

## 14. TanStack Query Structure

One query key file. Every key is defined centrally to avoid cache key drift.

```typescript
// lib/query-keys.ts
export const queryKeys = {
  profile:          () => ['profile']                          as const,
  accounts:         () => ['accounts']                        as const,
  categories:       () => ['categories']                      as const,
  insightsUnread:   () => ['insights', 'unread']              as const,
  transactions:     (filters: object) => ['transactions', filters] as const,
  monthlySummary:   (month: string) => ['monthly-summary', month] as const,
} as const;
```

**Query hook pattern:**

```typescript
// lib/hooks/use-categories.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';

export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color, icon, is_system')
        .order('name');

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,  // categories change rarely — 10 min stale time
  });
}
```

**Mutation hook pattern:**

```typescript
// lib/hooks/use-create-transaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction } from '@/app/(app)/dashboard/actions';
import { queryKeys } from '@/lib/query-keys';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createTransaction({}, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlySummary(currentMonth) });
    },
  });
}
```

---

## 15. Proxy (Middleware) Requirements

The `proxy.ts` file at the project root **must exist and must not be renamed to `middleware.ts`**. Next.js 16 uses the `proxy` file convention. The old `middleware` convention is deprecated and will produce a build warning.

**What the proxy does (do not bypass):**
1. Refreshes the Supabase session token on every request — keeps the cookie-based session alive
2. Redirects unauthenticated users away from protected routes to `/auth/login?next={path}`
3. Redirects authenticated users away from `/auth/login` and `/auth/signup` to `/dashboard`

**Currently protected routes** (defined in `lib/supabase/middleware.ts`):
```
/dashboard
/accounts
/transactions
/insights
/settings
```

**When adding new protected routes:** Notify the backend engineer to update the `PROTECTED` array in `lib/supabase/middleware.ts`. Do not edit `proxy.ts` directly to add routes — all routing logic belongs in the middleware module.

**Matcher config** — the current matcher excludes static files:
```typescript
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
```

This is correct and complete. Do not modify it without discussing with the backend engineer — an overly broad matcher causes unnecessary auth checks on static assets.

---

## Appendix: Backend Change Request Protocol

The frontend engineer must not modify schema, functions, RLS policies, or storage bucket configuration directly.

To request a backend change:
1. Describe the UI feature requiring the change
2. Specify what data shape you need
3. The backend engineer will design the RPC or schema change, apply the migration, and update this contract

The backend engineer will notify you when:
- A migration has been applied (regenerate `database.types.ts`)
- An RPC signature has changed (update call sites)
- A new bucket or policy has been added (new storage operations available)
- A constraint has changed (update Zod validation to match)

**This document is the source of truth.** If the live database behaviour differs from what is written here, that is a bug — report it to the backend engineer.
