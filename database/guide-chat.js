import { supabase } from './supabase.js';


// GUIDE CHAT: asks the "guide-chat" Edge Function (supabase/functions/guide-chat)
// for the guide's next message. The Grok key stays on the server.
export async function guideChat(payload) {

    const { data, error } = await supabase.functions.invoke('guide-chat', { body: payload });

    if (error) throw error;
    if (!data || !data.reply) throw new Error((data && data.error) || 'empty reply');

    return data.reply;
}
