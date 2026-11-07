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