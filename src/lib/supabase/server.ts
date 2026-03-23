import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
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
          // Server Components cannot mutate cookies. Ignore refresh writes here.
          cookiesToSet.forEach(() => {});
        }
      }
    }
  );
}

export function createAdminClient() {
  return createAdminSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: { headers: { "X-Client-Info": "supabase-admin-server" } }
    }
  );
}

export async function requireSuperadmin() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,is_superadmin,email")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_superadmin) {
    redirect("/access-denied");
  }

  return { user, profile };
}
