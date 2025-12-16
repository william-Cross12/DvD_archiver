async function search() {
    const results = document.getElementById('results');

    for (let rating = 10; rating >= 1; rating--) {
        const response = await fetch(`http://localhost:3000/api/review/reviews/filter/?rating=${rating}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (data.error) {
            continue;
        }

        const ratingHeader = document.createElement('h2');
        ratingHeader.textContent = `Rating: ${rating}`;
        results.appendChild(ratingHeader);

        let totalBoxOffice = 0;
        let filmCount = 0;
        const filmsWithBoxOffice = [];

        for (let film of data.reviews) {
            const filmResponse = await fetch(`http://localhost:3000/api/film/film?id=${film.film_id}`)
            const filmData = await filmResponse.json();
            film = filmData.film;
            const boxOfficeStr = film.BoxOffice ? film.BoxOffice.replace(/[\$,]/g, '') : '0';
            const boxOffice = parseInt(boxOfficeStr) || 0;

            if (boxOffice > 0) {
                totalBoxOffice += boxOffice;
                filmCount++;
                filmsWithBoxOffice.push(film);
            }
        }

        const averageBoxOffice = filmCount > 0 ? (parseInt(totalBoxOffice / filmCount)) : 0;

        const analyticsDiv = document.createElement('div');
        analyticsDiv.classList.add('review');
        analyticsDiv.innerHTML = `
            <p><strong>Number of Films with this Rating:</strong> ${filmCount}</p>
            <p><strong>Average Box Office:</strong> $${averageBoxOffice.toLocaleString()}</p>
            <p><strong>Total Box Office:</strong> $${totalBoxOffice.toLocaleString()}</p>
            <hr>
        `;
        results.appendChild(analyticsDiv);
    }
};


async function checkImage(url) {
    try { 
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', search);
