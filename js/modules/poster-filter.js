// =========================================================
// POSTER GALLERY FILTER
// =========================================================
function filterPosterGallery(filter, btn) {
      document.querySelectorAll('.btn-poster-filter').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      playUiSound(920, 'sine', 0.05);

      const cards = document.querySelectorAll('.poster-item');
      cards.forEach(c => {
        if (filter === 'all' || c.classList.contains(filter)) {
          c.style.display = 'flex';
        } else {
          c.style.display = 'none';
        }
      });
    }

window.filterPosterGallery = filterPosterGallery;
