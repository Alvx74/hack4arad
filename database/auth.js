import { supabase } from './supabase.js';


// REGISTER
// redirectTo: page the confirmation email link should open (must be in the
// project's allowed Redirect URLs in Supabase → Authentication → URL Configuration).
export async function signUp(email, password, displayName, redirectTo) {

    const { data, error } = await supabase.auth.signUp({
        email,
        password,

        options: {
            data: {
                display_name: displayName
            },
            emailRedirectTo: redirectTo
        }
    });

    if (error) throw error;

    return data;
}


// LOGIN
export async function signIn(email, password) {

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) throw error;

    return data;
}


// LOGOUT
export async function signOut() {

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
}


// GET CURRENT USER
// Returns null when nobody is signed in (instead of throwing).
export async function getCurrentUser() {

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;

    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return data.user;
}


// FORGOT PASSWORD: emails a link that opens redirectTo in recovery mode
export async function requestPasswordReset(email, redirectTo) {

    const { error } =
        await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) throw error;
}


// SET A NEW PASSWORD (after opening the reset link)
export async function updatePassword(password) {

    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
}


// LISTEN FOR AUTH EVENTS (e.g. 'PASSWORD_RECOVERY', 'SIGNED_OUT')
export function onAuthChange(callback) {

    const { data } = supabase.auth.onAuthStateChange(
        (event, session) => callback(event, session)
    );

    return () => data.subscription.unsubscribe();
}
