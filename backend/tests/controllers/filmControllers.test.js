import { afterEach, expect, jest } from '@jest/globals';

// Set environment variables
process.env.OMDB_URL = 'https://www.omdbapi.com/';
process.env.OMDB_API_KEY = 'fake-key';

// Create an axios mock
jest.unstable_mockModule('axios', () => ({
    default: {
        get: jest.fn()
    }
}));

const axios = await import('axios');
const { searchFilms } = await import('../../src/controllers/filmControllers.js');

describe('searchfilms filmController tests', () => {
    const OMDB_SUCCESS_RES = {
        Response: 'True',
        Search: [{
            Title: 'Kingsman',
            Year: '2015',
            imdbID: 'tt2802144'
        }],
        totalResults: '1'
    };

    const OMDB_FAIL_RES = {
        Response: 'False',
        Error: 'Film not found'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('successfully searches and returns film data', async () => {
        axios.default.get.mockResolvedValueOnce({
            data: OMDB_SUCCESS_RES
        });

        const result = await searchFilms('Kingsman');

        // Check the mocked axios get was called correctly,
        // and returned a successful response
        expect(axios.default.get).toHaveBeenCalledWith(
            process.env.OMDB_URL,
            {
                params: {
                    apikey: process.env.OMDB_API_KEY,
                    type: 'movie',
                    s: 'Kingsman',
                    page: 1
                }
            }
        );

        expect(result).toEqual(OMDB_SUCCESS_RES);
    });

    it('throws error if OMDb sends a false response', async () => {
        axios.default.get.mockResolvedValueOnce({
            data: OMDB_FAIL_RES
        });

        // Check searchFilms failed as expected
        await expect(searchFilms('Unknown'))
            .rejects
            .toThrow('Failed to get search results');
    });

    it('throws error if axios fails', async () => {
        axios.default.get.mockResolvedValueOnce(
            new Error('Network error')
        );

        // Check searchFilms failed as expected
        await expect(searchFilms('Kingsman'))
            .rejects
            .toThrow('Failed to get search results');
    });
})
