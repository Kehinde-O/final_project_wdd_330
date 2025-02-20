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
    clearElementChildren(container);
    if (!plan.movie && !plan.restaurant) {
        container.innerHTML = '<p>Your plan is empty. Go back to home and add movie and restaurant!</p>';
        return;
    }

    let planHTML = '';
    if (plan.movie) {
        planHTML += `
            <section class="plan-item">
                <h3>Movie: ${plan.movie.title}</h3>
                <img src="${getMovieImageUrl(plan.movie.poster_path)}" alt="${plan.movie.title}" class="detail-image">
                <div class="detail-info">
                    <p><strong>Overview:</strong> ${plan.movie.overview}</p>
                    <p><strong>Rating:</strong> ${plan.movie.vote_average}</p>
                    <p><strong>Genres:</strong> ${plan.movie.genres.map(genre => genre.name).join(', ')}</p>
                </div>
            </section>
        `;
    }
    if (plan.restaurant) {
        planHTML += `
            <section class="plan-item">
                <h3>Restaurant: ${plan.restaurant.name}</h3>
                <img src="${getRestaurantImageUrl(plan.restaurant.image_url)}" alt="${plan.restaurant.name}" class="detail-image">
                <div class="detail-info">
                    <p><strong>Rating:</strong> ${plan.restaurant.rating} / 5</p>
                    <p><strong>Price:</strong> ${plan.restaurant.price || 'Not available'}</p>
                    <p><strong>Categories:</strong> ${plan.restaurant.categories.map(cat => cat.title).join(', ')}</p>
                    <p><strong>Address:</strong> ${plan.restaurant.location.display_address.join(', ')}</p>
                    <p><strong>Phone:</strong> ${plan.restaurant.display_phone}</p>
                    <p><a href="${plan.restaurant.url}" target="_blank">View on Yelp</a></p>
                </div>
            </section>
        `;
    }

    planHTML += `
        <div class="detail-actions">
            <button id="share-plan-button">Share Plan</button>
        </div>
    `;

    container.innerHTML = planHTML;

    document.getElementById('share-plan-button').addEventListener('click', () => {
        const planData = getPlan();
        const planString = `Movie Night Plan:\nMovie: ${planData.movie?.title || 'Not Selected'}\nRestaurant: ${planData.restaurant?.name || 'Not Selected'}`;
        navigator.clipboard.writeText(planString).then(() => {
            alert('Plan copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy plan: ', err);
            alert('Failed to copy plan to clipboard.');
        });
    });
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

// Export image URL functions to be used in card creation
import { getMovieImageUrl } from './tmdb-api.js';
import { getRestaurantImageUrl } from './yelp-api.js';
export { getMovieImageUrl, getRestaurantImageUrl };