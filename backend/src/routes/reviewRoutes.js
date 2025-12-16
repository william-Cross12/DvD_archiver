import express from 'express';
import {
    addReview,
    getReviewsByFilm,
    getReviewsByUser,
    getFilteredReviews,
    updateReview,
    deleteReview
} from '../controllers/reviewControllers.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public film review endpoints
 */
router.get('/reviews/film/:filmID', async (req, res) => {
    const { filmID } = req.params;

    // Check filmID was passed
    if (!filmID) {
        return res.status(400).json({
            error: 'Missing film id parameter'
        });
    }

    // Try to retrieve reviews for film with passed filmID
    try {
        const reviews = await getReviewsByFilm(filmID);
        res.status(200).json({
            message: 'Film reviews retrieved successfully',
            reviews
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get('/reviews/user/:userID', async (req, res) => {
    const { userID } = req.params;

    // Check userID was passed
    if (!userID) {
        return res.status(400).json({
            error: 'Missing user id parameter'
        });
    }

    // Try to retrieve reviews for user with passed userID
    try {
        const reviews = await getReviewsByUser(userID);
        res.status(200).json({
            message: 'User reviews retrieved successfully',
            reviews
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get('/reviews/filter', async (req, res) => {
    const { filmID, userID, rating, reviewText } = req.query;

    // Build filters
    const filters = {};
    if (filmID) filters.filmID = filmID;
    if (userID) filters.userID = userID;
    if (rating) filters.rating = parseInt(rating);
    if (reviewText) filters.reviewText = reviewText;

    // Make sure at least one filter was passed
    if (Object.keys(filters).length === 0) {
        return res.status(400).json({
            error:  'At least one filter parameter is required'
        });
    }

    // Try to retrieve reviews using the passed filters
    try {
        const reviews = await getFilteredReviews(filters);
        res.status(200).json({
            message: 'Reviews filtered and retrieved successfully',
            reviews
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

/**
 * Protected film review endpoints
 */
router.post('/add-review', requireAuth, async (req, res) => {
    const { filmID, userID, rating, reviewText } = req.body;

    // Check all required parameters are passed
    if (!filmID || !userID || !rating || !reviewText) {
        return res.status(400).json({
            error: 'Missing a required review parameter'
        });
    }

    // Check rating is between 0 and 10 (inclusive)
    if (rating < 0 || rating > 10) {
        return res.status(400).json({
            error: 'Rating must be between 0 and 10'
        })
    }

    // Try to add review
    try {
        const result = await addReview(filmID, userID, rating, reviewText);
        res.status(200).json({
            message: result.message
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.put('/update-review/:reviewID', requireAuth, async (req, res) => {
    const { reviewID } = req.params;
    const userID = req.user.id;
    const { rating, reviewText } = req.body;

    // Check all required parameters are passed
    if (!reviewID || !userID || !rating || !reviewText) {
        return res.status(400).json({
            error: 'Missing a required parameter'
        });
    }

    // Check rating is between 0 and 10 (inclusive)
    if (rating < 0 || rating > 10) {
        return res.status(400).json({
            error: 'Rating must be between 0 and 10'
        })
    }

    // Try to update review
    try {
        const result = await updateReview(reviewID, userID, rating, reviewText);
        res.status(200).json({
            message: result.message
        });
    } catch (err) {
        res.status(403).json({
            error: err.message
        });
    }
});

router.delete('/delete-review/:reviewID', requireAuth, async (req, res) => {
    const { reviewID } = req.params;
    const userID = req.user.id;

    // Check all required parameters are passed
    if (!reviewID || !userID) {
        return res.status(400).json({
            error: 'Missing a required parameter'
        });
    }

    // Try to delete review
    try {
        const result = await deleteReview(reviewID, userID);
        res.status(200).json({
            message: result.message
        });
    } catch (err) {
        res.status(403).json({
            error: err.message
        });
    }
});

export default router;
