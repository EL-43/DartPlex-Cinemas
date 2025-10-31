function titleToId(title){
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // semua abjad
    .replace(/\s+/g, '-') // spasi jadi (-)
    .replace(/-+/g, '-') // lebih dari 1 (-)
    .replace(/^-+|-+$/g, ''); // awalan (-)
}

document.addEventListener('DOMContentLoaded', async () => {
  const movieListContainer = document.getElementById('movie-list');
  const loadingMessage = document.getElementById('loading-message');
  const errorMessage = document.getElementById('error-message');
  const movieForm = document.getElementById('movie-form');
  const movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
  const movieModalLabel = document.getElementById('movieModalLabel');

  let films = [];

  // Auth Handling
  const authButtons = document.querySelector(".auth-buttons");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const savedUsername = localStorage.getItem("savedUsername") || localStorage.getItem("currentUsername") || "User";
  // Role
  const currentRole = localStorage.getItem("currentRole") || "guest";
  console.log("DEBUG >> currentRole:", currentRole);

  if (isLoggedIn && authButtons) {
    authButtons.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-user dropdown-toggle fw-bold" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fas fa-user me-1"></i> ${savedUsername}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="#" id="signOutBtn"><i class="fas fa-right-from-bracket me-2"></i>Sign out</a></li>
        </ul>
      </div>
    `;

    document.querySelector('#signOutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = '/index';
    });
  }

  // Render Movies
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

      const adminControls = currentRole === "admin" ? `
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-warning edit-btn" data-id="${film.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${film.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      ` : "";

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
              <h6 class="card-title fw-bold" style="color: whitesmoke;">${film.title}</h6>
              <p class="small" style="color: whitesmoke;">${film.description || '-'}</p>
              <div class="d-flex justify-content-center gap-2 mb-2">
                <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">${film.genre || film.format}</span>
                <span class="badge ${ratingClass}" style="${ratingStyle}">${film.rating}</span>
                <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">${film.duration || '-'}</span>
              </div>
              ${adminControls}
            </div>
          </div>
        </div>
      `;
    }).join('');

    movieListContainer.innerHTML = movieCards;

    if (currentRole === "admin") {
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editMovie(btn.dataset.id));
      });
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteMovie(btn.dataset.id));
      });
    }
  }

  // Load Movies (pakai localStorage dulu)
  async function loadMovies() {
    loadingMessage.classList.remove('d-none');
    errorMessage.classList.add('d-none');

    try {
      const response = await fetch('/api/films');
      if(!response.ok){
        throw new Error(`HTTP Error: ${response.status}`);
      }
      films = await response.json();
      renderMovies();
    } catch (error) {
      console.error('Error API:', error);
      errorMessage.classList.remove('d-none');
    } finally {
      loadingMessage.classList.add('d-none');
    }
  }

  // cek dulu -- ntar aku remove
  function saveMovies() {
    localStorage.setItem('films', JSON.stringify(films));
    renderMovies();
  }

  // Form Handler
  movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('movie-id').value.trim();
    const title = document.getElementById('title').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const rating = document.getElementById('rating').value;
    const poster = document.getElementById('poster').value.trim();
    const description = document.getElementById('description').value.trim();
    const duration = document.getElementById('duration')?.value.trim() || "120m";
    const format = document.getElementById('format')?.value.trim() || "2D";
    const trailer = document.getElementById('trailer')?.value.trim() || "#";

    if(!title || !poster || !description){
      alert('Semua Bagian Wajib di Isi!');
      return;
    }

    let finalId = id;
    if(!finalId){
      finalId = titleToId(title);
      let counter = 1;

      let uniqueId = finalId;
      while(films.some(f => f.id === uniqueId)){
        uniqueId = `${finalId}-${counter}`;
        counter++;
      }
      finalId = uniqueId;
    }

    const formData = new URLSearchParams();
    formData.append('id', finalId);
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('rating', rating);
    formData.append('poster', poster);
    formData.append('description', description);
    formData.append('duration', duration);
    formData.append('format', format);
    formData.append('trailer', trailer);

    try{
      const response = await fetch('/api/films', {
        method : 'POST',
        headers : {'content-type' : 'application/x-www-form-urlencoded'},
        body : formData
      });

      const result = await response.json();

      if(result.success){
        alert('Film berhasil disimpan!');
        movieModal.hide();
        movieForm.reset();
        document.getElementById('movie-id').value = '';
        movieModalLabel.textContent = 'Tambah Film';
        loadMovies(); // reload
      } else{
        alert('Terjadi Kesalahan,' + result.message);
      }
    } catch(err){
      console.error('Error: ', err);
      alert('Terjadi Kesalahan saat Menyimpan!')
    }
  });

  function editMovie(id) {
    const movie = films.find(f => f.id == id);
    if (!movie) return;

    document.getElementById('movie-id').value = movie.id;
    document.getElementById('title').value = movie.title;
    document.getElementById('genre').value = movie.genre || '';
    document.getElementById('rating').value = movie.rating || 'SU';
    document.getElementById('poster').value = movie.poster;
    document.getElementById('description').value = movie.description || '';
    document.getElementById('duration').value = movie.duration || '120m';
    document.getElementById('format').value = movie.format || '2D';
    document.getElementById('trailer').value = movie.trailer || '#';

    movieModalLabel.textContent = 'Edit Film';
    movieModal.show();
  }

  function deleteMovie(id) {
  if (!id) return;

  if (confirm(`Yakin ingin menghapus film ini?\nID: ${id}`)) {
    fetch(`/api/films/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert('Film berhasil dihapus!');
        loadMovies(); // refresh daftar
      } else {
        alert('Error: ' + result.message);
      }
    })
    .catch(err => {
      console.error('Error: ', err);
      alert('Terjadi kesalahan saat menghapus film!');
    });
  }
}

  // Button Tambah Film
  const addMovieBtn = document.getElementById('add-movie-btn');
  if (currentRole !== "admin" && addMovieBtn) {
    addMovieBtn.style.display = "none";
  }

  addMovieBtn?.addEventListener('click', () => {
    movieForm.reset();
    document.getElementById('movie-id').value = '';
    movieModalLabel.textContent = 'Tambah Film';
  });

  // Redirect Login/Signup
  const loginLink = document.querySelector(".auth-buttons a[href='/login']");
  const signupLink = document.querySelector(".auth-buttons a[href='/signup']");

  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    });
  }

  if (signupLink) {
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = `/signup?redirect=${encodeURIComponent(window.location.pathname)}`;
    });
  }
  loadMovies();
});
