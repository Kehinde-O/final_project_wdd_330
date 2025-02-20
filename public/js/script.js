// public/js/script.js
import * as tmdbApi from './tmdb-api.js';
import * as yelpApi from './yelp-api.js';
import * as uiUtils from './ui-utils.js';
import { createPlanItem, formatDate, getCommonSnacks, getCommonDrinks } from './plan-utils.js';

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



        if (planSummaryContainer) {
            updatePlanPreview(planSummaryContainer);
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
// function createMovieCarouselItem(movie) {
//     const item = document.createElement('div');
//     item.classList.add('carousel-item');

//     const img = document.createElement('img');
//     img.src = tmdbApi.getMovieImageUrl(movie.poster_path);
//     img.alt = movie.title;

//     const details = document.createElement('div');
//     details.classList.add('carousel-item-details');

//     const title = document.createElement('h3');
//     title.classList.add('carousel-item-title');
//     title.textContent = movie.title;

//     const info = document.createElement('p');
//     info.classList.add('carousel-item-info');
//     info.textContent = `Rating: ${movie.vote_average}`; // Example info

//     details.appendChild(title);
//     details.appendChild(info);
//     item.appendChild(img);
//     item.appendChild(details);

//     item.addEventListener('click', () => {
//         window.location.href = `movie-detail.html?id=${movie.id}`;
//     });

//     return item;
// }

function createMovieCarouselItem(movie) {
    // Validate movie object
    if (!movie) {
        console.error('Invalid movie object:', movie);
        return null;
    }

    const item = document.createElement('div');
    item.classList.add('carousel-item');

    const img = document.createElement('img');
    // Use optional chaining and nullish coalescing for safer property access
    img.src = tmdbApi.getMovieImageUrl(movie?.poster_path);
    img.alt = movie?.title || 'Movie poster';
    img.onerror = function () {
        this.src = './assets/movie-placeholder.png';
    };

    const details = document.createElement('div');
    details.classList.add('carousel-item-details');

    const title = document.createElement('h3');
    title.classList.add('carousel-item-title');
    title.textContent = movie?.title || 'Unknown Title';

    const info = document.createElement('p');
    info.classList.add('carousel-item-info');
    info.textContent = `Rating: ${movie?.vote_average?.toFixed(1) || 'N/A'}`; // Safely handle rating

    details.appendChild(title);
    details.appendChild(info);
    item.appendChild(img);
    item.appendChild(details);

    if (movie?.id) {
        item.addEventListener('click', () => {
            window.location.href = `movie-detail.html?id=${movie.id}`;
        });
    }

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


// // --- Local Storage Plan Functions (unchanged from previous, assuming they work correctly) ---
// function addToPlan(type, item) {
//     if (type === 'movie') {
//         localStorage.setItem(MOVIE_PLAN_KEY, JSON.stringify(item));
//     } else if (type === 'restaurant') {
//         localStorage.setItem(RESTAURANT_PLAN_KEY, JSON.stringify(item));
//     }
//     updatePlanSummaryDisplay(document.getElementById('plan-summary')); // Update homepage summary if visible
// }

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

// function updatePlanSummaryDisplay(container) {
//     if (!container) return; // Exit if container not found (e.g., not on homepage)
//     const plan = getPlan();
//     uiUtils.displayPlanSummary(plan, container); // Reusing from ui-utils
// }

function updatePlanSummaryDisplay(container) {
    if (!container) return;

    const plan = getPlan();
    if (!plan?.movie?.item) {
        container.innerHTML = '<p>No movie night planned yet. Start by selecting a movie!</p>';
        return;
    }

    try {
        const movie = plan.movie.item;

        container.innerHTML = `
            <div class="plan-summary-card">
                <div class="plan-header">
                    <h3>Your Next Movie Night</h3>
                    ${plan.movie.date ? `<p class="plan-date">${formatDate(plan.movie.date)}</p>` : ''}
                </div>
                
                <div class="plan-content">
                    <div class="plan-movie">
                        <img src="${tmdbApi.getMovieImageUrl(movie?.poster_path)}" 
                             alt="${movie?.title || 'Movie poster'}" 
                             class="plan-movie-thumbnail"
                             onerror="this.src='./assets/movie-placeholder.png'">
                        <div class="plan-movie-info">
                            <h4>${movie?.title || 'Unknown Title'}</h4>
                            <p class="movie-rating">Rating: ${movie?.vote_average?.toFixed(1) || 'N/A'}/10</p>
                        </div>
                    </div>
                    
                    <div class="plan-details">
                        <p><strong>People attending:</strong> ${plan.movie?.numberOfPeople || 1}</p>
                        
                        ${plan.movie?.snacks?.length ? `
                            <div class="plan-snacks">
                                <strong>Snacks:</strong>
                                <div class="chips-row">
                                    ${plan.movie.snacks.map(snack => `
                                        <span class="chip">${snack}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${plan.movie?.drinks?.length ? `
                            <div class="plan-drinks">
                                <strong>Drinks:</strong>
                                <div class="chips-row">
                                    ${plan.movie.drinks.map(drink => `
                                        <span class="chip">${drink}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="plan-actions">
                    <button onclick="clearPlan()" class="secondary-button">Clear Plan</button>
                    <a href="plan.html" class="primary-button">View Full Plan</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error displaying plan:', error);
        container.innerHTML = `
            <div class="plan-error">
                <p>Sorry, there was an error displaying your plan. Please try clearing and creating a new plan.</p>
                <button onclick="clearPlan()" class="secondary-button">Clear Plan</button>
            </div>
        `;
    }
}

// Example of using the utilities in the movie details page
function displayMovieDetailsPageOld(movie, container) {
    if (!container || !movie) return;

    const commonSnacks = getCommonSnacks();
    const commonDrinks = getCommonDrinks();

    container.innerHTML = `
        <div class="detail-page-layout">
            <div class="detail-image-container">
                <img src="${tmdbApi.getMovieImageUrl(movie.poster_path)}" 
                     alt="${movie.title}" 
                     class="detail-image"
                     onerror="this.src='./assets/movie-placeholder.png'">
            </div>
            <div class="detail-info">
                <h2>${movie.title}</h2>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
                
                <div class="plan-form">
                    <h3>Add to Movie Night Plan</h3>
                    <form id="movie-plan-form" class="plan-details-form">
                        <div class="form-group">
                            <label for="plan-date">Date and Time:</label>
                            <input type="datetime-local" 
                                   id="plan-date" 
                                   required
                                   min="${new Date().toISOString().slice(0, 16)}">
                        </div>
                        
                        <div class="form-group">
                            <label for="number-of-people">Number of People:</label>
                            <input type="number" 
                                   id="number-of-people" 
                                   min="1" 
                                   value="1" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label>Snacks:</label>
                            <div class="chips-container" id="snacks-container">
                                ${commonSnacks.map(snack => `
                                    <label class="chip">
                                        <input type="checkbox" name="snacks" value="${snack}">
                                        <span>${snack}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Drinks:</label>
                            <div class="chips-container" id="drinks-container">
                                ${commonDrinks.map(drink => `
                                    <label class="chip">
                                        <input type="checkbox" name="drinks" value="${drink}">
                                        <span>${drink}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <button type="submit" class="primary-button">Add to Plan</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Handle form submission
    document.getElementById('movie-plan-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather form data
        const planDetails = {
            date: document.getElementById('plan-date').value,
            numberOfPeople: parseInt(document.getElementById('number-of-people').value),
            snacks: Array.from(document.querySelectorAll('input[name="snacks"]:checked'))
                        .map(input => input.value),
            drinks: Array.from(document.querySelectorAll('input[name="drinks"]:checked'))
                        .map(input => input.value)
        };
        
        // Add to plan using the utilities
        addToPlan('movie', movie, planDetails);
        
        // Show success message and redirect
        alert(`${movie.title} added to your plan!`);
        window.location.href = 'index.html';
    });
}


function addToPlan(type, item, details = {}) {
    try {
        const planItem = createPlanItem(type, item, {
            date: details.date,
            numberOfPeople: details.numberOfPeople,
            snacks: details.snacks || [],
            drinks: details.drinks || []
        });

        if (type === 'movie') {
            localStorage.setItem(MOVIE_PLAN_KEY, JSON.stringify(planItem));
        } else if (type === 'restaurant') {
            localStorage.setItem(RESTAURANT_PLAN_KEY, JSON.stringify(planItem));
        }

        const planSummary = document.getElementById('plan-summary');
        if (planSummary) {
            updatePlanPreview(planSummary);
        }
    } catch (error) {
        console.error('Error adding to plan:', error);
        alert('There was an error adding the item to your plan. Please try again.');
    }
}

function updatePlanPreview(container) {
    if (!container) return;

    try {
        const moviePlan = JSON.parse(localStorage.getItem(MOVIE_PLAN_KEY));
        
        if (!moviePlan || !moviePlan.item) {
            container.innerHTML = `
                <div class="plan-preview-empty">
                    <p>No movie night planned yet!</p>
                    <a href="search-results.html?type=movie" class="primary-button">Find a Movie</a>
                </div>
            `;
            return;
        }

        const movie = moviePlan.item;

        container.innerHTML = `
            <div class="plan-preview-card">
                <div class="plan-preview-content">
                    <div class="plan-preview-image">
                        <img src="${tmdbApi.getMovieImageUrl(movie.poster_path)}"
                             alt="${movie.title}"
                             onerror="this.src='./assets/movie-placeholder.png'"
                             class="movie-thumbnail">
                    </div>
                    <div class="plan-preview-details">
                        <h3 class="movie-title">${movie.title}</h3>
                        ${moviePlan.date ? `
                            <p class="plan-date">
                                <svg class="icon" viewBox="0 0 24 24">
                                    <path d="M19,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H5A2,2,0,0,0,3,6V20a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V6A2,2,0,0,0,19,4Z"/>
                                </svg>
                                ${formatDate(moviePlan.date)}
                            </p>
                        ` : ''}
                        <p class="attendees">
                            <svg class="icon" viewBox="0 0 24 24">
                                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Z"/>
                            </svg>
                            ${moviePlan.numberOfPeople || 1} ${moviePlan.numberOfPeople === 1 ? 'person' : 'people'} attending
                        </p>
                    </div>
                </div>
                <div class="plan-preview-actions">
                    <a href="plan.html" class="view-plan-button">View Full Plan</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error displaying plan preview:', error);
        container.innerHTML = `
            <div class="plan-preview-error">
                <p>Unable to load movie plan</p>
            </div>
        `;
    }
}

function setupMovieDetailsPage(movie, container) {
    if (!container || !movie) return;

    const commonSnacks = getCommonSnacks();
    const commonDrinks = getCommonDrinks();

    container.innerHTML = `
        <div class="detail-page-layout">
            <div class="detail-image-container">
                <img src="${tmdbApi.getMovieImageUrl(movie.poster_path)}" 
                     alt="${movie.title}" 
                     class="detail-image"
                     onerror="this.src='./assets/movie-placeholder.png'">
            </div>
            <div class="detail-info">
                <h2>${movie.title}</h2>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
                
                <div class="plan-form">
                    <h3>Add to Movie Night Plan</h3>
                    <form id="movie-plan-form" class="plan-details-form">
                        <div class="form-group">
                            <label for="plan-date">Date and Time:</label>
                            <input type="datetime-local" 
                                   id="plan-date" 
                                   required
                                   min="${new Date().toISOString().slice(0, 16)}">
                        </div>
                        
                        <div class="form-group">
                            <label for="number-of-people">Number of People:</label>
                            <input type="number" 
                                   id="number-of-people" 
                                   min="1" 
                                   value="1" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label>Snacks:</label>
                            <div class="chips-container" id="snacks-container">
                                ${commonSnacks.map(snack => `
                                    <label class="chip">
                                        <input type="checkbox" name="snacks" value="${snack}">
                                        <span>${snack}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Drinks:</label>
                            <div class="chips-container" id="drinks-container">
                                ${commonDrinks.map(drink => `
                                    <label class="chip">
                                        <input type="checkbox" name="drinks" value="${drink}">
                                        <span>${drink}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <button type="submit" class="primary-button">Add to Plan</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Handle form submission
    document.getElementById('movie-plan-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const planDetails = {
            date: document.getElementById('plan-date').value,
            numberOfPeople: parseInt(document.getElementById('number-of-people').value),
            snacks: Array.from(document.querySelectorAll('input[name="snacks"]:checked'))
                        .map(input => input.value),
            drinks: Array.from(document.querySelectorAll('input[name="drinks"]:checked'))
                        .map(input => input.value)
        };
        
        addToPlan('movie', movie, planDetails);
        alert(`${movie.title} added to your plan!`);
        window.location.href = 'index.html';
    });
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Homepage initialization
    if (document.body.id === 'homepage') {
        const planSummary = document.getElementById('plan-summary');
        if (planSummary) {
            updatePlanPreview(planSummary);
        }
    }

    // Movie detail page initialization
    if (document.body.id === 'movie-detail-page') {
        const movieDetailContent = document.getElementById('movie-detail-content');
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (movieId && movieDetailContent) {
            tmdbApi.getMovieDetails(movieId).then(movieDetails => {
                if (movieDetails) {
                    setupMovieDetailsPage(movieDetails, movieDetailContent);
                }
            });
        }
    }
});

// Export necessary functions
export {
    addToPlan,
    updatePlanPreview
};


// --- Exported functions from ui-utils (keep if still needed) ---
import { getMovieImageUrl, getRestaurantImageUrl } from './ui-utils.js';
export { getMovieImageUrl, getRestaurantImageUrl };