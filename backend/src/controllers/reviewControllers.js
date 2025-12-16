import axios from 'axios';
import dotenv from 'dotenv';
import { supabase } from "../supabase.js";
import { getUsernamesByIDs } from '../utils/userHelpers.js';

dotenv.config();

// OMDb API url and key
const OMDB_URL = process.env.OMDB_URL;
const API_KEY = process.env.OMDB_API_KEY;

/**
 * Function to add a review and a rating to a film.
 * Needs a userID and a filmID.
 */
async function addReview(filmID, userID, rating, reviewText) {
    try {
        // Check if film is already stored in Supabase table
        const { data: filmDetails } = await supabase
            .from('filmDetails')
            .select('*')
            .eq('film_id', filmID)
            .single();

        // If no details were returned, fetch the film from OMDb
        if (!filmDetails) {
            const params = {
                apikey: API_KEY,
                type: "movie",
                i: filmID
            };

            const omdbResponse = await axios.get(
                OMDB_URL,
                { params }
            );

            if (omdbResponse.data.Response === 'False') {
                throw new Error(omdbResponse.data.Error);
            }

            const newDetails = omdbResponse.data;

            // Insert film into Supabase filmDetails table
            const newFilm = {
                film_id: newDetails.imdbID,
                Title: newDetails.Title,
                Released: newDetails.Released,
                Runtime: newDetails.Runtime,
                Director: newDetails.Director,
                Plot: newDetails.Plot,
                Awards: newDetails.Awards || "",
                Poster: newDetails.Poster || "",
                BoxOffice: newDetails.BoxOffice || null,
                RottenTomatoes: newDetails.ratings && newDetails.Ratings[1] ? newDetails.Ratings[1].Value : null,
                imdbRating: newDetails.imdbRating || null,
                Metascore: newDetails.Metascore || null,
                Genre: newDetails.Genre || "",
                Actors: newDetails.Actors || ""
            }

            const { error: insertFilmError } = await supabase
                .from('filmDetails')
                .insert(newFilm);

            if (insertFilmError) {
                throw new Error("Failed to insert film details");
            }
        }

        // Add the review
        const { error: addReviewError } = await supabase
            .from('filmReviews')
            .insert({
                film_id: filmID,
                user_id: userID,
                rating: rating,
                review: reviewText
            });

        if (addReviewError) {
            throw new Error('Failed to add film review');
        }

        return { message: 'Review added successfully!' };
    } catch (error) {
        throw new Error(error.message || 'Film review addition unsuccessful');
    }
}

/**
 * Function to get reviews by film ID.
 * It also returns the username of the user that submitted the review.
 */
async function getReviewsByFilm(filmID) {
    let { data: filmReviews, error: reviewsError } = await supabase
        .from('filmReviews')
        .select(`*`)
        .eq('film_id', filmID)
        .order('created_at', { ascending: false });

    if (reviewsError) {
        throw new Error('Failed to fetch reviews for this film');
    }

    // Error if no reviews were found
    if (!filmReviews.length) {
        throw new Error('No reviews found for this film');
    }

    // Retrieve userIDs from the reviews, and send them to the getUsernames helper
    const userIDs = [...new Set(filmReviews.map(review => review.user_id))];

    let userMap;

    try {
        userMap = await getUsernamesByIDs(userIDs);
    } catch (error) {
        throw new Error(error.message);
    }

    // Add usernames into the review JSON body
    filmReviews = filmReviews.map(review => ({
        ...review,
        username: userMap[review.user_id] || 'Unknown'
    }));

    return filmReviews;
}

/**
 * Function to get reviews by user ID.
 */
async function getReviewsByUser(userID) {
    const { data: userReviews, error } = await supabase
        .from('filmReviews')
        .select(`*`)
        .eq('user_id', userID)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error('Failed to fetch reviews by this user');
    }

    // Error if no reviews were found
    if (!userReviews.length) {
        throw new Error('No reviews found by this user');
    }


    return userReviews;
}

/**
 * Function to filter reviews as necessary allowing for dynamic queries.
 * Filters by a combination of filmID, userID, rating and reviewText,
 * based on what parameters were passed.
 * It also returns the username of the user that submitted the review.
 */
async function getFilteredReviews(filters) {
    let query = supabase
        .from('filmReviews')
        .select(`*`)
        .order('created_at', { ascending: false });

    // Apply extra filters if they were passed in
    if (filters.filmID) {
        query = query.eq('film_id', filters.filmID);
    }

    if (filters.userID) {
        query = query.eq('user_id', filters.userID);
    }

    if (filters.rating) {
        query = query.eq('rating', filters.rating);
    }

    if (filters.reviewText) {
        query = query.ilike('review', `%${filters.reviewText}%`);
    }

    // Perform query
    let { data: filteredReviews, error: filterError } = await query;

    if (filterError) {
        throw new Error('Failed to fetch filtered reviews');
    }

    // Error if no reviews were found
    if (!filteredReviews.length) {
        throw new Error('No reviews found within the passed filters');
    }

    // Retrieve userIDs from the reviews, and send them to the getUsernames helper
    const userIDs = [...new Set(filteredReviews.map(review => review.user_id))];

    let userMap;

    try {
        userMap = await getUsernamesByIDs(userIDs);
    } catch (error) {
        throw new Error(error.message);
    }

    // Add usernames into the review JSON body
    filteredReviews = filteredReviews.map(review => ({
        ...review,
        username: userMap[review.user_id] || 'Unknown'
    }));

    return filteredReviews;
}

/**
 * Function to update a review by its review ID.
 * Only the rating and review text can be updated.
 * Only the user that created the review can update it.
 */
async function updateReview(reviewID, userID, newRating, newReviewText) {
    try {
        // Check review belongs to the user
        const { data: reviewUser, error: fetchError } = await supabase
            .from('filmReviews')
            .select('user_id')
            .eq('review_id', reviewID)
            .single();

        if (fetchError || !reviewUser ) {
            throw new Error('Review not found');
        }

        if (reviewUser.user_id !== userID) {
            throw new Error('Unauthorised request');
        }

        // Update review
        const { error: updateError } = await supabase
            .from('filmReviews')
            .update({
                rating: newRating,
                review: newReviewText
            })
            .eq('review_id', reviewID);

        if (updateError) {
            throw new Error('Failed to update review');
        }

        return { message: 'Review updated successfully'};
    } catch (error) {
        throw new Error(error.message || 'Review update unsuccessful')
    }
}

/**
 * Function to delete a review by its review ID.
 * Only the user that created the review can delete it.
 */
async function deleteReview(reviewID, userID) {
    try {
        // Check review belongs to the user
        const { data: reviewUser, error: fetchError } = await supabase
            .from('filmReviews')
            .select('user_id')
            .eq('review_id', reviewID)
            .single();

        if (fetchError || !reviewUser ) {
            throw new Error('Review not found');
        }

        if (reviewUser.user_id !== userID) {
            throw new Error('Unauthorised request');
        }

        // Delete review
        const { error: deleteError } = await supabase
            .from('filmReviews')
            .delete()
            .eq('review_id', reviewID);

        if (deleteError) {
            throw new Error('Failed to delete review');
        }

        return { message: 'Review deleted successfully' };
    } catch (error) {
        throw new Error(error.message || 'Review deletion unsuccessful')
    }
}

export {
    addReview,
    getReviewsByFilm,
    getReviewsByUser,
    getFilteredReviews,
    updateReview,
    deleteReview
};
