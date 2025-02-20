// public/js/yelp-api.js
import { YELP_API_KEY, YELP_API_BASE_URL } from './api-config.js';

export async function searchRestaurants(location, term = 'restaurants') {
    const params = new URLSearchParams({
        location,
        term,
        sort_by: 'rating' // Sort by rating for better results
    });

    const response = await fetch(`${YELP_API_BASE_URL}/businesses/search?${params}`, {
        headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data.businesses;
}

export async function getRestaurantDetails(restaurantId) {
    const response = await fetch(`${YELP_API_BASE_URL}/businesses/${restaurantId}`, {
        headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export function getRestaurantImageUrl(imageUrl) {
    return imageUrl || './assets/placeholder-restaurant.png'; // Placeholder if no image
}