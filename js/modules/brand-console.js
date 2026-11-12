// =========================================================
// NIVARA 13-SPREAD ATELIER BRAND MANUAL CONSOLE CONTROLLER
// =========================================================
let currentManualIndex = 0;

function renderMobileManualVerticalStack() {
  const stack = document.getElementById('mobile-manual-vertical-stack');
  if (!stack || stack.dataset.populated === 'true' || !window.nivaraSpreads) return;
  stack.dataset.populated = 'true';
  stack.innerHTML = '';

  window.nivaraSpreads.forEach((s, idx) => {
    const numStr = String(s.num).padStart(2, '0');
    const card = document.createElement('article');
    card.className = 'mobile-manual-spread-card';
    card.setAttribute('data-spread-idx', String(idx));
    card.onclick = () => openManualSpreadLightbox(idx);
    card.innerHTML = `
      <div class="mobile-spread-card-header">
        <span class="mobile-spread-num">SPREAD ${numStr} / 13</span>
        <span class="mobile-spread-title">${s.title}</span>
      </div>
      <div class="mobile-spread-media-frame">
        <img loading="lazy" src="assets/optimized/brand_identity/${s.file}" alt="Spread ${numStr}: ${s.title}" width="1755" height="1241" decoding="async">
        <span class="mobile-spread-zoom-pill">🔍 TAP FOR PINCH-ZOOM</span>
      </div>
    `;
    stack.appendChild(card);
  });
}

function renderManualThumbnails() {
  renderMobileManualVerticalStack();
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
  if (typeof playUiSound === 'function') playUiSound(850, 'triangle', 0.05);
}

function stepManualSpread(delta) {
  selectManualSpread((currentManualIndex + delta + nivaraSpreads.length) % nivaraSpreads.length);
}

function openManualSpreadLightbox(idx) {
  const safeIdx = typeof idx === 'number' ? idx : currentManualIndex;
  const s = nivaraSpreads[safeIdx] || nivaraSpreads[0];
  openLightboxWithImage(
    `assets/real_works/brand_identity/${s.file}`,
    `Nivara Brand Guidelines — Spread ${String(s.num).padStart(2, '0')}: ${s.title}`,
    'SAE INSTITUTE DUBAI // MASTER BRAND BOOK',
    '1755 / 1241'
  );
}

function openActiveManualLightbox() {
  openManualSpreadLightbox(currentManualIndex);
}

window.renderManualThumbnails = renderManualThumbnails;
window.selectManualSpread = selectManualSpread;
window.stepManualSpread = stepManualSpread;
window.openManualSpreadLightbox = openManualSpreadLightbox;
window.openActiveManualLightbox = openActiveManualLightbox;
