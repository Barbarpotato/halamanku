import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const STORAGE_URL = `${supabaseUrl}/functions/v1/ebook-storage-service`;
export const SHARD_URL = `${supabaseUrl}/functions/v1/ebook-shard-service`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
