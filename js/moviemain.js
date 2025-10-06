document.addEventListener('DOMContentLoaded', async () => {
  const movieListContainer = document.getElementById('movie-list');
  const loadingMessage = document.getElementById('loading-message');
  const errorMessage = document.getElementById('error-message');
  const authButtons = document.querySelector('.auth-buttons');

  // Custom popup modal elements
  const loginChoiceModalElement = document.getElementById('loginChoiceModal');
  let loginChoiceModal;
  if (loginChoiceModalElement) {
    loginChoiceModal = new bootstrap.Modal(loginChoiceModalElement);
  }
  const loginRedirectBtn = document.getElementById('loginRedirectBtn');
  const signupRedirectBtn = document.getElementById('signupRedirectBtn');
  let redirectUrl = null;

  // auth handling
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const savedUsername = localStorage.getItem("savedUsername") || localStorage.getItem("currentUsername") || "User";

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
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedEmail");
      window.location.reload();
    });
  } else if (authButtons) {
    const currentPath = window.location.pathname;
    authButtons.innerHTML = `
      <a href="/login?redirect=${currentPath}" class="loginbutton fw-bold">Login</a>
      <a href="/signup?redirect=${currentPath}" class="signupbutton fw-bold rounded-pill px-3">Make an account</a>
    `;
  }

  // loading films
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

    // Modal Trailer (Pastikan ini ada di HTML atau tambahkan secara dinamis)
    // Jika tidak ada di HTML, kode ini akan menambahkannya
    if (!document.getElementById("trailerModal")) {
      const trailerModalHTML = `
        <div class="modal fade" id="trailerModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content bg-dark">
              <div class="modal-body p-0">
                <div class="ratio ratio-16x9">
                  <iframe id="trailerFrame" src="" title="YouTube trailer" allowfullscreen allow="autoplay"></iframe>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", trailerModalHTML);
    }

    const trailerModal = new bootstrap.Modal(document.getElementById("trailerModal"));
    const trailerFrame = document.getElementById("trailerFrame");

    // Reset iframe saat modal ditutup
    document.getElementById("trailerModal").addEventListener("hidden.bs.modal", () => {
      trailerFrame.src = "";
    });

    // Buat card film
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
                <a
                    class="btn btn-trailer rounded-pill mb-2 px-4"
                    data-trailer="${film.trailer}">
                    Lihat trailer
                </a>
                <a
                    class="btn btn-tiket rounded-pill mb-2 px-4"
                    data-film-id="${film.id}"
                    data-film-title="${film.title}">
                    Beli tiket
                </a>
              </div>
            </div>
            <div class="card-body text-center">
              <h6 class="card-title" style="color: whitesmoke;">${film.title}</h6>
              <div class="d-flex justify-content-center gap-2">
                <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">
                  ${film.format}
                </span>
                <span class="badge ${ratingClass}" style="${ratingStyle}">
                  ${film.rating}
                </span>
                <span class="badge" style="background-color: rgb(240, 240, 240); color: rgb(33, 37, 41);">
                  ${film.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    movieListContainer.innerHTML = movieCards;

    // Event tombol trailer
    document.querySelectorAll(".btn-trailer").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const trailerUrl = btn.dataset.trailer;
        let embedUrl = "";

        if (trailerUrl.includes("youtu.be/")) {
          const videoId = trailerUrl.split("youtu.be/")[1];
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else if (trailerUrl.includes("watch?v=")) {
          const videoId = trailerUrl.split("watch?v=")[1];
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }

        trailerFrame.src = embedUrl;
        trailerModal.show();
      });
    });

    // Event tombol beli tiket (Diubah untuk menggunakan modal kustom)
    document.querySelectorAll(".btn-tiket").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const filmId = btn.dataset.filmId;
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (isLoggedIn) {
          window.location.href = `/movie?film=${filmId}`;
        } else {
          // Simpan filmId dan tampilkan modal kustom
          targetFilmId = filmId;
          loginChoiceModal.show();
        }
      });
    });

    // Event listener untuk tombol LOGIN di dalam modal kustom
    loginRedirectBtn.addEventListener('click', () => {
      if (targetFilmId) {
        window.location.href = `/login?redirect=/movie?film=${targetFilmId}`;
      }
    });

    // Event listener untuk tombol DAFTAR di dalam modal kustom
    signupRedirectBtn.addEventListener('click', () => {
      if (targetFilmId) {
        window.location.href = `/signup?redirect=/movie?film=${targetFilmId}`;
      }
    });

  } catch (error) {
    console.error('Error loading films:', error);
    loadingMessage.classList.add('d-none');
    errorMessage.classList.remove('d-none');
  } finally {
    loadingMessage.classList.add('d-none');
  }
});