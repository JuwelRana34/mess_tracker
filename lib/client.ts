import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  // sora-sori process.env theke value call kora hocche
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
};