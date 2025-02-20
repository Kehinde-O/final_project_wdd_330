// public/js/ui-utils.js

export function clearElementChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

export function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');

    const img = document.createElement('img');
    img.src = getMovieImageUrl(movie.poster_path);
    img.alt = movie.title;
    img.classList.add('card-image');

    const body = document.createElement('div');
    body.classList.add('card-body');

    const title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = movie.title;

    body.appendChild(title);
    card.appendChild(img);
    card.appendChild(body);

    card.addEventListener('click', () => {
        window.location.href = `movie-detail.html?id=${movie.id}`;
    });

    return card;
}


export function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.classList.add('restaurant-card');

    const img = document.createElement('img');
    img.src = getRestaurantImageUrl(restaurant.image_url);
    img.alt = restaurant.name;
    img.classList.add('card-image');

    const body = document.createElement('div');
    body.classList.add('card-body');

    const title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = restaurant.name;

    const rating = document.createElement('p');
    rating.classList.add('card-text');
    rating.textContent = `Rating: ${restaurant.rating}`;

    body.appendChild(title);
    body.appendChild(rating);
    card.appendChild(img);
    card.appendChild(body);

    card.addEventListener('click', () => {
        window.location.href = `restaurant-detail.html?id=${restaurant.id}`;
    });

    return card;
}


export function displayMovieDetails(movie, container) {
    clearElementChildren(container);

    const detailHTML = `
        <section class="detail-section">
            <h2>${movie.title}</h2>
            <img src="${getMovieImageUrl(movie.poster_path)}" alt="${movie.title}" class="detail-image">
            <div class="detail-info">
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
            </div>
            <div class="detail-actions">
                <button id="add-movie-to-plan">Add to Plan</button>
                <a href="index.html" class="back-button">Back to Home</a>
            </div>
        </section>
    `;
    container.innerHTML = detailHTML;

    document.getElementById('add-movie-to-plan').addEventListener('click', () => {
        addToPlan('movie', movie); // Function to add to local storage plan
        alert(`${movie.title} added to your plan!`);
    });
}


export function displayRestaurantDetails(restaurant, container) {
    clearElementChildren(container);

    const detailHTML = `
        <section class="detail-section">
            <h2>${restaurant.name}</h2>
            <img src="${getRestaurantImageUrl(restaurant.image_url)}" alt="${restaurant.name}" class="detail-image">
            <div class="detail-info">
                <p><strong>Rating:</strong> ${restaurant.rating} / 5</p>
                <p><strong>Price:</strong> ${restaurant.price || 'Not available'}</p>
                <p><strong>Categories:</strong> ${restaurant.categories.map(cat => cat.title).join(', ')}</p>
                <p><strong>Address:</strong> ${restaurant.location.display_address.join(', ')}</p>
                <p><strong>Phone:</strong> ${restaurant.display_phone}</p>
                <p><a href="${restaurant.url}" target="_blank">View on Yelp</a></p>
            </div>
            <div class="detail-actions">
                <button id="add-restaurant-to-plan">Add to Plan</button>
                <a href="index.html" class="back-button">Back to Home</a>
            </div>
        </section>
    `;
    container.innerHTML = detailHTML;

    document.getElementById('add-restaurant-to-plan').addEventListener('click', () => {
        addToPlan('restaurant', restaurant); // Function to add to local storage plan
        alert(`${restaurant.name} added to your plan!`);
    });
}

export function displayPlanSummary(plan, container) {
    clearElementChildren(container);
    if (!plan.movie && !plan.restaurant) {
        container.innerHTML = '<p>Select a movie and restaurant to start planning your night!</p>';
        return;
    }

    let summaryHTML = '';
    if (plan.movie) {
        summaryHTML += `<div class="plan-item"><h3>Movie: ${plan.movie.title}</h3><p>Rating: ${plan.movie.vote_average}</p></div>`;
    }
    if (plan.restaurant) {
        summaryHTML += `<div class="plan-item"><h3>Restaurant: ${plan.restaurant.name}</h3><p>Rating: ${plan.restaurant.rating}</p></div>`;
    }
    container.innerHTML = summaryHTML;
}

