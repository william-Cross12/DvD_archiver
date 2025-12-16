import { supabase } from "../supabase.js";

/**
 * Use middleware to check that a request is authenticated.
 */

export const requireAuth = async (req, res, next) => {
    // Retrieve token from Authorization header, and remove 'Bearer' from formatting.
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        // Retrieve user associated with token if exists, else throw error and reject request.
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) throw error;

        // Store authenticated user info in request and continue to route handler.
        req.user = data.user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
