// render dinamis, udah di ubah
const sectionList = document.getElementById("section-bioskop");
const sectionDetail = document.getElementById("section-detail");
const bioskopList = document.getElementById("bioskop-list");
const filmList = document.getElementById("film-list");

let cinemasData = {};   // cinemas.json
let filmsData = {};     // films.json

// Auth handling
document.addEventListener("DOMContentLoaded", () => {
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

    // Sign out handler
    document.querySelector('#signOutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedEmail");
      window.location.reload();
    });
  }
});

// untouchable
function normalizePosterPath(posterPath) {
  if (!posterPath) return "";
  return posterPath.replace(/^(\.\.\/)+/, "");
}

// Cinema
async function renderBioskopList() {
  try {
    // ambil cinema
    const cinemaResponse = await fetch('/cinemas.json');
    if (!cinemaResponse.ok) throw new Error(`Gagal memuat data bioskop: ${cinemaResponse.status}`);
    cinemasData = await cinemaResponse.json();

    // ambil film
    const filmResponse = await fetch('/films.json');
    if (!filmResponse.ok) throw new Error(`Gagal memuat data film: ${filmResponse.status}`);
    filmsData = await filmResponse.json();

    // film -> id
    const filmMap = {};
    filmsData.forEach(film => {
      filmMap[film.id] = film;
    });

    // reset
    bioskopList.innerHTML = '';

    // Card
    Object.keys(cinemasData).forEach(id => {
      const cinema = cinemasData[id];
      const card = document.createElement("div");
      card.className = "p-3 border rounded shadow-sm bioskop-card d-flex justify-content-between align-items-center";
      card.innerHTML = `
        <span class="fw-bold">${cinema.name}</span>
        <span class="text-muted">></span>
      `;
      card.style.cursor = "pointer";
      card.addEventListener("click", () => showDetail(id, filmMap));
      bioskopList.appendChild(card);
    });

    sectionDetail.classList.add("d-none");

  } catch (error) {
    console.error('Error loading cinema/film data:', error);
    bioskopList.innerHTML = '<p class="text-danger">Gagal memuat data bioskop atau film.</p>';
  }
}

// render detail
function showDetail(cinemaId, filmMap) {
  const cinema = cinemasData[cinemaId];
  if (!cinema) return;

  // info
  document.getElementById("detail-bioskop-name").textContent = cinema.name;
  document.getElementById("detail-bioskop-title").textContent = cinema.name;

  const infoEl = document.getElementById("detail-bioskop-info");
  if (infoEl) infoEl.textContent = cinema.info || "";

  // reset
  filmList.innerHTML = "";

  // render detail per cinema
  cinema.films.forEach(fKey => {
    const film = filmMap[fKey];
    if (!film) {
      const card = document.createElement("div");
      card.className = "p-3 border rounded d-flex gap-3 align-items-center text-danger";
      card.innerHTML = `<strong>Film tidak ditemukan: ${fKey}</strong>`;
      filmList.appendChild(card);
      return;
    }

    // rating badge
    let ratingHTML = "";
    if (film.rating === "R13+") {
      ratingHTML = `<span class="badge bg-warning text-dark">${film.rating}</span>`;
    } else if (film.rating === "D17+") {
      ratingHTML = `<span class="badge bg-danger text-light">${film.rating}</span>`;
    } else if (film.rating === "SU") {
      ratingHTML = `<span class="badge" style="background-color: rgb(40, 167, 69); color: white;">${film.rating}</span>`;
    } else {
      ratingHTML = `<span class="badge bg-light text-dark">${film.rating}</span>`;
    }

    // untouchable
    const posterSrc = normalizePosterPath(film.poster);

    // Card
    const card = document.createElement("div");
    card.className = "p-3 border rounded d-flex gap-3 align-items-center film-card";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <img src="${posterSrc}" alt="${film.title}" style="width:80px;height:120px;object-fit:cover;" onerror="this.src='https://via.placeholder.com/80x120?text=No+Image'; this.style.opacity='0.7';">
      <div class="flex-grow-1">
        <h5 class="fw-bold mb-1">${film.title}</h5>
        <p class="mb-1 text-muted">${film.genre || ""}</p>
        <div class="d-flex align-items-center gap-2">
          ${ratingHTML}
          <span class="badge bg-light text-dark">${film.format}</span>
        </div>
      </div>
    `;

    // Klik film -> cek login
    card.addEventListener("click", () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const targetUrl = `/movie?film=${encodeURIComponent(fKey)}`;

      if (isLoggedIn) {
        window.location.href = targetUrl;
      } else {
        const choice = confirm(`Kamu belum login.\n\nPunya akun? Klik OK untuk login, Cancel untuk daftar.`);
        if (choice) {
          localStorage.setItem("redirectAfterLogin", targetUrl);
          window.location.href = `/login?redirect=${encodeURIComponent(targetUrl)}`;
        } else {
          localStorage.setItem("redirectAfterLogin", targetUrl);
          window.location.href = `/signup?redirect=${encodeURIComponent(targetUrl)}`;
        }
      }
    });

    filmList.appendChild(card);
  });

  // reset dan unreset
  sectionList.classList.add("d-none");
  sectionDetail.classList.remove("d-none");
}

document.getElementById("back-to-list")?.addEventListener("click", (e) => {
  e.preventDefault();
  sectionDetail.classList.add("d-none");
  sectionList.classList.remove("d-none");
});

document.querySelector('#section-bioskop .berandatitle a')?.setAttribute('href', '/');
document.addEventListener('DOMContentLoaded', renderBioskopList);

// Redirect
document.addEventListener("DOMContentLoaded", () => {
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
});