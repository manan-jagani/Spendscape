import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { publicEnvironment } from "@/lib/env";
import type { Database } from "@/types/database.types";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/insights",
  "/settings",
] as const;

const AUTH_ROUTES = ["/login", "/signup"] as const;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Keep this call immediately after client creation so refresh is never skipped.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ROUTES.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
