document.addEventListener('DOMContentLoaded', async () => {
  const cinemaSelect = document.getElementById('cinema-select');
  const filmCheckboxesContainer = document.getElementById('film-checkboxes');
  const saveBtn = document.getElementById('save-btn');
  const messageEl = document.getElementById('message');
  const cinemaInfo = document.getElementById('cinema-info');

  if (!cinemaSelect || !filmCheckboxesContainer || !saveBtn || !messageEl) {
    console.error('Terjadi Kesalahan saat Mencari elemen!');
    return;
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const authButtons = document.querySelector(".auth-buttons");
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

  let cinemas = {};
  let films = [];

  // role
  if (localStorage.getItem('currentRole') !== 'admin') {
    alert('Halaman Tidak Ada!');
    window.location.href = '/index';
  }

  // Render daftar film sebagai checkbox
  function renderFilmCheckboxes(cinemaId = null) {
    if (!cinemaId) {
      filmCheckboxesContainer.innerHTML = '<div class="text-center text-muted py-3">Pilih bioskop terlebih dahulu</div>';
      return;
    }

    const assignedFilms = cinemas[cinemaId]?.films || [];
    let html = '';

    if (films.length === 0) {
      html = '<div class="text-center text-muted py-3">Belum ada film tersedia</div>';
    } else {
      films.forEach(film => {
        const checked = assignedFilms.includes(film.id) ? 'checked' : '';
        html += `
          <div class="form-check mb-2">
            <input class="form-check-input film-checkbox" type="checkbox" id="film-${film.id}" value="${film.id}" ${checked}>
            <label class="form-check-label" for="film-${film.id}">
              ${film.title}
            </label>
          </div>
        `;
      });
    }

    filmCheckboxesContainer.innerHTML = html;
  }

  // Tampilkan info bioskop
  function updateCinemaInfo(cinemaId) {
    if (!cinemaId || !cinemas[cinemaId]) {
      cinemaInfo.textContent = 'Pilih bioskop untuk melihat detail.';
      return;
    }
    cinemaInfo.innerHTML = `<i class="fas fa-map-marker-alt me-1"></i> ${cinemas[cinemaId].info || 'Alamat tidak tersedia'}`;
  }

  // Load data
  async function loadData() {
    try {
      const [cinemaRes, filmRes] = await Promise.all([
        fetch('/api/cinemas'),
        fetch('/api/films')
      ]);
      cinemas = await cinemaRes.json();
      films = await filmRes.json();

      // Isi dropdown bioskop
      cinemaSelect.innerHTML = '<option value="">-- Pilih bioskop --</option>';
      Object.keys(cinemas).forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = cinemas[id].name;
        cinemaSelect.appendChild(opt);
      });

      // Render film (kosong dulu)
      renderFilmCheckboxes();
    } catch (err) {
      console.error('Error load data:', err);
      messageEl.innerHTML = '<div class="alert alert-danger">Gagal memuat data. Cek konsol untuk detail.</div>';
    }
  }

  // bioskop
  cinemaSelect.addEventListener('change', () => {
    const id = cinemaSelect.value;
    updateCinemaInfo(id);
    renderFilmCheckboxes(id);
  });

  // simpan
  saveBtn.addEventListener('click', async () => {
    const cinemaId = cinemaSelect.value;
    if (!cinemaId) {
      alert('Pilih bioskop dulu!');
      return;
    }

    const selectedFilms = Array.from(document.querySelectorAll('.film-checkbox:checked'))
      .map(cb => cb.value);

    try {
      const formData = new URLSearchParams();
      formData.append('cinemaId', cinemaId);
      formData.append('filmIds', selectedFilms.join(','));

      const res = await fetch('/api/cinemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        messageEl.innerHTML = '<div class="alert alert-success">Jadwal berhasil disimpan!</div>';
        // Update data lokal
        cinemas[cinemaId].films = selectedFilms;
      } else {
        messageEl.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
      }
    } catch (err) {
      console.error('Save error:', err);
      messageEl.innerHTML = '<div class="alert alert-danger">Gagal, Cek koneksi!</div>';
    }
  });

  loadData(); // eksekusi
});