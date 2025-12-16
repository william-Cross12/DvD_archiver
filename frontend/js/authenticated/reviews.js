


async function getFilm() {
    const parsedUrl = new URL(window.location.href);
    const filmId = parsedUrl.searchParams.get('id');
    const filmDetailsDiv = document.getElementById('film-details');
    const filmHeader = document.getElementById('film-header');
    const reviewContainer = document.getElementById('reviews');
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user.id;


    //Get Reviews Data
    const reviewsDiv = document.getElementById('reviews');
    const reviewsResponse = await fetch(`http://localhost:3000/api/review/reviews/user/${userId}`);
    const reviewsData = await reviewsResponse.json();

    const reviews = reviewsData.reviews;
    let reviewed;
    
    
    if (reviewsDiv) {
        if (!reviews) {
            reviewsDiv.innerHTML = `<H1>No reviews yet. Be the first to review!</h1>`;
        } else {
            reviewed = user ? reviews.some(r => r.user_id === user.id) : false;
            for (const review of reviews) {
                const reviewDiv = document.createElement('div');
                reviewDiv.classList.add('review');
                reviewDiv.id = `review_id_${review.review_id}`;
                reviewDiv.innerHTML = `
                    <div class="review-text" ">
                        <h1 style="display:none" id="review_${review.review_id}_header"></h1>
                        <p><strong>Rating:</strong> ${review.rating} / 10</p>
                        <p>${review.review}</p>
                        <p> Posted on ${new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                `;
                reviewsDiv.appendChild(reviewDiv);
            }
        }
        
        if (reviewed) {
            for ( const review of reviews) {
                const reviewDiv = document.getElementById(`review_id_${review.review_id}`);
                reviewDiv.style.backgroundColor = "green"; // Light green background for user's own review

                const filmResponse = await fetch(`http://localhost:3000/api/film/film?id=${review.film_id}`)
                const filmData = await filmResponse.json();
                const filmTitle = filmData.film.Title;
                const filmId = filmData.film.film_id;
                const reviewId = review.review_id;


                const reviewHeader = document.getElementById(`review_${review.review_id}_header`);
                reviewHeader.style.display = "";
                reviewHeader.textContent = `${filmTitle} Review`;

                const updateReviewButton = document.createElement('button');
                updateReviewButton.id = "update-review";
                updateReviewButton.href = "#";
                updateReviewButton.textContent = "Update Review";

                const removeReviewButton = document.createElement('button');
                removeReviewButton.id = "remove-review";
                removeReviewButton.href = "#";
                removeReviewButton.textContent = "Delete Review";

                removeReviewButton.addEventListener('click', async () => {
                    const confirmDelete = confirm(`Are you sure you want to delete your review for ${filmTitle}?`);
                    if (confirmDelete) {
                        const deleteResponse = await fetch(`http://localhost:3000/api/review/delete-review/${reviewId}`, {                
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                            },
                        });
                        if (deleteResponse.status === 200) {
                            reviewDiv.innerHTML += `<p style="font-weight:bold;color:red;">Your review has been deleted, redirecting...</p>`;
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            alert(`Failed to delete review. Please try again.
                                Status code: ${deleteResponse.status}
                                Message: ${await deleteResponse.text()}`);
                        }
                    }
                });

                updateReviewButton.addEventListener('click', () => {
                    handleAddRating(filmId, filmTitle);
                });

                reviewDiv.appendChild(updateReviewButton);
                reviewDiv.appendChild(removeReviewButton);
            }
        }
    }
}

function handleAddRating(filmId, filmTitle) {
    window.location.href = `/frontend/authenticated/review.html?id=${filmId}&filmTitle=${encodeURIComponent(filmTitle)}`;
}





document.addEventListener('DOMContentLoaded', getFilm);
