import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Youtube API url and key
const YT_API_URL = process.env.YOUTUBE_API_URL;
const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Function to retrieve a film trailer from the YouTube API.
 * It relies on the first seach result for `[film name] official trailer` being the correct trailer.
 */
async function getTrailer(title) {
    try {
        const params = {
            key: API_KEY,
            q: `${title} official trailer`,
            part: 'snippet',
            type: 'video',
            maxResults: 1
        };

        const response = await axios.get(
            YT_API_URL,
            { params }
        );

        if (response.data.items.length === 0) {
            throw new Error('Film trailer not found');
        }

        const video = response.data.items[0];
        const videoId = video.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        return {
            title: video.snippet.title,
            url: videoUrl,
            thumbnail: video.snippet.thumbnails.high.url
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch film trailer');
    }
}

export { getTrailer };
