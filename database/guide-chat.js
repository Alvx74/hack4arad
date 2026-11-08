import { supabase } from './supabase.js';


// GUIDE CHAT: asks the Edge Function (code in supabase/functions/guide-chat)
// for the guide's next message. The Grok key stays on the server.
// The name it was deployed under in the Supabase dashboard:
const FUNCTION_NAME = 'rapid-handler';

export async function guideChat(payload) {

    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body: payload });

    if (error) throw error;
    if (!data || !data.reply) throw new Error((data && data.error) || 'empty reply');

    return data.reply;
}
