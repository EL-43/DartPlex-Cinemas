// render dinamis, udah di ubah
const sectionList = document.getElementById("section-bioskop");
const sectionDetail = document.getElementById("section-detail");
const bioskopList = document.getElementById("bioskop-list");
const filmList = document.getElementById("film-list");

let cinemasData = {};   // cinemas.json
let filmsData = {};     // films.json

// untouchable -> JANGAN DI OTAK ATIK
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

    // film --> id
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

    card.addEventListener("click", () => {
      window.location.href = `/movie?film=${encodeURIComponent(fKey)}`;
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
