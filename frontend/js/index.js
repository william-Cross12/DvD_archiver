async function loadPopularFilms() {
        const response = await fetch(`http://localhost:3000/api/review/reviews/filter/?rating=10}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        const uniqueIds = [...new Set(data.reviews.map(review => review.film_id))];
        const reviews = uniqueIds.slice(0, 5).map(filmId => 
            data.reviews.find(review => review.film_id === filmId)
        );

        const popularDiv = document.getElementById('popular-films');

        for (let film of reviews) {
            const filmResponse = await fetch(`http://localhost:3000/api/film/film?id=${film.film_id}`)
            const filmData = await filmResponse.json();
            film = filmData.film;
            const poster = await checkImage(film.Poster) ? film.Poster : '/frontend/media/images/logo.png';
            const year = film.Year || (film.Released ? film.Released.split('-')[0] : 'N/A');
            const filmDiv = document.createElement('div');
            filmDiv.classList.add('film-result');
            filmDiv.innerHTML += `
                <h2>${film.Title} </h2>
                <h2>(${year})</h2>
                <a href="/frontend/films/film.html?id=${encodeURIComponent(film.film_id)}">
                <img src="${poster}" alt="Poster for ${film.Title}"></a>
            `;
            popularDiv.appendChild(filmDiv);
        }


    }

async function checkImage(url) {
    try { 
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
}



document.addEventListener('DOMContentLoaded', loadPopularFilms);