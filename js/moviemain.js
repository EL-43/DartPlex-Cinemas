document.addEventListener('DOMContentLoaded', async () => {
  const movieListContainer = document.getElementById('movie-list');
  const loadingMessage = document.getElementById('loading-message');
  const errorMessage = document.getElementById('error-message');

  // Loading
  loadingMessage.classList.remove('d-none');
  movieListContainer.innerHTML = '';
  errorMessage.classList.add('d-none');

  try {
    const response = await fetch('/films.json');
    if (!response.ok) throw new Error(`Error Status: ${response.status}`);

    const films = await response.json();

    if (!Array.isArray(films) || films.length === 0) {
      throw new Error('Data film kosong!');
    }

  // Buat kartu film untuk setiap film
  const movieCards = films.map(film => {
    // Tentukan kelas / style badge rating sesuai kondisi
    let ratingClass = '';
    let ratingStyle = '';

    if (film.rating === 'R13+') {
      ratingClass = 'bg-warning text-dark';
    } else if (film.rating === 'D17+') {
      ratingClass = 'bg-danger text-light';
    } else {
      // custom bg-light pakai rgb
      ratingStyle = 'background-color: rgb(40, 167, 69); color: rgba(255, 255, 255, 1);';
    }

    return `
      <div class="col" style="max-width: 300px;">
        <div class="card h-100 position-relative movielist-card">
          <div class="card-img-wrapper position-relative">
            <img src="${film.poster}" class="card-img-top" alt="Poster ${film.title}">
            <div class="card-overlay d-flex flex-column justify-content-center align-items-center">
              <a href="${film.trailer}" class="btn btn-trailer rounded-pill mb-2 px-4" target="_blank" rel="noopener noreferrer">Lihat trailer</a>
              <a href="/movie?film=${film.id}" class="btn btn-tiket rounded-pill mb-2 px-4" rel="noopener noreferrer">Beli tiket</a>
            </div>
          </div>
          <div class="card-body text-center">
            <h6 class="card-title">${film.title}</h6>
            <div class="d-flex justify-content-center gap-2">
              <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">${film.format}</span>
              <span class="badge ${ratingClass}" style="${ratingStyle}">${film.rating}</span>
              <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">${film.duration}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

    // Masuk ke container
    movieListContainer.innerHTML = movieCards;

  } catch (error) {
    console.error('Error loading films:', error);
    loadingMessage.classList.add('d-none');
    errorMessage.classList.remove('d-none');
  } finally {
    loadingMessage.classList.add('d-none');
  }
});