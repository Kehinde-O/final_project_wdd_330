// public/js/tmdb-api.js
import { TMDB_API_KEY } from './api-config.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function getTrendingMovies() {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.results;
}

export async function searchMovies(query) {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results;
}

export async function getMovieDetails(movieId) {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data;
}

export async function getMovieRecommendations() {
    // For simplicity, let's just get popular movies as recommendations
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.results;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // You can adjust image size as needed

// export function getMovieImageUrl(posterPath) {
//     if (!posterPath) return './assets/placeholder-image.png'; // Placeholder if no poster
//     return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
// }

export function getMovieImageUrl(posterPath) {
    // If posterPath is undefined or null, return a default image
    if (!posterPath) {
        return './assets/movie-placeholder.png'; // Make sure this placeholder image exists in your assets folder
    }
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}