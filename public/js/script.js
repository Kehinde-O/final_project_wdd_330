// public/js/script.js
import * as tmdbApi from './tmdb-api.js';
import * as yelpApi from './yelp-api.js';
import * as uiUtils from './ui-utils.js';

// Local Storage Keys
const MOVIE_PLAN_KEY = 'moviePlan_movie';
const RESTAURANT_PLAN_KEY = 'moviePlan_restaurant';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Homepage (index.html) ---
    if (document.body.id === 'homepage') {
        const trendingMovieCarousel = document.getElementById('trending-movie-carousel');
        const popularRestaurantCarousel = document.getElementById('popular-restaurant-carousel');
        const planSummaryContainer = document.getElementById('plan-summary');
        const combinedSearchInput = document.getElementById('movie-search'); // Using movie-search input for combined search


        // Add these lines to properly connect the hero buttons
        const exploreMoviesBtn = document.querySelector('.hero-button.primary');
        const findRestaurantsBtn = document.querySelector('.hero-button.secondary');

        // Event listener for Explore Movies button
        if (exploreMoviesBtn) {
            exploreMoviesBtn.addEventListener('click', () => {
                window.location.href = 'search-results.html?type=movie&trending=true';
            });
        }

        // Event listener for Find Restaurants button
        if (findRestaurantsBtn) {
            findRestaurantsBtn.addEventListener('click', () => {
                window.location.href = 'search-results.html?type=restaurant&popular=true';
            });
        }

        // Enhanced search functionality
        if (combinedSearchInput) {
            // Add input event listener to show/hide search button based on input
            const searchButton = document.getElementById('combined-search-button');
            searchButton.style.display = 'inline-block'; // Make the search button visible

            combinedSearchInput.addEventListener('input', (event) => {
                const query = event.target.value.trim();
                searchButton.style.opacity = query ? '1' : '0.5';
            });

            // Search on Enter key
            combinedSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const query = combinedSearchInput.value.trim();
                    if (query) {
                        performCombinedSearch(query);
                    } else {
                        alert('Please enter a movie or restaurant name to search.');
                    }
                }
            });

            // Search button click event
            searchButton.addEventListener('click', () => {
                const query = combinedSearchInput.value.trim();
                if (query) {
                    performCombinedSearch(query);
                } else {
                    alert('Please enter a movie or restaurant name to search.');
                }
            });
        }


        // Load trending movies on homepage carousel
        if (trendingMovieCarousel) {
            const trendingMovies = await tmdbApi.getTrendingMovies();
            trendingMovies.forEach(movie => {
                trendingMovieCarousel.appendChild(createMovieCarouselItem(movie)); // Use carousel item creator
            });
        }

        // Load popular restaurants on homepage carousel
        if (popularRestaurantCarousel) {
            const popularRestaurants = await yelpApi.searchRestaurants('New York City', 'restaurants'); // Default location
            popularRestaurants.forEach(restaurant => {
                popularRestaurantCarousel.appendChild(createRestaurantCarouselItem(restaurant)); // Use carousel item creator
            });
        }

        // Display plan summary on homepage
        if (planSummaryContainer) {
            updatePlanSummaryDisplay(planSummaryContainer);
        }

        // Combined Search Event Listener for Homepage Search Bar
        if (combinedSearchInput) {
            combinedSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') { // Trigger search on Enter key
                    const query = combinedSearchInput.value.trim();
                    if (query) {
                        performCombinedSearch(query);
                    } else {
                        alert('Please enter a movie or restaurant name to search.');
                    }
                }
            });
        }

        // Hero Buttons Event Listeners (Example - adjust URLs as needed)
        const heroExploreMoviesButton = document.querySelector('#hero-section .hero-button.primary');
        const heroFindRestaurantsButton = document.querySelector('#hero-section .hero-button.secondary');

        if (heroExploreMoviesButton) {
            heroExploreMoviesButton.addEventListener('click', () => {
                window.location.href = 'search-results.html?type=movie&trending=true'; // Example - link to trending movies
            });
        }

        if (heroFindRestaurantsButton) {
            heroFindRestaurantsButton.addEventListener('click', () => {
                window.location.href = 'search-results.html?type=restaurant&popular=true'; // Example - link to popular restaurants
            });
        }

    }


    // --- Search Results Page (search-results.html) ---
    if (document.body.id === 'search-results-page') {
        const searchResultsCarousel = document.getElementById('search-results-carousel');
        const searchButton = document.getElementById('search-button');
        const searchQueryInput = document.getElementById('search-query-input');
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const query = urlParams.get('query');

        // Initialize search input with current query if exists
        if (query && searchQueryInput) {
            searchQueryInput.value = query;
        }

        // Initial search or load trending
        async function initializeSearchResults() {
            if (!searchResultsCarousel) return;

            if (type === 'movie') {
                if (query) {
                    // If there's a search query, perform the search
                    await performMovieSearch(query, searchResultsCarousel);
                } else {
                    // If no query but type is movie, show trending movies
                    await loadTrendingMoviesForCarousel(searchResultsCarousel);
                }
            } else if (type === 'restaurant') {
                if (query) {
                    await performRestaurantSearch(query, searchResultsCarousel);
                } else {
                    await loadPopularRestaurantsForCarousel(searchResultsCarousel);
                }
            }
        }

        // Initialize the page
        initializeSearchResults();

        // Search Button Event Listener
        if (searchButton && searchQueryInput) {
            searchButton.addEventListener('click', async () => {
                const query = searchQueryInput.value.trim();
                if (query) {
                    if (type === 'movie') {
                        await performMovieSearch(query, searchResultsCarousel);
                    } else if (type === 'restaurant') {
                        await performRestaurantSearch(query, searchResultsCarousel);
                    }
                } else {
                    alert('Please enter a search query.');
                }
            });
        }

        // Search Input Enter Key Listener
        if (searchQueryInput) {
            searchQueryInput.addEventListener('keydown', async (event) => {
                if (event.key === 'Enter') {
                    const query = searchQueryInput.value.trim();
                    if (query) {
                        if (type === 'movie') {
                            await performMovieSearch(query, searchResultsCarousel);
                        } else if (type === 'restaurant') {
                            await performRestaurantSearch(query, searchResultsCarousel);
                        }
                    } else {
                        alert('Please enter a search query.');
                    }
                }
            });
        }
    }


    // --- Movie Detail Page (movie-detail.html) ---
    if (document.body.id === 'movie-detail-page') {
        const movieDetailContent = document.getElementById('movie-detail-content');
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (movieId) {
            const movieDetails = await tmdbApi.getMovieDetails(movieId);
            if (movieDetails && movieDetailContent) {
                displayMovieDetailsPage(movieDetails, movieDetailContent); // Use new detail page display function
            }
        }
    }


    // --- Restaurant Detail Page (restaurant-detail.html) ---
    if (document.body.id === 'restaurant-detail-page') {
        const restaurantDetailContent = document.getElementById('restaurant-detail-content');
        const urlParams = new URLSearchParams(window.location.search);
        const restaurantId = urlParams.get('id');

        if (restaurantId) {
            const restaurantDetails = await yelpApi.getRestaurantDetails(restaurantId);
            if (restaurantDetails && restaurantDetailContent) {
                displayRestaurantDetailsPage(restaurantDetails, restaurantDetailContent); // Use new detail page display function
            }
        }
    }

    // --- Plan Page (plan.html) ---
    if (document.body.id === 'plan-page') {
        const planContent = document.getElementById('plan-content');
        const planData = getPlan();
        displayPlanDetails(planData, planContent);
    }


});


