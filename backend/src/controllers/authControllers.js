import { supabase } from "../supabase.js";

/**
 * New user sign up function.
 * Creates a new user, using Supabase Authentication.
 */
async function signUp(email, password, username) {
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        // Email already in use check
        if (signUpError.message.includes("already registered")) {
            throw new Error("Email already in use");
        }
        // Throw new error for simpler testing
        throw new Error(signUpError.message);
    }

    const userID = userData.user.id;

    // Add user and their username to the users table
    const { error: insertError } = await supabase
        .from('users')
        .insert({
            user_id: userID,
            username
        });

    if (insertError) {
        // Username already taken check
        if (insertError.message.includes("duplicate key value") ||
            insertError.code === "23505"
        ) {
            throw new Error("Username already taken");
        }
        // Secondary email already in use check
        if (insertError.message.includes("violates foreign key constraint") ||
            insertError.code === "23503"
        ) {
            throw new Error("Email already in use")
        }
        // Throw new error for simpler testing
        throw new Error(insertError.message);
    }

    return userData;
}

/**
 * User login function.
 * Returns an access token, alongside user info.
 */
async function login(email, password) {
    const { data: userData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    return userData;
}

/**
 * User logout function.
 */
async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
}

/**
 * Update user auth details function.
 * An authenticated user can update their own email or password.
 * It requires a valid access token.
 */
async function updateAuthUser(token, updates) {
    const { data, error } = await supabase.auth.updateUser(updates, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (error) throw error;

    return data;
}

/**
 * Update username function.
 * An authenticated user can update their username.
 * It requires a valid access token.
 */
async function updateUsername(userID, updates) {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userID);

    if (error) throw error;

    return data;
}

/**
 * Delete user function.
 * An authenticated user can delete their own account.
 * Uses the supabase admin api and requires a service role key.
 */
async function deleteUser(userID) {
    const { error } = await supabase.auth.admin.deleteUser(userID);

    if (error) throw error;
}

export { signUp, login, logout, updateAuthUser, updateUsername, deleteUser };
