document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("resultsContainer");
  const trailerModal = new bootstrap.Modal(document.getElementById("trailerModal"));
  const trailerFrame = document.getElementById("trailerFrame");
  const authButtons = document.querySelector(".auth-buttons");
  const editMoviesBtn = document.getElementById("editMoviesBtn");
  let films = [];

  // Auth handling
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const displayUsername =
    localStorage.getItem("currentUsername") ||
    localStorage.getItem("savedUsername") ||
    "User";

  // edit movies button invisible by default
  if (editMoviesBtn) {
    editMoviesBtn.style.display = "none";
  }

  if (isLoggedIn && authButtons) {
    authButtons.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-outline-secondary dropdown-toggle fw-bold" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fas fa-user me-1"></i> ${displayUsername}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="#" id="signOutBtn"><i class="fas fa-right-from-bracket me-2"></i>Sign out</a></li>
        </ul>
      </div>
    `;

    document.querySelector('#signOutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.reload();
    });

    // Tampilkan tombol Edit Movies kalau admin
    if (isAdmin && editMoviesBtn) {
      editMoviesBtn.style.display = "inline-block";
    }
  }

  // Fetch films
  fetch("/films.json")
    .then(res => res.json())
    .then(data => films = data);

  // Search handler
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    resultsContainer.innerHTML = "";
    if (!query.trim()) return;

    const filtered = films.filter(f =>
      f.title.toLowerCase().includes(query) ||
      f.genre.toLowerCase().includes(query)
    );

    if (!filtered.length) {
      resultsContainer.innerHTML = `<p class="text-center mt-3">No results found.</p>`;
      return;
    }

    filtered.forEach(film => {
      const col = document.createElement("div");
      col.classList.add("col-md-4", "mb-3");
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${film.poster}" class="card-img-top" alt="${film.title}">
          <div class="card-body text-start">
            <h5 class="card-title fw-bold">${film.title}</h5>
            <p class="card-text"><strong>Genre:</strong> ${film.genre}</p>
            <p class="card-text"><strong>Rating:</strong> ${film.rating}</p>
            <p class="card-text"><strong>Duration:</strong> ${film.duration}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm watch-trailer" data-trailer="${film.trailer}">Watch Trailer</button>
              <button class="btn btn-success btn-sm btn-tiket" data-film-id="${film.id}" data-film-title="${film.title}">Beli Tiket</button>
            </div>
          </div>
        </div>
      `;
      resultsContainer.appendChild(col);
    });

    // Trailer button
    document.querySelectorAll(".watch-trailer").forEach(btn => {
      btn.addEventListener("click", () => {
        let trailerUrl = btn.getAttribute("data-trailer");

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
    });

    // Tiket button
    document.querySelectorAll(".btn-tiket").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const filmId = btn.dataset.filmId;

        if (isLoggedIn) {
          window.location.href = `/movie?film=${filmId}`;
        } else {
          const choice = confirm(`Kamu belum login.\n\nPunya akun? Klik OK untuk login, Cancel untuk daftar.`);
          if (choice) {
            window.location.href = `/login?redirect=/movie?film=${filmId}`;
          } else {
            window.location.href = `/signup?redirect=/movie?film=${filmId}`;
          }
        }
      });
    });
  });

  // Reset trailer modal
  document.getElementById("trailerModal").addEventListener("hidden.bs.modal", () => {
    trailerFrame.src = "";
  });
});
