// =========================================================
// STORYBOARD INSPECTION & IMMERSIVE PINCH-ZOOM / SWIPE LIGHTBOX
// =========================================================
(function () {
  let activeGallery = [];
  let activeGalleryIdx = 0;
  let zoomScale = 1;
  let panX = 0;
  let panY = 0;

  function applyZoomTransform(animate = false) {
    const img = document.getElementById('lightbox-full-img');
    const zoomBtn = document.getElementById('lightbox-zoom-btn');
    const container = document.getElementById('lightbox-media-container');
    if (!img) return;
    img.style.transition = animate ? 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease' : 'opacity 0.2s ease';
    img.style.transform = `translate3d(${panX.toFixed(1)}px, ${panY.toFixed(1)}px, 0) scale(${zoomScale.toFixed(3)})`;
    img.style.transformOrigin = 'center center';
    if (zoomBtn) {
      zoomBtn.innerText = `🔍 ${zoomScale > 1.05 ? zoomScale.toFixed(1) + '×' : '1×'}`;
      zoomBtn.classList.toggle('is-zoomed', zoomScale > 1.05);
    }
    if (container) {
      container.classList.toggle('is-zoomed', zoomScale > 1.05);
    }
  }

  function resetLightboxZoom(animate = false) {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    applyZoomTransform(animate);
  }

  function toggleLightboxZoom(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (zoomScale > 1.1) {
      resetLightboxZoom(true);
    } else {
      zoomScale = 2.4;
      panX = 0;
      panY = 0;
      applyZoomTransform(true);
    }
  }

  // Auto-resolve gallery list for posters, brand manual spreads, or storefront masters
  function inferGalleryForImage(src, title, sub, aspectRatio) {
    if (!src) return { list: [{ src, title, sub, aspectRatio }], index: 0 };

    // 1. Posters gallery (all currently visible poster items)
    if (src.indexOf('posters/') !== -1) {
      const visibleCards = Array.from(document.querySelectorAll('.poster-item')).filter(
        (el) => el.style.display !== 'none'
      );
      const list = [];
      let foundIdx = 0;
      visibleCards.forEach((card) => {
        const onclickAttr = card.getAttribute('onclick') || '';
        const m = onclickAttr.match(/openLightboxWithImage\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/);
        if (m) {
          if (m[1] === src) foundIdx = list.length;
          list.push({ src: m[1], title: m[2], sub: m[3], aspectRatio: '3 / 4' });
        }
      });
      if (list.length > 0) return { list, index: foundIdx };
    }

    // 2. Nivara 13-Spread Brand Manual
    if (src.indexOf('brand_identity/Brand Identity_NIVARA') !== -1 && window.nivaraSpreads) {
      let foundIdx = 0;
      const list = window.nivaraSpreads.map((s, idx) => {
        const fullSrc = `assets/real_works/brand_identity/${s.file}`;
        const optSrc = `assets/optimized/brand_identity/${s.file}`;
        if (src === fullSrc || src === optSrc || src.endsWith(s.file)) foundIdx = idx;
        return {
          src: fullSrc,
          title: `Nivara Brand Guidelines — Spread ${String(s.num).padStart(2, '0')}: ${s.title}`,
          sub: 'SAE INSTITUTE DUBAI // MASTER BRAND BOOK',
          aspectRatio: '1755 / 1241'
        };
      });
      return { list, index: foundIdx };
    }

    // 3. Storefront 1920x600 Desktop Masters
    if (window.sliderCampaigns && window.sliderBrandKeys) {
      let matchedIdx = -1;
      const list = window.sliderBrandKeys.map((key, idx) => {
        const c = window.sliderCampaigns[key];
        if (
          src === c.desktop_native ||
          src === c.desktop ||
          src === c.mobile_native ||
          src === c.mobile ||
          src === c.app_native ||
          src === c.app
        ) {
          matchedIdx = idx;
        }
        return {
          src: c.desktop_native || c.desktop,
          title: `${c.title} [1920×600 DESKTOP MASTER]`,
          sub: 'OMNICHANNEL STOREFRONT MASTER',
          aspectRatio: '1920 / 600'
        };
      });
      if (matchedIdx !== -1) return { list, index: matchedIdx };
    }

    return { list: [{ src, title, sub, aspectRatio }], index: 0 };
  }

  function updateGalleryControlsUI() {
    const counterPill = document.getElementById('lightbox-counter-pill');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');
    const hasMulti = activeGallery.length > 1;
    if (counterPill) {
      counterPill.innerText = `${String(activeGalleryIdx + 1).padStart(2, '0')} / ${String(activeGallery.length).padStart(2, '0')}`;
      counterPill.style.display = hasMulti ? 'inline-flex' : 'none';
    }
    if (prevBtn) prevBtn.style.display = hasMulti ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = hasMulti ? 'flex' : 'none';
  }

  function handleStoryboardBoxClick() {
    openLightboxWithImage(
      'assets/real_works/Barney_Dale__The_Cloud_story_arc.jpg',
      'Barney Dale: The Cloud // Master Storyboard Arc',
      'SAE INSTITUTE DUBAI // 2D PRODUCTION SHORT',
      '4118 / 1885'
    );
  }

  function openLightboxWithImage(src, title, sub = 'EDITORIAL ARCHIVE', aspectRatio = null, customGallery = null, customIdx = 0) {
    const box = document.getElementById('storyboard-lightbox');
    const container = document.getElementById('lightbox-media-container');
    const skeleton = document.getElementById('lightbox-skeleton');
    const titleEl = document.getElementById('lightbox-title-text');
    const subEl = document.getElementById('lightbox-sub-text');
    const zoomBtn = document.getElementById('lightbox-zoom-btn');

    if (Array.isArray(customGallery) && customGallery.length) {
      activeGallery = customGallery;
      activeGalleryIdx = Math.max(0, Math.min(customGallery.length - 1, customIdx));
    } else {
      const inferred = inferGalleryForImage(src, title, sub, aspectRatio);
      activeGallery = inferred.list;
      activeGalleryIdx = inferred.index;
    }
    updateGalleryControlsUI();
    if (zoomBtn) zoomBtn.style.display = 'inline-flex';
    resetLightboxZoom(false);

    if (titleEl) titleEl.innerText = title;
    if (subEl) subEl.innerText = sub;

    if (container) {
      const v = container.querySelector('video');
      if (v) {
        v.pause();
        v.remove();
      }
      container.style.aspectRatio = aspectRatio || '16 / 9';
    }

    if (skeleton) skeleton.classList.remove('is-hidden');

    let img = document.getElementById('lightbox-full-img');
    if (!img && container) {
      img = document.createElement('img');
      img.id = 'lightbox-full-img';
      img.decoding = 'async';
      container.appendChild(img);
    }

    if (img) {
      img.style.display = 'block';
      img.style.opacity = '0';
      img.alt = title || 'Artwork';
      img.dataset.targetSrc = src;

      const temp = new Image();
      temp.onload = () => {
        if (container && temp.naturalWidth && temp.naturalHeight) {
          container.style.aspectRatio = `${temp.naturalWidth} / ${temp.naturalHeight}`;
        }
        img.src = src;
        img.style.opacity = '1';
        if (skeleton) skeleton.classList.add('is-hidden');
      };
      temp.onerror = () => {
        img.src = src;
        img.style.opacity = '1';
        if (skeleton) skeleton.classList.add('is-hidden');
      };
      temp.src = src;
    }

    if (box) box.classList.add('is-open');
    document.body.classList.add('has-lightbox-open');
    if (typeof playUiSound === 'function') playUiSound(1000, 'triangle', 0.08);
  }

  function stepLightboxGallery(delta, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!activeGallery || activeGallery.length <= 1) return;
    activeGalleryIdx = (activeGalleryIdx + delta + activeGallery.length) % activeGallery.length;
    const item = activeGallery[activeGalleryIdx];
    if (item) {
      openLightboxWithImage(item.src, item.title, item.sub, item.aspectRatio, activeGallery, activeGalleryIdx);
    }
  }

  function openLightboxWithVideo(src, title, sub = 'EXPANDED 2D ANIMATION') {
    const box = document.getElementById('storyboard-lightbox');
    const container = document.getElementById('lightbox-media-container');
    const skeleton = document.getElementById('lightbox-skeleton');
    const titleEl = document.getElementById('lightbox-title-text');
    const subEl = document.getElementById('lightbox-sub-text');
    const zoomBtn = document.getElementById('lightbox-zoom-btn');

    activeGallery = [];
    activeGalleryIdx = 0;
    updateGalleryControlsUI();
    if (zoomBtn) zoomBtn.style.display = 'none';

    if (titleEl) titleEl.innerText = title;
    if (subEl) subEl.innerText = sub;

    const img = document.getElementById('lightbox-full-img');
    if (img) img.style.display = 'none';

    let video = container ? container.querySelector('video') : null;
    if (!video && container) {
      video = document.createElement('video');
      video.autoplay = true;
      video.controls = true;
      video.playsInline = true;
      container.appendChild(video);
    }
    if (video) {
      video.style.display = 'block';
      video.src = src;
      video.onloadeddata = () => {
        if (skeleton) skeleton.classList.add('is-hidden');
      };
    }
    if (skeleton) skeleton.classList.remove('is-hidden');

    if (box) box.classList.add('is-open');
    document.body.classList.add('has-lightbox-open');
    if (typeof playUiSound === 'function') playUiSound(1000, 'triangle', 0.08);
  }

  function closeStoryboardLightbox() {
    const box = document.getElementById('storyboard-lightbox');
    if (box) box.classList.remove('is-open');
    document.body.classList.remove('has-lightbox-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    resetLightboxZoom(false);
    const container = document.getElementById('lightbox-media-container');
    if (container) {
      const v = container.querySelector('video');
      if (v) {
        v.pause();
        v.remove();
      }
      const img = document.getElementById('lightbox-full-img');
      if (img) img.style.opacity = '0';
    }
    if (typeof playUiSound === 'function') playUiSound(600, 'sine', 0.05);
  }

  // Initialize Pinch-Zoom, Pan, Double-Tap Zoom, and Gallery Swipe on #lightbox-stage
  function initLightboxTouchGestures() {
    const box = document.getElementById('storyboard-lightbox');
    const container = document.getElementById('lightbox-media-container');
    if (!box || !container) return;

    let startDist = 0;
    let startScale = 1;
    let isPinching = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let lastTapTime = 0;

    function getTouchDist(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    container.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 2) {
          isPinching = true;
          startDist = getTouchDist(e.touches);
          startScale = zoomScale;
        } else if (e.touches.length === 1) {
          isPinching = false;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          startPanX = panX;
          startPanY = panY;

          const now = performance.now();
          if (now - lastTapTime < 280) {
            toggleLightboxZoom();
            lastTapTime = 0;
          } else {
            lastTapTime = now;
          }
        }
      },
      { passive: true }
    );

    container.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 2 && isPinching) {
          const dist = getTouchDist(e.touches);
          if (startDist > 10) {
            zoomScale = Math.max(1, Math.min(4, startScale * (dist / startDist)));
            if (zoomScale <= 1.02) {
              panX = 0;
              panY = 0;
            }
            applyZoomTransform(false);
          }
        } else if (e.touches.length === 1 && zoomScale > 1.05) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          const maxPan = (zoomScale - 1) * 180;
          panX = Math.max(-maxPan, Math.min(maxPan, startPanX + dx));
          panY = Math.max(-maxPan, Math.min(maxPan, startPanY + dy));
          applyZoomTransform(false);
        }
      },
      { passive: true }
    );

    container.addEventListener(
      'touchend',
      (e) => {
        if (isPinching && e.touches.length < 2) {
          isPinching = false;
          if (zoomScale < 1.08) resetLightboxZoom(true);
          return;
        }
        if (zoomScale <= 1.05 && e.changedTouches && e.changedTouches.length === 1) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25 && activeGallery.length > 1) {
            stepLightboxGallery(dx < 0 ? 1 : -1);
          }
        }
      },
      { passive: true }
    );
  }

  window.addEventListener('keydown', (e) => {
    const box = document.getElementById('storyboard-lightbox');
    if (!box || !box.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeStoryboardLightbox();
    else if (e.key === 'ArrowRight') stepLightboxGallery(1);
    else if (e.key === 'ArrowLeft') stepLightboxGallery(-1);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightboxTouchGestures);
  } else {
    initLightboxTouchGestures();
  }

  window.handleStoryboardBoxClick = handleStoryboardBoxClick;
  window.openLightboxWithImage = openLightboxWithImage;
  window.openLightboxWithVideo = openLightboxWithVideo;
  window.closeStoryboardLightbox = closeStoryboardLightbox;
  window.stepLightboxGallery = stepLightboxGallery;
  window.toggleLightboxZoom = toggleLightboxZoom;
  window.setLightboxZoom = function (scale) {
    zoomScale = Math.max(1, Math.min(4, scale));
    applyZoomTransform(true);
  };
  window.getLightboxZoomState = function () {
    return { scale: zoomScale, tx: panX, ty: panY, galleryLen: activeGallery.length, idx: activeGalleryIdx };
  };
})();
