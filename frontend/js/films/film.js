


async function getFilm() {
    const parsedUrl = new URL(window.location.href);
    const filmId = parsedUrl.searchParams.get('id');
    const filmDetailsDiv = document.getElementById('film-details');
    const filmHeader = document.getElementById('film-header');
    const reviewContainer = document.getElementById('reviews');
    const user = JSON.parse(sessionStorage.getItem('user'));

    const response = await fetch(`http://localhost:3000/api/film/film?id=${filmId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();

    //Get Film Data
    const film = data.film;
    const year = film.Year || (film.Released ? film.Released.split('-')[0] : 'N/A');
    filmHeader.textContent = `${film.Title} (${year})`;
    filmDetailsDiv.innerHTML = `
        
        <div class="film-left" id="film-left">
            <img src="${film.Poster}" alt="Poster for ${film.Title}"><br>
        </div>
        <div class="film-right" id="film-right">
            <p><strong>Genre:</strong> ${film.Genre || "N/A"}</p>
            <p class="plot"><strong>Plot:</strong> ${film.Plot  || "N/A"}</p>
            <p><strong>Actors:</strong> ${film.Actors  || "N/A"}</p>
            <p><strong>Director:</strong> ${film.Director  || "N/A"}</p>
            <p><strong>Runtime:</strong> ${film.Runtime  || "N/A"}</p>
            <p><strong>Awards:</strong> ${film.Awards  || "N/A"}</p>
            <p><strong>Box Office:</strong> ${film.BoxOffice || 'N/A'}</p>
            <p><strong> IMDB Rating:</strong> ${film.imdbRating  || "N/A"}
            <strong> | Metascore:</strong> ${film.Metascore  || "N/A"}
            <strong> | Rotten Tomatoes:</strong> ${film.RottenTomatoes || "N/A"}</p>
            <p><strong>Released:</strong> ${film.Released}</p>

        </div>
    `
    //Youtube 
    const trailerDiv = document.getElementById('trailer');
    const youtubeResponse = await fetch(`http://localhost:3000/api/trailer/${encodeURIComponent(film.Title)}`);
    const youtubeData = await youtubeResponse.json();
    if (!youtubeData.error) {
        const trailerId = youtubeData.trailer.title
        const trailerURL = youtubeData.trailer.url.replace("watch?v=", "embed/");
        const trailerThumb = youtubeData.trailer.thumbnail
        if (trailerId && trailerURL) {
            trailerDiv.innerHTML = `
                <iframe src="${trailerURL}">
                    <img src="${trailerThumb}" alt="Trailer for ${film.Title}">
                </iframe>
            `;
        }
    }

    //Get Reviews Data
    const reviewsDiv = document.getElementById('reviews');
    const reviewsResponse = await 
        fetch(`http://localhost:3000/api/review/reviews/film/${filmId}`);
    const reviewsData = await reviewsResponse.json();
    const reviews = reviewsData.reviews;
    let reviewed;
    
    
    if (reviewsDiv) {
        if (!reviews) {
            reviewsDiv.innerHTML = `<H1>No reviews yet. Be the first to review!</h1>`;
        } else {
            reviewed = user ? reviews.some(r => r.user_id === user.id) : false;
            reviewsDiv.innerHTML = `<header class="default-header-1">Reviews</header>`;
            for (const review of reviews) {
                const reviewDiv = document.createElement('div');
                reviewDiv.classList.add('review');
                reviewDiv.id = `review_id_${review.review_id}`;
                reviewDiv.innerHTML = `
                    <div class="review-text" ">
                        <p><strong>Rating:</strong> ${review.rating} / 10</p>
                        <p>${review.review}</p>
                        <p> Posted on ${new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                `;
                reviewsDiv.appendChild(reviewDiv);
            }
        }

        if (!reviewed) {
            const addReviewLink = document.createElement('a');
            addReviewLink.id = "add-review";
            addReviewLink.href = "#";
            addReviewLink.style.display = "block";
            addReviewLink.innerHTML = `
                    <div class="review">                
                        <div class="review-text">
                            <p style="text-align:center;font-size:32px"><strong>
                            Add Review
                            </strong></p>
                        </div>
                    </div>
            `
            addReviewLink.addEventListener('click', () => {
                handleAddRating(filmId);
            });

            reviewsDiv.appendChild(addReviewLink);
        }
        
        if (reviewed) {
            const reviewDiv = document.getElementById(`review_id_${reviews.find(r => r.user_id === user.id).review_id}`);
            reviewDiv.style.backgroundColor = "green"; // Light green background for user's own review
            reviewDiv.innerHTML += `<p style="font-weight:bold;">(Your Review)</p>`; // Indicate it's the user's review

            const updateReviewButton = document.createElement('button');
            updateReviewButton.id = "update-review";
            updateReviewButton.href = "#";
            updateReviewButton.textContent = "Update Review";

            const removeReviewButton = document.createElement('button');
            removeReviewButton.id = "remove-review";
            removeReviewButton.href = "#";
            removeReviewButton.textContent = "Delete Review";



            removeReviewButton.addEventListener('click', async () => {
                const confirmDelete = confirm("Are you sure you want to delete your review?");
                if (confirmDelete) {
                    const deleteResponse = await fetch(`http://localhost:3000/api/review/delete-review/${reviews.find(r => r.user_id === user.id).review_id}`, {                
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                        },
                    });
                    if (deleteResponse.status === 200) {
                        reviewDiv.innerHTML += `<p style="font-weight:bold;color:red;">Your review has been deleted, redirecting...</p>`;
                        setTimeout(() => {
                            window.location.href = `/frontend/films/film.html?id=${encodeURIComponent(filmId)}`;
                        }, 1000);
                    } else {
                        alert(`Failed to delete review. Please try again.
                            Status code: ${deleteResponse.status}
                            Message: ${await deleteResponse.text()}`);
                    }
                }
            });

            updateReviewButton.addEventListener('click', () => {
                handleAddRating(filmId);
            });

            reviewDiv.appendChild(updateReviewButton);
            reviewDiv.appendChild(removeReviewButton);
        }
    }
}

function handleAddRating(filmId) {
    window.location.href = `/frontend/authenticated/review.html?id=${filmId}&filmTitle=${encodeURIComponent(document.getElementById('film-header').textContent)}`;
}





document.addEventListener('DOMContentLoaded', getFilm);
