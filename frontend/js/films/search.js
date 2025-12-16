async function search(event) {
    event.preventDefault();
    const searchForm = event.target;
    const query = searchForm.query.value;
    const submitButton = searchForm.querySelector('button[type="submit"]');
    const results = document.getElementById('results');
    results.innerHTML = ''; //used to clear previous results
    
    const response = await fetch(`http://localhost:3000/api/film/search/?search=${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    for (const film of data.searchResults.Search) {
        const poster = await checkImage(film.Poster) ? film.Poster : '/frontend/media/images/logo.png';
        const filmDiv = document.createElement('div');
        filmDiv.classList.add('film-result');
        filmDiv.innerHTML = `
            <h3>${film.Title} (${film.Year})</h3>
            <a href="/frontend/films/film.html?id=${encodeURIComponent(film.imdbID)}">
            <img src="${poster}" alt="Poster for ${film.Title}"></a><br>
            <hr>
        `;
        results.appendChild(filmDiv);
    }
};

function preSearch() {
    const searchForm = document.getElementById('search-form');

    if (searchForm) {
        searchForm.addEventListener('submit', (event) => search(event));
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

document.addEventListener('DOMContentLoaded', preSearch);
