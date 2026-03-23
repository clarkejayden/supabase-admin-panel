import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = new Set(["/login"]);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images")
  ) {
    return response;
  }

  if (pathname === "/auth/callback") {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: {
              domain?: string;
              expires?: Date;
              httpOnly?: boolean;
              maxAge?: number;
              path?: string;
              sameSite?: "lax" | "strict" | "none";
              secure?: boolean;
            };
          }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (PUBLIC_PATHS.has(pathname)) {
      return response;
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,is_superadmin")
      .eq("id", user.id)
      .single();

    const redirectTarget = profile?.is_superadmin ? "/admin" : "/access-denied";
    const redirectUrl = new URL(redirectTarget, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) {
    if (pathname === "/access-denied") {
      return response;
    }
    const deniedUrl = new URL("/access-denied", request.url);
    return NextResponse.redirect(deniedUrl);
  }

  if (pathname === "/access-denied") {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
