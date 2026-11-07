import { createClient } from
    'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://scplcjroxictdslyrfez.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_8TMINrdD634yA-Tls7TWjQ_jGHzkz8t';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);