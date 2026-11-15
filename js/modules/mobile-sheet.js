// =========================================================
// MOBILE ELEVATION: CAPSULE, SECTOR SHEET & TOUCH SWIPES
// =========================================================
// =========================================================
    function jumpToAdjacentSector(delta) {
      const list = window.dockSectors || (typeof dockSectors !== 'undefined' ? dockSectors : null);
      if (!list || !list.length) return;
      const newIndex = Math.max(0, Math.min(list.length - 1, currentSectorIndex + delta));
      if (newIndex !== currentSectorIndex) {
        handleRailClick(null, list[newIndex].id);
      }
    }

    function toggleMobileSectorSheet() {
      const sheet = document.getElementById('mobile-sector-sheet');
      if (!sheet) return;
      const isOpen = sheet.classList.contains('is-open');
      if (isOpen) {
        sheet.classList.remove('is-open');
      } else {
        renderMobileSectorSheetList();
        sheet.classList.add('is-open');
      }
    }

    function closeMobileSectorSheet(e) {
      const sheet = document.getElementById('mobile-sector-sheet');
      if (sheet) sheet.classList.remove('is-open');
    }

    function renderMobileSectorSheetList() {
      const listContainer = document.getElementById('sheet-sectors-list');
      const list = window.dockSectors || (typeof dockSectors !== 'undefined' ? dockSectors : null);
      if (!listContainer || !list) return;
      listContainer.innerHTML = '';
      list.forEach((sec, idx) => {
        const row = document.createElement('a');
        row.href = `#${sec.id}`;
        row.className = 'sheet-sector-row' + (idx === currentSectorIndex ? ' active' : '');
        row.onclick = (e) => {
          e.preventDefault();
          closeMobileSectorSheet();
          handleRailClick(null, sec.id);
        };
        row.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="sheet-row-code">${sec.code}</span>
            <div>
              <div class="sheet-row-name">${sec.name}</div>
            </div>
          </div>
          <span class="sheet-row-badge">${idx === currentSectorIndex ? '● ACTIVE' : 'JUMP ↗'}</span>
        `;
        listContainer.appendChild(row);
      });
    }

    // Initialize Touch Swipe for Nivara 13-Spread Manual
    (function initManualTouchSwipe() {
      const stage = document.querySelector('.manual-spread-stage-wrap');
      if (!stage) return;
      let startX = 0;
      let startY = 0;
      stage.addEventListener('touchstart', (e) => {
        if (!e.touches || !e.touches[0]) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const diffX = e.changedTouches[0].clientX - startX;
        const diffY = e.changedTouches[0].clientY - startY;
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            stepManualSpread(1);
          } else {
            stepManualSpread(-1);
          }
        }
      }, { passive: true });
    })();

window.jumpToAdjacentSector = jumpToAdjacentSector;
window.toggleMobileSectorSheet = toggleMobileSectorSheet;
window.closeMobileSectorSheet = closeMobileSectorSheet;
window.renderMobileSectorSheetList = renderMobileSectorSheetList;
