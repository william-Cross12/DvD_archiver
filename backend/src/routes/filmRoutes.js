import express from 'express';
import { retrieveFilm, searchFilms } from '../controllers/filmControllers.js';

const router = express.Router();

/**
 * Film detail endpoints (public)
 */
router.get('/film', async (req, res) => {
    const { title, id, year } = req.query;

    // Ensure the query contained a title. Year is optional
    if (!title && !id) {
        return res.status(400).json({
            error: 'Missing one of the required film title or id parameters'
        });
    }

    // Try film search
    try {
        const filmDetails = await retrieveFilm(title, id, year);
        res.status(200).json({
            message: 'Film details retrieved successfully',
            film: filmDetails
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

router.get('/search', async (req, res) => {
    const { search, page } = req.query;

    // Ensure the query contained a search term
    if (!search) {
        return res.status(400).json({
            error: 'Missing required search term parameter'
        });
    }

    // Try search for films using the search term
    try {
        const searchResults = await searchFilms(search, page);
        res.status(200).json({
            message: 'Search results retrieved successfully',
            searchResults
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

export default router;
