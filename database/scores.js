import { supabase } from './supabase.js'

export async function savePlaceScore(placeId, score) {
    
    const { error } = await supabase.rpc(
        'save_place_score',
        {
            p_place_id: placeId,
            p_score: score
        }
    );

    if (error) throw error;

}

export async function getMyScores() {

    const { data, error } = await supabase
        .from('place_scores')
        .select('*');

    if (error) throw error;

    return data;
}

// LEADERBOARD (needs database/leaderboard.sql to be run once in Supabase)

// Records one finished quiz at a place. The first attempt decides "first blood".
// Returns { first_attempt, first_blood, best_score }.
export async function recordPlaceResult(placeId, score, maxScore) {

    const { data, error } = await supabase.rpc(
        'record_place_result',
        {
            p_place_id: placeId,
            p_score: score,
            p_max: maxScore
        }
    );

    if (error) throw error;

    return data;
}

// [{ username, first_bloods, score, is_me }]
export async function getLeaderboard() {

    const { data, error } = await supabase.rpc('get_leaderboard');

    if (error) throw error;

    return data || [];
}
