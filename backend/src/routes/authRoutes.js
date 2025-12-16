import express from 'express';
import {
    signUp,
    login,
    logout,
    updateAuthUser,
    updateUsername,
    deleteUser
} from '../controllers/authControllers.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Authentication endpoints (public)
 */

router.post('/signup', async (req, res) => {
    const {email, password, username } = req.body;

    // Ensure both email, password and username were entered
    if (!email || !password || !username) {
        return res.status(400).json({
            error: 'Missing a required field'
        });
    }

    // Try signup
    try {
        const newUser = await signUp(email, password, username);
        res.status(201).json({
            message: 'Account created successfully',
            newUser
        });
    } catch (err) {
        res.status(400).json({
            error: err.message || "Signup failed"
        });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Ensure both email and password were entered
    if (!email || !password) {
        return res.status(400).json({
            error: 'Missing required field'
        });
    }

    // Try login
    try {
        const loginUser = await login(email, password);
        res.status(200).json({
            accessToken: loginUser.session.access_token,
            user: loginUser.user
        });
    } catch (err) {
        res.status(401).json({
            error: err.message || "Login failed"
        });
    }
});

router.post('/logout', async (req, res) => {
    // Try logout
    try {
        await logout();
        res.status(200).json({
            message: "Logout successfull"
        });
    } catch (err) {
        res.status(500).json({
            error: err.message || "Logout failed"
        });
    }
})

/**
 * Protected user management endpoints
 */

router.put('/update-auth-user', requireAuth, async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const updates = req.body;

    // Ensure that an updated field was provided
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Please provide a field to update' });
    }

    // Try update
    try {
        const updatedUser = await updateAuthUser(token, updates);
        res.status(200).json({
            message: "User updated successfully",
            updatedUser
        });
    } catch (err) {
        res.status(400).json({
            error: err.message || "Update user failed"
        });
    }
});

router.put('/update-username', requireAuth, async (req, res) => {
    const updates = req.body;

    // Ensure that an updated field was provided
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Please provide a field to update' });
    }

    // Try update
    try {
        const userID = req.user.id;
        const updatedUser = await updateUsername(userID, updates);
        res.status(200).json({
            message: "User updated successfully",
            updatedUser
        });
    } catch (err) {
        res.status(400).json({
            error: err.message || "Update user failed"
        });
    }
});

router.delete('/delete', requireAuth, async (req, res) => {
    const userID = req.user.id;

    // Try delete
    try {
        await deleteUser(userID);
        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (err) {
        res.status(400).json({
            error: err.message || "Delete user failed"
        });
    }
});

export default router;
