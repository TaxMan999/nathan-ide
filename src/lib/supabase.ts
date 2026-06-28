import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isConfigured = Boolean(url && key);

// Only create the client when env vars are present — createClient throws otherwise
export const supabase: SupabaseClient = isConfigured
  ? createClient(url, key)
  : (null as unknown as SupabaseClient);
