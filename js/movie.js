document.addEventListener('DOMContentLoaded', async () => {
  // Auth handling
  const authButtons = document.querySelector(".auth-buttons");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const savedUsername = localStorage.getItem("savedUsername") || localStorage.getItem("currentUsername") || "User";

  if (isLoggedIn && authButtons) {
    authButtons.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-outline-secondary dropdown-toggle fw-bold" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
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
  }

  // Trailer modal
  const trailerModal = new bootstrap.Modal(document.getElementById("trailerModal"));
  const trailerFrame = document.getElementById("trailerFrame");

  document.getElementById("trailerModal").addEventListener("hidden.bs.modal", () => {
    trailerFrame.src = "";
  });

  // Detail film
  const params = new URLSearchParams(window.location.search);
  const filmKey = params.get("film");

  if (!filmKey) {
    document.body.innerHTML = '<h1 class="text-center mt-5">Film tidak ditemukan.</h1>';
    return;
  }

  const filmContainer = document.getElementById('film-title');
  const posterEl = document.getElementById('film-poster');
  const genreEl = document.getElementById('film-genre');
  const ratingEl = document.getElementById('film-rating');
  const durationEl = document.getElementById('film-duration');
  const formatEl = document.getElementById('film-format');
  const synopsisEl = document.getElementById('film-synopsis');
  const trailerEl = document.getElementById('film-trailer');
  const breadcrumbEl = document.getElementById('breadcrumb-film');
  const jadwalContainer = document.getElementById('jadwal-container');
  const accordion = document.getElementById('jadwal-accordion');
  const lihatJadwalBtn = document.getElementById('lihat-jadwal');
  const loadingOverlay = document.getElementById('loading-overlay');

  loadingOverlay.classList.remove('d-none');
  filmContainer.textContent = 'Memuat data film...';
  posterEl.src = '';
  synopsisEl.textContent = '';

  try {
    const filmResponse = await fetch('/films.json');
    if (!filmResponse.ok) throw new Error('Gagal memuat data film.');

    const filmsData = await filmResponse.json();
    const film = filmsData.find(f => f.id === filmKey);

    if (!film) {
      document.body.innerHTML = '<h1 class="text-center mt-5">Film tidak ditemukan.</h1>';
      return;
    }

    breadcrumbEl.textContent = film.title;
    filmContainer.textContent = film.title;
    genreEl.textContent = film.genre;
    posterEl.src = film.poster;

    ratingEl.textContent = film.rating;
    ratingEl.className = 'badge';
    if (film.rating === 'R13+') {
      ratingEl.classList.add('bg-warning', 'text-dark');
    } else if (film.rating === 'D17+') {
      ratingEl.classList.add('bg-danger', 'text-light');
    } else {
      ratingEl.style.backgroundColor = 'rgb(40, 167, 69)';
      ratingEl.style.color = 'rgba(255, 255, 255, 1)';
    }

    durationEl.textContent = film.duration;
    formatEl.textContent = film.format;
    synopsisEl.textContent = film.description;

    trailerEl.setAttribute("data-trailer", film.trailer);

    // Trailer button thingy
    trailerEl.addEventListener("click", (e) => {
      e.preventDefault();

      let trailerUrl = trailerEl.getAttribute("data-trailer");

      if (trailerUrl.includes("youtu.be/")) {
        const videoId = trailerUrl.split("youtu.be/")[1];
        trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else if (trailerUrl.includes("watch?v=")) {
        const videoId = trailerUrl.split("watch?v=")[1];
        trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }

      trailerFrame.src = trailerUrl;
      trailerModal.show();
    });


    // Jadwal
    const jadwalResponse = await fetch('/jadwal.json');
    if (!jadwalResponse.ok) throw new Error('Gagal memuat jadwal tayang.');

    const jadwalData = await jadwalResponse.json();
    const jadwalCinema = jadwalData[filmKey] || [];

    if (jadwalCinema.length > 0) {
      lihatJadwalBtn.style.display = 'inline-block';
      lihatJadwalBtn.addEventListener('click', () => {
        jadwalContainer.classList.remove('d-none');
        accordion.innerHTML = '';

        jadwalCinema.forEach((cinema, index) => {
          const item = document.createElement('div');
          item.classList.add('accordion-item', 'mb-3');

          item.innerHTML = `
            <h2 class="accordion-header" id="heading${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                ${cinema.cinema}
              </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#jadwal-accordion">
              <div class="accordion-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Reguler 2D</span>
                  <span class="fw-bold">${cinema.price}</span>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  ${cinema.times.map(time => `<button class="btn btn-outline-primary btn-sm btn-jam" data-time="${time}" data-cinema="${cinema.cinema}">${time}</button>`).join('')}
                </div>
              </div>
            </div>
          `;
          accordion.appendChild(item);
        });

        accordion.querySelectorAll(".btn-jam").forEach(btn => {
          btn.addEventListener("click", () => {
            const time = btn.dataset.time;
            const cinemaName = btn.dataset.cinema;
            const targetUrl = `/checkout?film=${encodeURIComponent(filmKey)}&cinema=${encodeURIComponent(cinemaName)}&time=${encodeURIComponent(time)}`;

            if (localStorage.getItem("isLoggedIn") === "true") {
              window.location.href = targetUrl;
            } else {
              const choice = confirm(`Kamu belum login.\n\nPunya akun? Klik OK untuk login, Cancel untuk daftar.`);
              if (choice) {
                window.location.href = `/login?redirect=${encodeURIComponent(targetUrl)}`;
              } else {
                window.location.href = `/signup?redirect=${encodeURIComponent(targetUrl)}`;
              }
            }
          });
        });
      });
    } else {
      lihatJadwalBtn.style.display = 'none';
      jadwalContainer.classList.add('d-none');
    }

  } catch (error) {
    console.error('Error loading film or schedule:', error);
    filmContainer.textContent = 'Gagal memuat data film.';
    synopsisEl.textContent = 'Silakan coba lagi nanti.';
  } finally {
    loadingOverlay.classList.add('d-none');
  }
});