export function displayPlanDetails(plan, container) {
    if (!container) return;

    try {
        if (!plan?.movie?.item) {
            container.innerHTML = `
                <div class="empty-plan">
                    <h3>No Movie Night Plan Yet</h3>
                    <p>Start planning your movie night by finding a movie you'd like to watch!</p>
                    <a href="search-results.html?type=movie" class="primary-button">Find a Movie</a>
                </div>
            `;
            return;
        }

        const movie = plan.movie.item;
        const planDate = plan.movie.date ? new Date(plan.movie.date) : null;

        container.innerHTML = `
            <div class="plan-details-card">
                <div class="plan-section movie-section">
                    <div class="movie-info">
                        <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : './assets/movie-placeholder.png'}"
                             alt="${movie.title}"
                             class="movie-poster"
                             onerror="this.src='./assets/movie-placeholder.png'">
                        <div class="movie-details">
                            <h3>${movie.title}</h3>
                            <p class="movie-rating">Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                            <p class="movie-overview">${movie.overview || 'No overview available'}</p>
                            ${movie.release_date ? `<p class="movie-release">Release Date: ${new Date(movie.release_date).toLocaleDateString()}</p>` : ''}
                        </div>
                    </div>
                </div>

                <div class="plan-section event-details">
                    <h3>Event Details</h3>
                    ${planDate ? `
                        <p class="event-date">
                            <span class="icon">📅</span> 
                            ${planDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <p class="event-time">
                            <span class="icon">⏰</span> 
                            ${planDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    ` : '<p>No date set</p>'}
                    
                    <p class="attendees">
                        <span class="icon">👥</span> 
                        ${plan.movie.numberOfPeople || 1} ${plan.movie.numberOfPeople === 1 ? 'person' : 'people'} attending
                    </p>

                    ${plan.movie.snacks?.length ? `
                        <div class="snacks-section">
                            <h4>Snacks</h4>
                            <div class="chips-container">
                                ${plan.movie.snacks.map(snack => `
                                    <span class="chip">${snack}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${plan.movie.drinks?.length ? `
                        <div class="drinks-section">
                            <h4>Drinks</h4>
                            <div class="chips-container">
                                ${plan.movie.drinks.map(drink => `
                                    <span class="chip">${drink}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="plan-actions">
                    <button onclick="window.location.href='search-results.html?type=movie'" class="secondary-button">Find Another Movie</button>
                    <button onclick="clearPlan()" class="danger-button">Cancel Plan</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error displaying plan details:', error);
        container.innerHTML = `
            <div class="error-message">
                <h3>Oops! Something went wrong</h3>
                <p>There was an error displaying your plan. Please try creating a new plan.</p>
                <button onclick="clearPlan()" class="secondary-button">Clear Plan</button>
                <a href="search-results.html?type=movie" class="primary-button">Find a Movie</a>
            </div>
        `;
    }
}

// Placeholder functions - Implement local storage logic in script.js
export function addToPlan(type, item) {
    console.log(`Adding ${type} to plan:`, item);
    // Logic will be in script.js for local storage
}

export function getPlan() {
    return { movie: null, restaurant: null }; // Placeholder
}

export function clearPlanDisplay() {
    // Placeholder if needed for clearing plan display
}

export function createPlanItem(type, item, details = {}) {
    return {
        type,
        item,
        date: details.date || null,
        numberOfPeople: details.numberOfPeople || 1,
        snacks: details.snacks || [],
        drinks: details.drinks || [],
        createdAt: new Date().toISOString()
    };
}

export function formatDate(dateString) {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getCommonSnacks() {
    return [
        'Popcorn',
        'Nachos',
        'Chips',
        'Candy',
        'Chocolate',
        'Pretzels'
    ];
}

export function getCommonDrinks() {
    return [
        'Soda',
        'Water',
        'Juice',
        'Tea',
        'Coffee',
        'Beer',
        'Wine'
    ];
}

// Export image URL functions to be used in card creation
import { getMovieImageUrl } from './tmdb-api.js';
import { getRestaurantImageUrl } from './yelp-api.js';
export { getMovieImageUrl, getRestaurantImageUrl };