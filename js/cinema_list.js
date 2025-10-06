const sectionList = document.getElementById("section-bioskop");
const sectionDetail = document.getElementById("section-detail");
const bioskopList = document.getElementById("bioskop-list");
const filmList = document.getElementById("film-list");

let cinemasData = {};
let filmsData = {};

// Custom popup modal elements
const loginChoiceModalElement = document.getElementById('loginChoiceModal');
let loginChoiceModal;
if (loginChoiceModalElement) {
  loginChoiceModal = new bootstrap.Modal(loginChoiceModalElement);
}
const loginRedirectBtn = document.getElementById('loginRedirectBtn');
const signupRedirectBtn = document.getElementById('signupRedirectBtn');
let redirectUrl = null;

// Auth handling
document.addEventListener("DOMContentLoaded", () => {
  const authButtons = document.querySelector(".auth-buttons");
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
    document.querySelector('#signOutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedEmail");
      window.location.reload();
    });
  }
});

function normalizePosterPath(posterPath) {
  if (!posterPath) return "";
  return posterPath.replace(/^(\.\.\/)+/, "");
}

async function renderBioskopList() {
  try {
    const cinemaResponse = await fetch('/cinemas.json');
    if (!cinemaResponse.ok) throw new Error(`Gagal memuat data bioskop: ${cinemaResponse.status}`);
    cinemasData = await cinemaResponse.json();

    const filmResponse = await fetch('/films.json');
    if (!filmResponse.ok) throw new Error(`Gagal memuat data film: ${filmResponse.status}`);
    filmsData = await filmResponse.json();

    const filmMap = {};
    filmsData.forEach(film => {
      filmMap[film.id] = film;
    });

    bioskopList.innerHTML = '';
    Object.keys(cinemasData).forEach(id => {
      const cinema = cinemasData[id];
      const card = document.createElement("div");
      card.className = "p-3 border rounded shadow-sm bioskop-card d-flex justify-content-between align-items-center";
      card.innerHTML = `
        <span class="fw-bold" style="color: whitesmoke;">${cinema.name}</span>
        <span class="text-muted" style="color: whitesmoke;"></span>
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

function showDetail(cinemaId, filmMap) {
  const cinema = cinemasData[cinemaId];
  if (!cinema) return;

  document.getElementById("detail-bioskop-name").textContent = cinema.name;
  document.getElementById("detail-bioskop-title").textContent = cinema.name;

  const infoEl = document.getElementById("detail-bioskop-info");
  if (infoEl) {
    infoEl.textContent = cinema.info || "";
    infoEl.style.setProperty("color", "whitesmoke", "important");
  }

  filmList.innerHTML = "";

  cinema.films.forEach(fKey => {
    const film = filmMap[fKey];
    if (!film) {
      const card = document.createElement("div");
      card.className = "p-3 border rounded d-flex gap-3 align-items-center text-danger";
      card.innerHTML = `<strong>Film tidak ditemukan: ${fKey}</strong>`;
      filmList.appendChild(card);
      return;
    }

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

    const posterSrc = normalizePosterPath(film.poster);
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

    card.addEventListener("click", () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const targetUrl = `/movie?film=${encodeURIComponent(fKey)}`;

      if (isLoggedIn) {
        window.location.href = targetUrl;
      } else {
        // Simpan URL redirect dan tampilkan modal kustom
        redirectUrl = targetUrl;
        if (loginChoiceModal) {
          loginChoiceModal.show();
        }
      }
    });

    filmList.appendChild(card);
  });

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

// Event listener untuk tombol-tombol di dalam modal
loginRedirectBtn?.addEventListener('click', () => {
  if (redirectUrl) {
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  }
});

signupRedirectBtn?.addEventListener('click', () => {
  if (redirectUrl) {
    window.location.href = `/signup?redirect=${encodeURIComponent(redirectUrl)}`;
  }
});

// Redirect untuk tombol login/signup utama di navbar
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