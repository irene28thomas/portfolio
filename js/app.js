// =========================================================================
// IRENE THOMAS PORTFOLIO — APPLICATION INITIALIZER
// =========================================================================

// =========================================================================
// MOBILE CONTINUUM MATRIX — INFINITE LOOP & ASYMMETRIC INITIAL CENTERING
// =========================================================================
function initMobileMatrixLoop() {
  if (window.innerWidth > 860) return;

  const tracks = [
    { el: document.getElementById('track-left'), centerTarget: 1, offsetDelta: -28 },  // Row 1: 2nd image (index 1)
    { el: document.getElementById('track-center'), centerTarget: 2, offsetDelta: 32 },  // Row 2: 3rd image (index 2)
    { el: document.getElementById('track-right'), centerTarget: 0, offsetDelta: -16 }   // Row 3: 1st image (index 0)
  ];

  tracks.forEach(({ el, centerTarget, offsetDelta }) => {
    if (!el || el.dataset.loopInitialized === 'true') return;
    el.dataset.loopInitialized = 'true';

    const originalCards = Array.from(el.children);
    if (originalCards.length < 3) return;

    // Build 5 complete sets: Set 0 & 1 (prepended), Set 2 (original), Set 3 & 4 (appended)
    // This creates an expansive runway so even high-speed swipes never hit boundaries
    for (let s = 0; s < 2; s++) {
      const clones = originalCards.map(c => c.cloneNode(true));
      clones.reverse().forEach(clone => {
        clone.setAttribute('data-clone', 'true');
        el.insertBefore(clone, el.firstChild);
      });
    }
    for (let s = 0; s < 2; s++) {
      const clones = originalCards.map(c => c.cloneNode(true));
      clones.forEach(clone => {
        clone.setAttribute('data-clone', 'true');
        el.appendChild(clone);
      });
    }

    const singleCycleCount = originalCards.length;
    const computeStride = () => {
      const allCards = el.querySelectorAll('.stream-card');
      if (allCards.length >= 2) {
        return allCards[1].offsetLeft - allCards[0].offsetLeft;
      }
      return 260;
    };

    let stride = computeStride();

    // Center designated card in middle set (Set 2 = index 2 * singleCycleCount)
    requestAnimationFrame(() => {
      stride = computeStride();
      const allCards = el.querySelectorAll('.stream-card');
      const middleSetStartIndex = 2 * singleCycleCount;
      const targetCard = allCards[middleSetStartIndex + centerTarget];
      if (targetCard) {
        const trackWidth = el.clientWidth || window.innerWidth;
        const cardCenter = targetCard.offsetLeft + (targetCard.offsetWidth / 2);
        const initialScroll = cardCenter - (trackWidth / 2) + offsetDelta;
        el.scrollLeft = Math.max(0, initialScroll);
      }
    });

    // Seamless Infinite Loop Listener - deferred normalize on idle to protect touch momentum
    let wrapTimeout = null;
    let isAdjusting = false;

    const normalizeScroll = () => {
      if (isAdjusting) return;
      stride = computeStride();
      const singleSetWidth = stride * singleCycleCount;
      if (el.scrollLeft < singleSetWidth * 1.0) {
        isAdjusting = true;
        el.scrollLeft += singleSetWidth;
        setTimeout(() => { isAdjusting = false; }, 30);
      } else if (el.scrollLeft > singleSetWidth * 3.0) {
        isAdjusting = true;
        el.scrollLeft -= singleSetWidth;
        setTimeout(() => { isAdjusting = false; }, 30);
      }
    };

    el.addEventListener('scroll', () => {
      if (isAdjusting) return;
      clearTimeout(wrapTimeout);
      wrapTimeout = setTimeout(normalizeScroll, 60);
    }, { passive: true });

    if ('onscrollend' in window) {
      el.addEventListener('scrollend', normalizeScroll, { passive: true });
    }
  });
}

// =========================================================================
// HARDWARE LAUNCH SUITE — TOUCH SWIPE & PEEK CONTROLLER
// =========================================================================
function initHardwareSliderSwipe() {
  const stage = document.querySelector('.studio-banner-stage-wrapper');
  if (!stage || stage.dataset.swipeInitialized === 'true') return;
  stage.dataset.swipeInitialized = 'true';

  const hardwareItems = [
    {
      src: 'assets/real_works/Callaway_Quantum_Series_900x600.jpg',
      title: 'Callaway Quantum Series',
      desc: 'Directional lighting & aggressive typography crafted for premier GCC golf retail launch campaigns.'
    },
    {
      src: 'assets/real_works/TaylorMade_Qi4D_Series_900x600.jpg',
      title: 'TaylorMade Qi4D Series',
      desc: 'High-contrast typography and carbon-fiber aesthetic for TaylorMade flagship launch.'
    },
    {
      src: 'assets/real_works/PXG_GEN8_Irons_900x600.jpg',
      title: 'PXG GEN8 Irons',
      desc: 'Industrial darkness and chrome metallic finish spotlighting precision golf engineering.'
    }
  ];

  let currentIdx = 0;

  function cycleHardware(dir) {
    currentIdx = (currentIdx + dir + hardwareItems.length) % hardwareItems.length;
    const item = hardwareItems[currentIdx];
    const pills = document.querySelectorAll('.studio-suite-card');
    const targetPill = pills[currentIdx];
    if (typeof switchBannerSlider === 'function') {
      switchBannerSlider(item.src, item.title, item.desc, targetPill);
    }
    if (targetPill) {
      targetPill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  window.prevHardwareSlider = function(e) {
    if (e) e.stopPropagation();
    cycleHardware(-1);
  };
  window.nextHardwareSlider = function(e) {
    if (e) e.stopPropagation();
    cycleHardware(1);
  };

  // Sync index when clicked directly
  document.querySelectorAll('.studio-suite-card').forEach((card, idx) => {
    card.addEventListener('click', () => {
      currentIdx = idx;
    });
  });

  // Touch Swipe Gestures
  let touchStartX = 0;
  let touchStartY = 0;
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        cycleHardware(diffX < 0 ? 1 : -1);
      }
    }
  }, { passive: true });
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Nivara Brand Manual Console
  if (typeof renderManualThumbnails === 'function') {
    renderManualThumbnails();
  }

  // 2. Scrubber Track Click-To-Jump
  const track = document.querySelector('.folio-scrubber-track');
  if (track && window.nivaraSpreads) {
    track.style.cursor = 'pointer';
    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetIdx = Math.min(window.nivaraSpreads.length - 1, Math.floor(ratio * window.nivaraSpreads.length));
      if (typeof selectManualSpread === 'function') {
        selectManualSpread(targetIdx);
      }
    });
  }

  // 3. Attach gesture navigation for Storefront Carousel
  if (typeof updateDeviceSliderDisplay === 'function') {
    updateDeviceSliderDisplay();
  }

  // 4. Initial Scroll & Sector Tracking
  if (typeof onUnifiedScroll === 'function') {
    onUnifiedScroll();
  }

  // 5. Initialize Mobile Continuum Matrix Loop & Centering
  initMobileMatrixLoop();

  // 6. Initialize Mobile Hardware Slider Swipe & Gestures
  initHardwareSliderSwipe();

  // 7. Reset poster gallery scroll position to start at 0 on mobile
  const posterGrid = document.getElementById('poster-grid');
  if (posterGrid) {
    posterGrid.scrollLeft = 0;
  }
});

