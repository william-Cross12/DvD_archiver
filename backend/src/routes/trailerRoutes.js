import express from 'express';
import { getTrailer } from '../controllers/trailerControllers.js';

const router = express.Router();

/**
 * Public trailer endpoints
 */
router.get('/:title', async (req, res) => {
    const { title } = req.params;

    // Check film title was passed
    if (!title) {
        return res.status(400).json({
            error: 'Missing film title parameter'
        });
    }

    // Try to retrieve film trailer video from YouTube
    try {
        const trailer = await getTrailer(title);
        res.status(200).json({
            message: 'Trailer retrieved successfully',
            trailer
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

export default router;
