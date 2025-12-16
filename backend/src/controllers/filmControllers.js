import axios from 'axios';
import dotenv from 'dotenv';
import { supabase } from "../supabase.js";

dotenv.config();

// OMDb API url and key
const OMDB_URL = process.env.OMDB_URL;
const API_KEY = process.env.OMDB_API_KEY;

/**
 * Film retrieve function.
 * First checks if it is already stored in the database.
 * If not, it queries OMDb for it.
 * Queries by either title or id, alongside the optional release year
 */
async function retrieveFilm(title, id, year) {
    try {
        const params = {
            apikey: API_KEY,
            type: "movie"
        };

        // If id was passed, check if it already exists in the supabase db
        // Else, use title as the retrieval parameter instead of id
        if (id) {
            const { data: filmDetails, error: supabaseError } = await supabase
                .from('filmDetails')
                .select('*')
                .eq('film_id', id)
                .single();

            // If film details successfully retreived, then return
            // Else, search OMDb instead
            if (filmDetails) {
                return filmDetails;
            } else {
                params.i = id;
            }
        } else {
            params.t = title;
        }

        // Include release year in params if it was provided
        if (year) {
            params.y = year;
        }

        const response = await axios.get(
            OMDB_URL,
            { params }
        );

        if (response.data.Response === 'False') {
            throw new Error(response.data.Error);
        }

        return response.data;
    } catch (error) {
        throw new Error("Failed to get film details");
    }
}

/**
 * Film search function.
 * Search for multiple films from the OMDb database
 * Queries by a search term, meant to be the film's title
 */
async function searchFilms(search, page = 1) {
    try {
        const params = {
            apikey: API_KEY,
            type: "movie",
            s: search,
            page: page
        };

        const response = await axios.get(
            OMDB_URL,
            { params }
        );

        if (response.data.Response === 'False') {
            throw new Error(response.data.Error);
        }

        return response.data;
    } catch (error) {
        throw new Error("Failed to get search results");
    }
}

export { retrieveFilm, searchFilms };
