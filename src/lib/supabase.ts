import {createClient, type SupabaseClient} from "@supabase/supabase-js";

// IMPORTANT: Vite only inlines env vars when accessed statically like below.
// Do not read them dynamically (e.g. via a helper) or they will be undefined in production.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate env at build/runtime
if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly so we don't hang on auth calls
  throw new Error(
    "Missing Supabase env. Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
  );
}

// Guard against wrong domain (must be .supabase.co)
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl)) {
  // Not throwing, but warn to help correct mistakes quickly
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_URL does not look like a Supabase project URL (expected https://<ref>.supabase.co)",
    supabaseUrl,
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {"X-Client-Info": "brrrr-ai-web"},
  },
});

// Expose for debugging in the browser console
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== "undefined") (window as any).supabase = supabase;

export async function verifySupabaseConnectivity(): Promise<void> {
  try {
    const healthUrl = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/health`;
    const res = await fetch(healthUrl, {method: "GET"});
    // eslint-disable-next-line no-console
    console.log("[supabase] auth health", res.status, await res.text().catch(() => ""));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[supabase] auth health check failed", err);
  }
}


