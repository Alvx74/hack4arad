import { createClient } from
    'https://esm.sh/@supabase/supabase-js@2';

// Project URL only: supabase-js adds /auth/v1, /rest/v1 ... itself.
export const SUPABASE_URL = 'https://scplcjroxictdslyrfez.supabase.co';
// Publishable (public) key: safe in the browser, access is limited by Row Level Security.
export const SUPABASE_KEY = 'sb_publishable_8TMINrdD634yA-Tls7TWjQ_jGHzkz8t';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,        // stay signed in across visits
            autoRefreshToken: true,
            detectSessionInUrl: true,    // finish sign-in from email confirmation / reset links
        }
    }
);
