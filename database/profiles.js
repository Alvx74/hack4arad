import { supabase } from './supabase.js';


// GET MY PROFILE
export async function getMyProfile() {

    const { data: { user }, error: userError } =
        await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) throw error;

    return data;
}

export async function loseFirstBlood() {
    const { data: { user }, error: userError } =
        await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) return;

    const { error } = await supabase
        .from('profiles')
        .update({ is_first_blood: false })
        .eq('id', user.id);

    if (error) throw error;
}