import { supabase } from './supabase.js';


// REGISTER
export async function signUp(email, password, displayName) {

    const { data, error } = await supabase.auth.signUp({
        email,
        password,

        options: {
            data: {
                display_name: displayName
            }
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
export async function getCurrentUser() {

    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return data.user;
}