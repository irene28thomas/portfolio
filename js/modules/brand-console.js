// =========================================================
// NIVARA 13-SPREAD ATELIER BRAND MANUAL CONSOLE CONTROLLER
// =========================================================
let currentManualIndex = 0;

function renderManualThumbnails() {
      const strip = document.getElementById('manual-thumb-strip');
      if (!strip) return;
      strip.innerHTML = '';
      nivaraSpreads.forEach((s, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'manual-thumb-pill' + (idx === currentManualIndex ? ' active' : '');
        thumb.title = `Spread ${s.num}: ${s.title}`;
        thumb.innerHTML = `<img loading="lazy" src="assets/optimized/brand_identity/${s.file}" alt="${s.title}" decoding="async">`;
        thumb.onclick = () => selectManualSpread(idx);
        strip.appendChild(thumb);
      });
    }

    function selectManualSpread(idx) {
      if (idx < 0 || idx >= nivaraSpreads.length) return;
      currentManualIndex = idx;
      const s = nivaraSpreads[idx];
      const img = document.getElementById('img-manual-active');
      if (img) img.src = `assets/optimized/brand_identity/${s.file}`;
      
      const counterNum = document.getElementById('manual-counter-num');
      if (counterNum) counterNum.innerText = String(s.num).padStart(2, '0');
      
      const ind = document.getElementById('manual-spread-indicator');
      if (ind) ind.innerText = `SPREAD ${String(s.num).padStart(2, '0')}: ${s.title}`;
      
      // Update Scrubber Fill Bar
      const scrubber = document.getElementById('folio-scrubber-fill');
      if (scrubber) {
        const pct = ((idx + 1) / nivaraSpreads.length) * 100;
        scrubber.style.width = pct + '%';
      }
      
      renderManualThumbnails();
      playUiSound(850, 'triangle', 0.05);
    }

    function stepManualSpread(delta) {
      selectManualSpread((currentManualIndex + delta + nivaraSpreads.length) % nivaraSpreads.length);
    }

    function openActiveManualLightbox() {
      const s = nivaraSpreads[currentManualIndex];
      openLightboxWithImage(`assets/real_works/brand_identity/${s.file}`, `Nivara Brand Guidelines — Spread ${s.num}: ${s.title}`, 'SAE INSTITUTE DUBAI // MASTER BRAND BOOK', '1755 / 1241');
    }

window.renderManualThumbnails = renderManualThumbnails;
window.selectManualSpread = selectManualSpread;
window.stepManualSpread = stepManualSpread;
window.openActiveManualLightbox = openActiveManualLightbox;
