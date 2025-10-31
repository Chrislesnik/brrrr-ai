import {createClient} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Expose for debugging in the browser console
// Do NOT keep this in long-term; it's just to help verify connectivity quickly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== "undefined") (window as any).supabase = supabase;