// --- Helper Functions for Creating Carousel Items ---
function createMovieCarouselItem(movie) {
    const item = document.createElement('div');
    item.classList.add('carousel-item');

    const img = document.createElement('img');
    img.src = tmdbApi.getMovieImageUrl(movie.poster_path);
    img.alt = movie.title;

    const details = document.createElement('div');
    details.classList.add('carousel-item-details');

    const title = document.createElement('h3');
    title.classList.add('carousel-item-title');
    title.textContent = movie.title;

    const info = document.createElement('p');
    info.classList.add('carousel-item-info');
    info.textContent = `Rating: ${movie.vote_average}`; // Example info

    details.appendChild(title);
    details.appendChild(info);
    item.appendChild(img);
    item.appendChild(details);

    item.addEventListener('click', () => {
        window.location.href = `movie-detail.html?id=${movie.id}`;
    });

    return item;
}


function createRestaurantCarouselItem(restaurant) {
    const item = document.createElement('div');
    item.classList.add('carousel-item');

    const img = document.createElement('img');
    img.src = yelpApi.getRestaurantImageUrl(restaurant.image_url);
    img.alt = restaurant.name;

    const details = document.createElement('div');
    details.classList.add('carousel-item-details');

    const title = document.createElement('h3');
    title.classList.add('carousel-item-title');
    title.textContent = restaurant.name;

    const info = document.createElement('p');
    info.classList.add('carousel-item-info');
    info.textContent = `${restaurant.rating} Stars`; // Example info

    details.appendChild(title);
    details.appendChild(info);
    item.appendChild(img);
    item.appendChild(details);

    item.addEventListener('click', () => {
        window.location.href = `restaurant-detail.html?id=${restaurant.id}`;
    });

    return item;
}


// --- Search Functions ---
async function performMovieSearch(query, carouselContainer) {
    uiUtils.clearElementChildren(carouselContainer); // Clear previous results
    const movies = await tmdbApi.searchMovies(query);
    if (movies && movies.length > 0) {
        movies.forEach(movie => {
            carouselContainer.appendChild(createMovieCarouselItem(movie));
        });
    } else {
        carouselContainer.innerHTML = '<p>No movies found matching your search.</p>';
    }
}

async function performRestaurantSearch(query, carouselContainer) {
    uiUtils.clearElementChildren(carouselContainer);
    const restaurants = await yelpApi.searchRestaurants(query); // Using query as location for simplicity
    if (restaurants && restaurants.length > 0) {
        restaurants.forEach(restaurant => {
            carouselContainer.appendChild(createRestaurantCarouselItem(restaurant));
        });
    } else {
        carouselContainer.innerHTML = '<p>No restaurants found matching your search.</p>';
    }
}

