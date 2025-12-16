import { supabase } from "../supabase.js";

/**
 * Returns a map of user_ids and usernames for every passed in user_id.
 */
async function getUsernamesByIDs(userIDs) {
    const { data: usernames, error: usersError } = await supabase
        .from('users')
        .select('user_id, username')
        .in('user_id', userIDs);

    if (usersError) {
        throw new Error('Failed to fetch review usernames');
    }

    // Map user_ids and usernames together
    const userMap = Object.fromEntries(usernames.map(user => [user.user_id, user.username]));

    return userMap;
}

export { getUsernamesByIDs };
