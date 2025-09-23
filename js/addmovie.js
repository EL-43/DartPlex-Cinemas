document.addEventListener('DOMContentLoaded', async () => {
  const movieListContainer = document.getElementById('movie-list');
  const loadingMessage = document.getElementById('loading-message');
  const errorMessage = document.getElementById('error-message');
  const movieForm = document.getElementById('movie-form');
  const movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
  const movieModalLabel = document.getElementById('movieModalLabel');

  let films = [];

  function renderMovies() {
    if (!Array.isArray(films) || films.length === 0) {
      movieListContainer.innerHTML = '<p class="text-center">Belum ada film.</p>';
      return;
    }

    const movieCards = films.map(film => {
      let ratingClass = '';
      let ratingStyle = '';

      if (film.rating === 'R13+') {
        ratingClass = 'bg-warning text-dark';
      } else if (film.rating === 'D17+') {
        ratingClass = 'bg-danger text-light';
      } else {
        ratingStyle = 'background-color: rgb(40, 167, 69); color: rgba(255, 255, 255, 1);';
      }

      return `
        <div class="col" style="max-width: 300px;">
          <div class="card h-100 position-relative movielist-card">
            <div class="card-img-wrapper position-relative">
              <img src="${film.poster}" class="card-img-top" alt="Poster ${film.title}">
              <div class="card-overlay d-flex flex-column justify-content-center align-items-center">
                <a href="${film.trailer || '#'}" class="btn btn-trailer rounded-pill mb-2 px-4" target="_blank" rel="noopener noreferrer">Lihat trailer</a>
              </div>
            </div>
            <div class="card-body text-center">
              <h6 class="card-title">${film.title}</h6>
              <p class="text-muted small">${film.description || '-'}</p>
              <div class="d-flex justify-content-center gap-2 mb-2">
                <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">${film.genre || film.format}</span>
                <span class="badge ${ratingClass}" style="${ratingStyle}">${film.rating}</span>
                <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">${film.duration || '-'}</span>
              </div>
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-warning edit-btn" data-id="${film.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${film.id}"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    movieListContainer.innerHTML = movieCards;

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editMovie(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteMovie(btn.dataset.id));
    });
  }

  async function loadMovies() {
    loadingMessage.classList.remove('d-none');
    errorMessage.classList.add('d-none');

    try {
      const response = await fetch('/films.json');
      if (!response.ok) throw new Error(`Error Status: ${response.status}`);
      films = await response.json();
      renderMovies();
      
    } catch (error) {
      console.error('Error loading films:', error);
      errorMessage.classList.remove('d-none');
    } finally {
      loadingMessage.classList.add('d-none');
    }
  }

  function saveMovies() {
    localStorage.setItem('films', JSON.stringify(films));
    renderMovies();
  }

  movieForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('movie-id').value;
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const rating = document.getElementById('rating').value;
    const poster = document.getElementById('poster').value;
    const description = document.getElementById('description').value;

    if (id) {
      const index = films.findIndex(f => f.id == id);
      if (index > -1) {
        films[index] = { 
          ...films[index], 
          title, 
          genre, 
          rating, 
          poster, 
          description 
        };
      }
    } else {
      const newMovie = {
        id: Date.now(),
        title,
        genre,
        rating,
        poster,
        description,
        duration: "120m",
        format: "2D",
        trailer: "#"
      };
      films.push(newMovie);
    }

    saveMovies();
    movieModal.hide();
    movieForm.reset();
    document.getElementById('movie-id').value = '';
    movieModalLabel.textContent = 'Tambah Film';
  });

  function editMovie(id) {
    const movie = films.find(f => f.id == id);
    if (!movie) return;

    document.getElementById('movie-id').value = movie.id;
    document.getElementById('title').value = movie.title;
    document.getElementById('genre').value = movie.genre || '';
    document.getElementById('rating').value = movie.rating;
    document.getElementById('poster').value = movie.poster;
    document.getElementById('description').value = movie.description || '';

    movieModalLabel.textContent = 'Edit Film';
    movieModal.show();
  }

  function deleteMovie(id) {
    if (confirm('Yakin mau hapus film ini?')) {
      films = films.filter(f => f.id != id);
      saveMovies();
    }
  }

  document.getElementById('add-movie-btn').addEventListener('click', () => {
    movieForm.reset();
    document.getElementById('movie-id').value = '';
    movieModalLabel.textContent = 'Tambah Film';
  });

  loadMovies();
});