function performCombinedSearch(query) {
    localStorage.setItem('combinedSearchQuery', query); // Store for results page if needed
    window.location.href = `search-results.html?query=${encodeURIComponent(query)}`; // Redirect to search results, can refine later
}

async function loadTrendingMoviesForCarousel(carouselContainer) {
    uiUtils.clearElementChildren(carouselContainer);
    const trendingMovies = await tmdbApi.getTrendingMovies();
    trendingMovies.forEach(movie => {
        carouselContainer.appendChild(createMovieCarouselItem(movie));
    });
}

async function loadPopularRestaurantsForCarousel(carouselContainer) {
    uiUtils.clearElementChildren(carouselContainer);
    const popularRestaurants = await yelpApi.searchRestaurants('New York City', 'restaurants'); // Default location
    popularRestaurants.forEach(restaurant => {
        carouselContainer.appendChild(createRestaurantCarouselItem(restaurant));
    });
}


// --- Detail Page Display Functions ---
function displayMovieDetailsPage(movie, container) {
    uiUtils.clearElementChildren(container);

    const detailHTML = `
        <div class="detail-image-container">
            <img src="${tmdbApi.getMovieImageUrl(movie.poster_path)}" alt="${movie.title}" class="detail-image">
        </div>
        <div class="detail-info">
            <h2>${movie.title}</h2>
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Rating:</strong> ${movie.vote_average}</p>
            <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
            <div class="detail-actions">
                <button id="add-movie-to-plan" class="primary">Add to Plan</button>
            </div>
        </div>
    `;
    container.innerHTML = detailHTML;

    document.getElementById('add-movie-to-plan').addEventListener('click', () => {
        addToPlan('movie', movie); // Function to add to local storage plan
        alert(`${movie.title} added to your plan!`);
    });
}


function displayRestaurantDetailsPage(restaurant, container) {
    uiUtils.clearElementChildren(container);

    const detailHTML = `
        <div class="detail-image-container">
            <img src="${yelpApi.getRestaurantImageUrl(restaurant.image_url)}" alt="${restaurant.name}" class="detail-image">
        </div>
        <div class="detail-info">
            <h2>${restaurant.name}</h2>
            <p><strong>Rating:</strong> ${restaurant.rating} / 5</p>
            <p><strong>Price:</strong> ${restaurant.price || 'Not available'}</p>
            <p><strong>Categories:</strong> ${restaurant.categories.map(cat => cat.title).join(', ')}</p>
            <p><strong>Address:</strong> ${restaurant.location.display_address.join(', ')}</p>
            <p><strong>Phone:</strong> ${restaurant.display_phone}</p>
            <p><a href="${restaurant.url}" target="_blank">View on Yelp</a></p>
            <div class="detail-actions">
                <button id="add-restaurant-to-plan" class="primary">Add to Plan</button>
            </div>
        </div>
    `;
    container.innerHTML = detailHTML;

    document.getElementById('add-restaurant-to-plan').addEventListener('click', () => {
        addToPlan('restaurant', restaurant); // Function to add to local storage plan
        alert(`${restaurant.name} added to your plan!`);
    });
}


// --- Plan Display Functions (unchanged from previous, assuming they work correctly) ---
function displayPlanSummary(plan, container) {
    uiUtils.displayPlanSummary(plan, container); // Reusing from ui-utils
}

function displayPlanDetails(plan, container) {
    uiUtils.displayPlanDetails(plan, container); // Reusing from ui-utils
}


// --- Local Storage Plan Functions (unchanged from previous, assuming they work correctly) ---
function addToPlan(type, item) {
    if (type === 'movie') {
        localStorage.setItem(MOVIE_PLAN_KEY, JSON.stringify(item));
    } else if (type === 'restaurant') {
        localStorage.setItem(RESTAURANT_PLAN_KEY, JSON.stringify(item));
    }
    updatePlanSummaryDisplay(document.getElementById('plan-summary')); // Update homepage summary if visible
}

function getPlan() {
    const movie = JSON.parse(localStorage.getItem(MOVIE_PLAN_KEY));
    const restaurant = JSON.parse(localStorage.getItem(RESTAURANT_PLAN_KEY));
    return { movie: movie, restaurant: restaurant };
}

function clearPlan() {
    localStorage.removeItem(MOVIE_PLAN_KEY);
    localStorage.removeItem(RESTAURANT_PLAN_KEY);
    updatePlanSummaryDisplay(document.getElementById('plan-summary')); // Update homepage summary
}

function updatePlanSummaryDisplay(container) {
    if (!container) return; // Exit if container not found (e.g., not on homepage)
    const plan = getPlan();
    uiUtils.displayPlanSummary(plan, container); // Reusing from ui-utils
}


// --- Exported functions from ui-utils (keep if still needed) ---
import { getMovieImageUrl, getRestaurantImageUrl } from './ui-utils.js';
export { getMovieImageUrl, getRestaurantImageUrl };