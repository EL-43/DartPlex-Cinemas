document.addEventListener('DOMContentLoaded', async () => {
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

  // Tampilkan loading
  loadingOverlay.classList.remove('d-none');
  filmContainer.textContent = 'Memuat data film...';
  posterEl.src = '';
  synopsisEl.textContent = '';
  

  try {
    // Ambil data film dari JSON
    const filmResponse = await fetch('/films.json');
    if (!filmResponse.ok) throw new Error('Gagal memuat data film.');

    const filmsData = await filmResponse.json();
    const film = filmsData.find(f => f.id === filmKey);

    if (!film) {
      document.body.innerHTML = '<h1 class="text-center mt-5">Film tidak ditemukan.</h1>';
      return;
    }

    // Isi data film
    breadcrumbEl.textContent = film.title;
    filmContainer.textContent = film.title;
    genreEl.textContent = film.genre;
    posterEl.src = film.poster;

    // Rating badge
    ratingEl.textContent = film.rating;
    ratingEl.className = 'badge'; // reset class

    if (film.rating === 'R13+') {
      // tetap pakai Bootstrap
      ratingEl.classList.add('bg-warning', 'text-dark');
    } else if (film.rating === 'D17+') {
      // tetap pakai Bootstrap
      ratingEl.classList.add('bg-danger', 'text-light');
    } else {
      // custom pakai rgb
      ratingEl.style.backgroundColor = 'rgb(40, 167, 69)'; 
      ratingEl.style.color = 'rgba(255, 255, 255, 1)';              
    }

    durationEl.textContent = film.duration;
    formatEl.textContent = film.format;
    synopsisEl.textContent = film.description;
    trailerEl.href = film.trailer;

    // Ambil jadwal tayang
    const jadwalResponse = await fetch('/jadwal.json');
    if (!jadwalResponse.ok) throw new Error('Gagal memuat jadwal tayang.');

    const jadwalData = await jadwalResponse.json();
    const jadwalCinema = jadwalData[filmKey] || [];

    // Tampilkan tombol "Lihat Jadwal" hanya jika ada jadwal
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
                  ${cinema.times.map(time => `<button class="btn btn-outline-primary btn-sm btn-jam">${time}</button>`).join('')}
                </div>
              </div>
            </div>
          `;
          accordion.appendChild(item);
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
