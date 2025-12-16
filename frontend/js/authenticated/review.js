async function preReview() {
    const reviewContainer = document.getElementById('review-container');
    const urlParams = new URLSearchParams(window.location.search);
    const filmID = urlParams.get('id');
    const filmTitle = urlParams.get('filmTitle');
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userID = user.id;
    let userReview = null;
    try {    
        const reviewsResponse = await fetch(`http://localhost:3000/api/review/reviews/film/${filmID}`)
        if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            userReview = reviewsData.reviews ? reviewsData.reviews.find(r => r.user_id === userID) : null;
        } else {
            userReview = null;
        }

    } catch (error) {
        console.error("Error fetching reviews:", error);
        userReview = null;
    }

    if (userReview) {
        reviewContainer.innerHTML = `
            <header class="default-header-1" id="film-header">${decodeURIComponent(filmTitle)}</header>
            <form id="review-form" class="review-form">
                <label for="rating">Rating (1-10) : </label>
                <input type="number" id="rating" name="rating" min="1" max="10" value="${userReview.rating}" required><br><br>
                <label for="review" class="review-box-title">Review </label><br>
                <textarea id="review" name="review" rows="8" cols="50" required>${userReview.review}</textarea><br><br>
                <button type="submit" class="nav-button"> Update Review </button>
            </form>
        `;
    } else {
        if (reviewContainer && filmID && user) {
            reviewContainer.innerHTML = `
                <header class="default-header-1" id="film-header">${decodeURIComponent(filmTitle)}</header>
                <form id="review-form" class="review-form">
                    <label for="rating">Rating (1-10) : </label>
                    <input type="number" id="rating" name="rating" min="1" max="10" required><br><br>
                    <label for="review" class="review-box-title">Review </label><br>
                    <textarea id="review" name="review" rows="5" cols="50" required></textarea><br><br>
                    <button type="submit" class="nav-button"> Submit Review </button>
                </form>
            `;
        }
    }
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (event) => postReview(event));
    }
    

}

async function postReview(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const userID = JSON.parse(sessionStorage.getItem('user')).id;
    const filmID = urlParams.get('id'); 
    const reviewForm = event.target;
    const rating = reviewForm.rating.value;
    const reviewText = reviewForm.review.value;
    const submitButton = reviewForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    let url = "http://localhost:3000/api/review/add-review";
    const reviewsResponse = await fetch(`http://localhost:3000/api/review/reviews/film/${filmID}`)
    const reviewsData = await reviewsResponse.json();
    let method = "POST";

    const userReview = reviewsData.reviews ? reviewsData.reviews.find(r => r.user_id === userID) : null;

    if (userReview) {
        url = `http://localhost:3000/api/review/update-review/${userReview.review_id}`;
        method = "PUT";
    }

    if (document.referrer.includes('reviews.html')) {
        url = `http://localhost:3000/api/review/update-review/${userReview.review_id}`;
        method = "PUT";
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({filmID, userID, rating, reviewText}), 
    });
    
    const filmHeader = document.getElementById('film-header');
    if (response.status === 200) {
        filmHeader.textContent = 'Review submitted successfully! Redirecting...';
        setTimeout(() => {
            if (document.referrer.includes('reviews.html')) {
                window.location.href = document.referrer;
                return;
            } else {
            window.location.href = '/frontend/films/film.html?id=' + encodeURIComponent(filmID);
            }
        }, 1000); 
    } else {
        filmHeader.textContent = 'Error submitting review. Please try again.';
    }


}


document.addEventListener('DOMContentLoaded', preReview);