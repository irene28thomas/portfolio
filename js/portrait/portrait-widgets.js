/* ==========================================================================
   SPATIAL PORTRAIT WIDGETS & SECTOR INSTRUMENTS (02 TO 08)
   Dedicated controllers for 2D Light-Table, Nivara Loupe + Arch Scrubber,
   4A-4C Commerce Modules, 12-Beat PIL-Calibrated Storyboard Loupe,
   3D Exhibition Poster Stack, Prompt-Flip Specimen Cards, Fanned Tri-Sets,
   and Brass Clipboard Dossier.
   ========================================================================== */
(function () {

  /* ========================================================================
     UNIVERSAL PRE-DECODED GPU AMBIENT BLEED CROSSFADE ENGINE
     Eliminates jitter, stutter, and flash when changing bleed backgrounds
     across Room 01, Room 02, Room 05, Room 06, Room 10, etc.
     ======================================================================== */
  var sharedDecodedImageCache = {};
  function cacheDecodedWidgetSrc(src) {
    if (!src) return null;
    if (!sharedDecodedImageCache[src]) {
      var img = new Image();
      img.src = src;
      sharedDecodedImageCache[src] = {
        img: img,
        ready: typeof img.decode === 'function' ? img.decode().catch(function () {}) : Promise.resolve()
      };
    }
    return sharedDecodedImageCache[src];
  }

  function smoothAmbientCrossfade(bgA, bgB, src, state) {
    if (!bgA || !bgB || !src) return;
    if (state.lastSrc === src) return;
    state.lastSrc = src;
    var reqId = ++state.reqId;
    if (state.raf) {
      window.cancelAnimationFrame(state.raf);
      state.raf = null;
    }
    var cached = cacheDecodedWidgetSrc(src);
    var ready = cached ? cached.ready : Promise.resolve();
    ready.then(function () {
      if (reqId !== state.reqId) return;
      state.toggle = !state.toggle;
      var inc = state.toggle ? bgB : bgA;
      var out = state.toggle ? bgA : bgB;
      inc.style.backgroundImage = "url('" + src.replace(/'/g, "\\'") + "')";
      state.raf = window.requestAnimationFrame(function () {
        state.raf = window.requestAnimationFrame(function () {
          if (reqId !== state.reqId) return;
          inc.classList.add('is-active');
          out.classList.remove('is-active');
          state.raf = null;
        });
      });
    });
  }

  var brandAmbientState = { toggle: false, lastSrc: '', reqId: 0, raf: null };
  var coverAmbientState = { toggle: false, lastSrc: '', reqId: 0, raf: null };
  var hwAmbientState = { toggle: false, lastSrc: '', reqId: 0, raf: null };
  var reelAmbientState = { toggle: false, lastSrc: '', reqId: 0, raf: null };
  var totemAmbientState = { toggle: false, lastSrc: '', reqId: 0, raf: null };

  /* ========================================================================
     SECTOR 02 // CONTINUUM MATRIX — OPTION A COLLISION-FREE CONTACT WALL
     Measures true-ratio card boxes dynamically per column so cards never
     collide, clips zero typography/faces, and wraps smoothly on drag/flick.
     ======================================================================== */
  var LIGHT_TABLE_ITEMS = [
    { title: 'The Cognitive Maze', tag: 'EXHIBITION PRINT', cat: 'print', ratioClass: 'is-poster', sectorIdx: 5, sectorLabel: 'POSTERS →', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-01.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 4-01.jpg', type: 'img' },
    { title: 'PUMA x PTC Collection', tag: 'RETAIL MONOLITH', cat: 'retail', ratioClass: 'is-tall', sectorIdx: 6, sectorLabel: 'RETAIL →', src: 'assets/optimized/promosheet_banners/PUMA x PTC New Collection.jpg', native: 'assets/real_works/promosheet_banners/PUMA x PTC New Collection.jpg', type: 'img' },
    { title: 'Barney Dale: The Cloud', tag: '9:16 CINEMA SHORT', cat: 'motion', ratioClass: 'is-tall', sectorIdx: 4, sectorLabel: 'CINEMA →', src: 'assets/optimized/Barney_Dale__The_Cloud_story_arc.mp4', poster: 'assets/optimized/Barney_Dale__The_Cloud_story_arc.jpg', native: 'assets/real_works/Barney_Dale__The_Cloud_story_arc.mp4', type: 'video' },
    { title: 'McLaren Series 3 Petal', tag: 'OMNICHANNEL 9:16', cat: 'commerce', ratioClass: 'is-tall', sectorIdx: 3, sectorLabel: 'COMMERCE →', src: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1920.jpg', native: 'assets/real_works/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1920.jpg', type: 'img' },
    { title: 'Nivara Botanical Pack', tag: 'BRAND IDENTITY', cat: 'print', ratioClass: 'is-wide', sectorIdx: 2, sectorLabel: 'BRANDING →', src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-05.jpg', native: 'assets/real_works/brand_identity/Brand Identity_NIVARA_Version Irene-05.jpg', type: 'img' },
    { title: 'CTRL+ALT Magazine', tag: 'EDITORIAL PRINT', cat: 'print', ratioClass: 'is-poster', sectorIdx: 5, sectorLabel: 'ARCHIVE →', src: 'assets/optimized/magazine_edit/CTRL+ALT_Layout.jpg', native: 'assets/real_works/magazine_edit/CTRL+ALT_Layout.jpg', type: 'img' },
    { title: 'Callaway Chrome Tour', tag: 'COMMERCIAL LAUNCH', cat: 'retail', ratioClass: 'is-tall', sectorIdx: 6, sectorLabel: 'RETAIL →', src: 'assets/optimized/promosheet_banners/Callaway 2026 Chrome Tour Golf Balls.jpg', native: 'assets/real_works/promosheet_banners/Callaway 2026 Chrome Tour Golf Balls.jpg', type: 'img' },
    { title: 'Galvin Green Kinetics', tag: 'MOTION DISPLAY', cat: 'motion', ratioClass: 'is-square', sectorIdx: 3, sectorLabel: 'REELS →', src: 'assets/optimized/Galvin_Green_New_Collection.gif', native: 'assets/optimized/Galvin_Green_New_Collection.gif', type: 'img' }
  ];

  var ltPanX = 0;
  var ltPanY = 0;
  var ltVelX = 0;
  var ltVelY = 0;
  var ltDragging = false;
  var ltSelectedIdx = 0;

  function initLightTable() {
    var viewport = document.getElementById('p-lighttable-viewport');
    var canvas = document.getElementById('p-lighttable-canvas');
    if (!viewport || !canvas) return;

    canvas.innerHTML = LIGHT_TABLE_ITEMS.map(function (item, idx) {
      var mediaHtml = item.type === 'video'
        ? '<video autoplay muted loop playsinline data-autoplay-visible="true" poster="' + item.poster + '"><source src="' + item.src + '" type="video/mp4"></video>'
        : '<img src="' + item.src + '" alt="' + item.title + '" loading="lazy" decoding="async">';
      return '<article class="p-lt-card ' + item.ratioClass + (idx === 0 ? ' is-selected' : '') + '" data-lt-idx="' + idx + '">' +
        '<div class="p-lt-media">' + mediaHtml + '</div>' +
        '<div class="p-lt-meta"><span>' + item.tag + '</span><strong>' + item.title + '</strong></div>' +
        '</article>';
    }).join('');

    var cardEls = Array.prototype.slice.call(canvas.children);
    var slots = [];
    var wrapW = 540;
    var wrapH = 720;
    var activePadX = 180;
    var activePadY = 240;

    function mod(n, m) {
      return ((n % m) + m) % m;
    }

    function computeSlots() {
      var vpW = viewport.clientWidth || 358;
      var cols = vpW >= 540 ? 3 : 2;
      var marginX = 10;
      var colGap = 12;
      var rowGap = 12;
      var cardW = Math.min(200, Math.floor((vpW - marginX * 2 - colGap * (cols - 1)) / cols));
      var colStep = cardW + colGap;
      var colY = [];
      for (var c = 0; c < cols; c++) {
        colY.push(c === 1 ? 26 : (c === 2 ? 14 : 8));
      }

      slots = [];
      var maxH = 220;
      var maxYBase = 0;
      cardEls.forEach(function (el, idx) {
        el.style.width = cardW + 'px';
        // Choose shortest column for organic balanced Option-A masonry height
        var targetCol = 0;
        for (var c = 1; c < cols; c++) {
          if (colY[c] < colY[targetCol]) targetCol = c;
        }
        var xBase = marginX + targetCol * colStep;
        var yBase = colY[targetCol];
        var h = el.offsetHeight || 220;
        if (h > maxH) maxH = h;
        if (yBase > maxYBase) maxYBase = yBase;
        colY[targetCol] += h + rowGap;
        slots[idx] = { x: xBase, y: yBase, h: h };
      });

      activePadX = cardW + marginX;
      activePadY = Math.round(maxH) + 12;
      var totalColsW = cols * colStep + marginX + 16;
      wrapW = Math.max(vpW + 16, totalColsW);
      wrapH = Math.max(Math.max.apply(Math, colY) + 12, maxYBase + activePadY + 20);
      positionCards();
    }

    function positionCards() {
      if (!slots.length) return;
      cardEls.forEach(function (el, idx) {
        var s = slots[idx];
        if (!s) return;
        var x = mod(s.x + ltPanX + activePadX, wrapW) - activePadX;
        var y = mod(s.y + ltPanY + activePadY, wrapH) - activePadY;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      });
    }

    function selectLightTableItem(idx, openModal) {
      var item = LIGHT_TABLE_ITEMS[idx];
      if (!item) return;
      ltSelectedIdx = idx;
      cardEls.forEach(function (c, i) { c.classList.toggle('is-selected', i === idx); });
      var badgeEl = document.getElementById('p-lt-badge');
      var nameEl = document.getElementById('p-lt-name');
      var jumpBtn = document.getElementById('p-lt-jump');
      var hdBtn = document.getElementById('p-lt-hd');
      if (badgeEl) badgeEl.textContent = item.tag;
      if (nameEl) nameEl.textContent = item.title;
      if (jumpBtn) {
        jumpBtn.textContent = item.sectorLabel;
        jumpBtn.onclick = function () { window.goToPortraitChapter && window.goToPortraitChapter(item.sectorIdx); };
      }
      if (hdBtn) {
        hdBtn.onclick = function () { selectLightTableItem(ltSelectedIdx, true); };
      }
      if (openModal) {
        if (item.type === 'video' && typeof window.openLightboxWithVideo === 'function') {
          window.openLightboxWithVideo(item.native, item.title, 'AFTER EFFECTS 2D ANIMATION');
        } else if (typeof window.openLightboxWithImage === 'function') {
          window.openLightboxWithImage(item.native, item.title, item.tag);
        }
      }
    }

    var lx = 0, ly = 0, movedDist = 0, downTarget = null;

    viewport.addEventListener('pointerdown', function (e) {
      ltDragging = true;
      lx = e.clientX;
      ly = e.clientY;
      movedDist = 0;
      ltVelX = 0;
      ltVelY = 0;
      downTarget = e.target.closest('.p-lt-card');
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!ltDragging) return;
      var dx = e.clientX - lx;
      var dy = e.clientY - ly;
      movedDist += Math.hypot(dx, dy);
      ltPanX += dx;
      ltPanY += dy;
      ltVelX = dx * 0.85;
      ltVelY = dy * 0.85;
      lx = e.clientX;
      ly = e.clientY;
      positionCards();
    });

    function onUp() {
      if (!ltDragging) return;
      ltDragging = false;
      if (movedDist < 9 && downTarget) {
        var picked = Number(downTarget.getAttribute('data-lt-idx'));
        var alreadySelected = picked === ltSelectedIdx;
        selectLightTableItem(picked, alreadySelected);
      }
      downTarget = null;
    }

    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);

    function tick() {
      var isChapterActive = typeof window.getActivePortraitChapter === 'function' && window.getActivePortraitChapter() === 1;
      if (isChapterActive && !ltDragging) {
        if (Math.abs(ltVelX) > 0.14 || Math.abs(ltVelY) > 0.14) {
          ltPanX += ltVelX;
          ltPanY += ltVelY;
          ltVelX *= 0.91;
          ltVelY *= 0.91;
          positionCards();
        }
      }
      window.requestAnimationFrame(tick);
    }

    window.resetLightTablePan = function () {
      ltPanX = 0;
      ltPanY = 0;
      ltVelX = 0;
      ltVelY = 0;
      computeSlots();
    };

    window.relayoutLightTable = computeSlots;

    computeSlots();
    selectLightTableItem(0, false);
    window.addEventListener('resize', computeSlots);
    window.requestAnimationFrame(tick);
  }

  /* ========================================================================
     SECTOR 03 // NIVARA BRAND MANUAL + 2X PAN LOUPE + CURVED ARCH SCRUBBER
     ======================================================================== */
  var currentManualIdx = 0;
  var manualZoomScale = 1;
  var manualPanX = 0;
  var manualPanY = 0;
  var brandAmbientToggle = false;

  function applyManualTransform(immediate) {
    var canvas = document.getElementById('p-manual-canvas');
    if (!canvas) return;
    canvas.style.transition = immediate ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1.2, 0.36, 1)';
    canvas.style.transform = 'translate3d(' + manualPanX.toFixed(1) + 'px,' + manualPanY.toFixed(1) + 'px,0) scale(' + manualZoomScale.toFixed(3) + ')';
  }

  function syncManualThumbsFade() {
    var track = document.getElementById('p-manual-thumbs');
    if (!track) return;
    var rect = track.getBoundingClientRect();
    var center = rect.left + rect.width / 2;
    var halfW = Math.max(1, rect.width / 2);
    track.querySelectorAll('.p-arch-pip').forEach(function (pip) {
      var pr = pip.getBoundingClientRect();
      var pCenter = pr.left + pr.width / 2;
      var normDist = Math.min(1, Math.abs(pCenter - center) / halfW);
      var fade = Math.max(0.24, 1 - normDist * 0.72);
      var scale = Math.max(0.84, 1 - normDist * 0.14);
      pip.style.setProperty('--pip-fade', fade.toFixed(2));
      pip.style.setProperty('--pip-scale', scale.toFixed(2));
    });
  }

  function renderManualThumbs() {
    var container = document.getElementById('p-manual-thumbs');
    var list = window.nivaraSpreads || [];
    if (!container || !list.length) return;
    container.innerHTML = list.map(function (sp, idx) {
      var code = String(sp.num).padStart(2, '0');
      return '<button type="button" class="p-arch-pip' + (idx === 0 ? ' is-active' : '') +
        '" onclick="selectPortraitSpread(' + idx + ')" aria-label="Slide ' + code + ' ' + sp.title + '">' + code + '</button>';
    }).join('');
    if (!container.dataset.fadeBound) {
      container.dataset.fadeBound = '1';
      container.addEventListener('scroll', function () {
        window.requestAnimationFrame(syncManualThumbsFade);
      }, { passive: true });
    }
    window.requestAnimationFrame(syncManualThumbsFade);
  }

  function selectPortraitSpread(idx) {
    var list = window.nivaraSpreads || [];
    if (!list.length) return;
    var prevIdx = currentManualIdx;
    var targetIdx = ((idx % list.length) + list.length) % list.length;
    currentManualIdx = targetIdx;
    var sp = list[targetIdx];

    var src = 'assets/optimized/brand_identity/' + sp.file;
    var canvasEl = document.getElementById('p-manual-canvas');
    var imgEl = document.getElementById('p-manual-img');
    var titleEl = document.getElementById('p-manual-title');
    var counterEl = document.getElementById('p-manual-counter');
    var bgA = document.getElementById('p-brand-ambient-a');
    var bgB = document.getElementById('p-brand-ambient-b');

    if (canvasEl && manualZoomScale <= 1.02 && targetIdx !== prevIdx) {
      var turnNext = targetIdx > prevIdx || (prevIdx === list.length - 1 && targetIdx === 0);
      if (prevIdx === 0 && targetIdx === list.length - 1) turnNext = false;
      canvasEl.classList.remove('is-turning-next', 'is-turning-prev');
      void canvasEl.offsetWidth;
      canvasEl.classList.add(turnNext ? 'is-turning-next' : 'is-turning-prev');
    }

    if (imgEl && typeof window.smoothImageCrossfade === 'function') {
      window.smoothImageCrossfade(imgEl, src);
    } else if (imgEl) {
      imgEl.src = src;
    }

    if (titleEl) titleEl.textContent = sp.title;
    if (counterEl) counterEl.textContent = 'SLIDE ' + String(sp.num).padStart(2, '0') + ' / ' + list.length;

    if (bgA && bgB) {
      smoothAmbientCrossfade(bgA, bgB, src, brandAmbientState);
    }

    var pips = document.querySelectorAll('#p-manual-thumbs .p-arch-pip');
    pips.forEach(function (p, i) {
      var active = i === targetIdx;
      p.classList.toggle('is-active', active);
      if (active) p.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    window.setTimeout(syncManualThumbsFade, 220);

    manualZoomScale = 1;
    manualPanX = 0;
    manualPanY = 0;
    applyManualTransform(false);
  }

  function stepPortraitManual(delta) {
    selectPortraitSpread(currentManualIdx + delta);
  }

  window.switchBrandView = function (viewKey, btn) {
    document.querySelectorAll('[data-brand-view]').forEach(function (b) {
      b.classList.toggle('is-active', b === btn || b.getAttribute('data-brand-view') === viewKey);
    });
    document.getElementById('p-brand-mode-manual')?.classList.toggle('is-active', viewKey === 'manual');
    document.getElementById('p-brand-mode-craft')?.classList.toggle('is-active', viewKey === 'craft');
  };

  window.toggleManualLoupe = function () {
    manualZoomScale = 1;
    manualPanX = 0;
    manualPanY = 0;
    var stage = document.getElementById('p-manual-stage');
    if (stage) stage.classList.remove('is-zoomed');
    applyManualTransform(false);
  };

  window.openPortraitManualLightbox = function () {
    var list = window.nivaraSpreads || [];
    var sp = list[currentManualIdx];
    if (!sp || typeof window.openLightboxWithImage !== 'function') return;
    window.openLightboxWithImage(
      'assets/real_works/brand_identity/' + sp.file,
      'NIVARA BRAND BOOK // ' + sp.title,
      'SLIDE ' + String(sp.num).padStart(2, '0') + ' OF 13'
    );
  };

  function initManualStageInteractions() {
    var stage = document.getElementById('p-manual-stage');
    if (!stage) return;
    var pinching = false;
    var pinchStartDist = 0;
    var pinchStartMidX = 0;
    var pinchStartMidY = 0;
    var swX = 0;
    var swY = 0;
    var swActive = false;

    function getTouchDist(t1, t2) {
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }

    function resetPinchZoom() {
      pinching = false;
      manualZoomScale = 1;
      manualPanX = 0;
      manualPanY = 0;
      stage.classList.remove('is-zoomed');
      applyManualTransform(false);
    }

    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        swActive = false;
        pinching = true;
        pinchStartDist = Math.max(10, getTouchDist(e.touches[0], e.touches[1]));
        pinchStartMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        pinchStartMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        stage.classList.add('is-zoomed');
      } else if (e.touches.length === 1 && !pinching) {
        swActive = true;
        swX = e.touches[0].clientX;
        swY = e.touches[0].clientY;
      }
    }, { passive: true });

    stage.addEventListener('touchmove', function (e) {
      if (pinching && e.touches.length === 2) {
        e.preventDefault();
        var dist = getTouchDist(e.touches[0], e.touches[1]);
        var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        manualZoomScale = Math.max(1, Math.min(3.2, dist / pinchStartDist));
        manualPanX = Math.max(-140, Math.min(140, midX - pinchStartMidX));
        manualPanY = Math.max(-110, Math.min(110, midY - pinchStartMidY));
        applyManualTransform(true);
      }
    }, { passive: false });

    stage.addEventListener('touchend', function (e) {
      if (pinching && e.touches.length < 2) {
        resetPinchZoom();
        return;
      }
      if (swActive && e.changedTouches.length && !pinching) {
        swActive = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - swX;
        var dy = t.clientY - swY;
        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
          stepPortraitManual(dx < 0 ? 1 : -1);
        }
      }
    }, { passive: true });

    stage.addEventListener('touchcancel', resetPinchZoom, { passive: true });

    // Mouse / desktop fallback horizontal drag
    var mDown = false, msx = 0, msy = 0;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      mDown = true;
      msx = e.clientX;
      msy = e.clientY;
    });
    stage.addEventListener('pointerup', function (e) {
      if (!mDown || e.pointerType === 'touch') return;
      mDown = false;
      var dx = e.clientX - msx;
      var dy = e.clientY - msy;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
        stepPortraitManual(dx < 0 ? 1 : -1);
      }
    });
  }

  /* ========================================================================
     ROOMS 04–06 // CONVEYOR MATRIX, 90° REELS, & UNIFIED DISPATCH BROWSER
     ======================================================================== */
  var activeDispatchKey = 'landing';
  var syncDispatchLensFn = null;

  function getDispatchDoc(key) {
    if (key === 'landing' || !window.crmEmails || !window.crmEmails[key]) {
      return {
        key: 'landing',
        title: 'eGolf Megastore // New Season Landing Page',
        heading: 'Long-Form Browser',
        url: 'egolfmegastore.ae/new-arrivals',
        src: 'assets/optimized/New_Arrivals_Landing_Page_V1.jpg',
        native: 'assets/optimized/New_Arrivals_Landing_Page_V1.jpg',
        alt: 'eGolf Megastore New Arrivals 5,286px Landing Page'
      };
    }
    var item = window.crmEmails[key];
    return {
      key: key,
      title: item.title,
      heading: item.title.split('//')[1] ? item.title.split('//')[1].trim() : item.title,
      url: 'crm-dispatch://' + key + ' · ' + (item.subject || ''),
      src: item.file,
      native: item.native || item.file,
      alt: item.title
    };
  }

  var DISPATCH_ORDER = ['landing', 'emailer1', 'emailer2', 'vessel_crm'];
  var dispatchSkeletonTimer = null;

  window.switchDispatchDoc = function (key, btn) {
    var doc = getDispatchDoc(key);
    activeDispatchKey = doc.key;

    document.querySelectorAll('[data-dispatch-doc]').forEach(function (b) {
      b.classList.toggle('is-active', b === btn || b.getAttribute('data-dispatch-doc') === doc.key);
    });

    var browser = document.getElementById('p-landing-browser');
    var urlEl = document.getElementById('p-dispatch-url');
    var titleEl = document.getElementById('p-dispatch-title');
    var imgEl = document.getElementById('p-dispatch-img');
    var mapImg = document.getElementById('p-dispatch-minimap-img');
    var scroller = document.getElementById('p-ecom-sandbox');
    var pctEl = document.getElementById('p-dispatch-pct');

    if (urlEl) urlEl.textContent = doc.url;
    if (titleEl) titleEl.textContent = doc.heading;
    if (scroller) scroller.scrollTop = 0;
    if (pctEl) pctEl.textContent = '0%';

    if (browser) browser.classList.add('is-loading');
    window.clearTimeout(dispatchSkeletonTimer);

    var minElapsed = false;
    var imgReady = false;
    function finishSkeleton() {
      if (!minElapsed || !imgReady) return;
      if (browser) browser.classList.remove('is-loading');
      if (syncDispatchLensFn) window.requestAnimationFrame(syncDispatchLensFn);
    }

    window.setTimeout(function () {
      minElapsed = true;
      finishSkeleton();
    }, 280);

    // Failsafe cap so skeleton never stays stuck
    dispatchSkeletonTimer = window.setTimeout(function () {
      imgReady = true;
      minElapsed = true;
      finishSkeleton();
    }, 1100);

    if (imgEl) {
      imgEl.onload = function () {
        imgReady = true;
        finishSkeleton();
      };
      imgEl.src = doc.src;
      imgEl.alt = doc.alt;
      if (imgEl.complete && imgEl.naturalWidth > 0) {
        imgReady = true;
        finishSkeleton();
      }
    }
    if (mapImg) {
      mapImg.src = doc.src;
    }
    if (syncDispatchLensFn) {
      window.requestAnimationFrame(syncDispatchLensFn);
    }
  };

  window.openActiveDispatchLightbox = function () {
    var doc = getDispatchDoc(activeDispatchKey);
    var modal = document.getElementById('p-crm-reader-modal');
    var img = document.getElementById('p-crm-reader-img');
    var title = document.getElementById('p-crm-reader-title');
    if (modal && img) {
      if (title) title.textContent = doc.title;
      img.src = doc.native;
      modal.classList.add('is-open');
      var scroller = modal.querySelector('.p-crm-reader-scroll');
      if (scroller) scroller.scrollTop = 0;
    } else if (typeof window.openLightboxWithImage === 'function') {
      window.openLightboxWithImage(doc.native, doc.title, 'LONG-FORM DISPATCH');
    }
  };

  function initLandingMinimap() {
    var scroller = document.getElementById('p-ecom-sandbox');
    var minimap = document.getElementById('p-landing-minimap');
    var lens = document.getElementById('p-minimap-lens');
    var pctEl = document.getElementById('p-dispatch-pct');
    if (!scroller || !minimap || !lens) return;

    var minimapImg = document.getElementById('p-dispatch-minimap-img');
    var lensPctEl = document.getElementById('p-minimap-lens-pct');
    var scrimTop = document.getElementById('p-minimap-scrim-top');
    var scrimBottom = document.getElementById('p-minimap-scrim-bottom');
    if (minimapImg) minimapImg.style.objectPosition = '50% 0%';

    var pad = 3;
    var cachedTrackH = 0;
    var cachedMaxScroll = 1;
    var cachedLensPx = 0;
    var cachedMaxTravel = 0;
    var currentProgress = 0;
    var targetProgress = 0;
    var velProgress = 0;
    var animRaf = null;
    var lastFrameTime = 0;
    var followActiveUntil = 0;
    var pointerTouching = false;
    var scrubbing = false;
    var lastPctText = '';

    function measureLensGeometry() {
      var viewH = scroller.clientHeight;
      var fullH = scroller.scrollHeight;
      cachedMaxScroll = Math.max(1, fullH - viewH);
      var ratioPct = Math.max(18, Math.min(30, (viewH / Math.max(viewH, fullH)) * 100));
      cachedTrackH = minimap.clientHeight;
      if (cachedTrackH > 20) {
        var availH = Math.max(20, cachedTrackH - pad * 2);
        var nextLensPx = Math.max(28, Math.round(availH * (ratioPct / 100)));
        cachedMaxTravel = Math.max(0, availH - nextLensPx);
        if (nextLensPx !== cachedLensPx) {
          cachedLensPx = nextLensPx;
          lens.style.top = pad + 'px';
          lens.style.height = cachedLensPx + 'px';
        }
      } else {
        cachedLensPx = 0;
        cachedMaxTravel = 0;
        lens.style.top = pad + 'px';
        lens.style.height = ratioPct.toFixed(1) + '%';
      }
    }

    function applyLensRender(progress) {
      var clamped = Math.max(0, Math.min(1, progress));
      var yPx = clamped * cachedMaxTravel;
      lens.style.transform = 'translate3d(0, ' + yPx.toFixed(2) + 'px, 0)';
      if (cachedTrackH > 20 && cachedLensPx > 0) {
        var topRatio = Math.max(0, Math.min(1, (pad + yPx) / cachedTrackH));
        var botRatio = Math.max(0, Math.min(1, (cachedTrackH - (pad + yPx + cachedLensPx)) / cachedTrackH));
        if (scrimTop) scrimTop.style.transform = 'translate3d(0, 0, 0) scaleY(' + topRatio.toFixed(4) + ')';
        if (scrimBottom) scrimBottom.style.transform = 'translate3d(0, 0, 0) scaleY(' + botRatio.toFixed(4) + ')';
      }
      var pctText = Math.round(clamped * 100) + '%';
      if (pctText !== lastPctText) {
        lastPctText = pctText;
        if (lensPctEl) lensPctEl.textContent = pctText;
        if (pctEl) pctEl.textContent = pctText;
      }
    }

    function stepLensLoop(now) {
      animRaf = null;
      if (scrubbing) return;
      if (cachedTrackH <= 20 || cachedMaxScroll <= 1 || cachedMaxTravel <= 0) {
        measureLensGeometry();
      }
      targetProgress = Math.max(0, Math.min(1, scroller.scrollTop / cachedMaxScroll));

      if (!lastFrameTime) lastFrameTime = now;
      var dtSec = Math.min(0.032, Math.max(0.004, (now - lastFrameTime) / 1000));
      lastFrameTime = now;

      // Critically damped spring (~24 rad/s) keeps touch flings & wheel ticks glass-smooth without jumps
      var omega = 24;
      var h = dtSec * 0.5;
      for (var s = 0; s < 2; s++) {
        var accel = omega * omega * (targetProgress - currentProgress) - 2 * omega * velProgress;
        velProgress += accel * h;
        currentProgress += velProgress * h;
      }
      currentProgress = Math.max(0, Math.min(1, currentProgress));

      var distPx = cachedMaxTravel > 0
        ? Math.abs(targetProgress - currentProgress) * cachedMaxTravel
        : Math.abs(targetProgress - currentProgress) * 200;
      var velPx = cachedMaxTravel > 0
        ? Math.abs(velProgress) * cachedMaxTravel
        : Math.abs(velProgress) * 200;

      if (distPx < 0.25 && velPx < 1.5) {
        currentProgress = targetProgress;
        velProgress = 0;
        applyLensRender(currentProgress);
        if (pointerTouching || now < followActiveUntil) {
          animRaf = window.requestAnimationFrame(stepLensLoop);
        } else {
          lastFrameTime = 0;
        }
        return;
      }

      applyLensRender(currentProgress);
      animRaf = window.requestAnimationFrame(stepLensLoop);
    }

    function ensureLensLoop(holdMs) {
      var until = performance.now() + (holdMs || 550);
      if (until > followActiveUntil) followActiveUntil = until;
      if (!animRaf && !scrubbing) {
        lastFrameTime = 0;
        animRaf = window.requestAnimationFrame(stepLensLoop);
      }
    }

    function syncLensNow() {
      var prevMax = cachedMaxScroll;
      var prevTrack = cachedTrackH;
      measureLensGeometry();
      if (Math.abs(cachedMaxScroll - prevMax) > 2 || Math.abs(cachedTrackH - prevTrack) > 2 || !animRaf) {
        targetProgress = Math.max(0, Math.min(1, scroller.scrollTop / cachedMaxScroll));
        currentProgress = targetProgress;
        velProgress = 0;
        if (animRaf) {
          window.cancelAnimationFrame(animRaf);
          animRaf = null;
        }
        lastFrameTime = 0;
        applyLensRender(currentProgress);
      }
    }

    function handleMainCrmScroll() {
      if (scrubbing) return;
      ensureLensLoop(650);
    }

    syncDispatchLensFn = function () {
      measureLensGeometry();
      targetProgress = Math.max(0, Math.min(1, scroller.scrollTop / cachedMaxScroll));
      currentProgress = targetProgress;
      velProgress = 0;
      if (animRaf) {
        window.cancelAnimationFrame(animRaf);
        animRaf = null;
      }
      lastFrameTime = 0;
      applyLensRender(currentProgress);
    };

    scroller.addEventListener('scroll', handleMainCrmScroll, { passive: true });
    scroller.addEventListener('wheel', function () { ensureLensLoop(650); }, { passive: true });
    scroller.addEventListener('touchstart', function () {
      pointerTouching = true;
      ensureLensLoop(900);
    }, { passive: true });
    scroller.addEventListener('touchmove', function () { ensureLensLoop(900); }, { passive: true });
    scroller.addEventListener('touchend', function () {
      pointerTouching = false;
      ensureLensLoop(850);
    }, { passive: true });
    scroller.addEventListener('touchcancel', function () {
      pointerTouching = false;
    }, { passive: true });
    window.addEventListener('resize', syncLensNow, { passive: true });

    function scrubAtClientY(cy) {
      var rect = minimap.getBoundingClientRect();
      var lensH = cachedLensPx || lens.offsetHeight || Math.round((rect.height - pad * 2) * 0.22);
      var travel = Math.max(1, rect.height - pad * 2 - lensH);
      var relY = cy - rect.top - pad - lensH * 0.5;
      var ratio = Math.max(0, Math.min(1, relY / travel));
      if (cachedTrackH <= 20 || cachedMaxScroll <= 1) measureLensGeometry();
      scroller.scrollTop = ratio * cachedMaxScroll;
      targetProgress = ratio;
      currentProgress = ratio;
      velProgress = 0;
      if (animRaf) {
        window.cancelAnimationFrame(animRaf);
        animRaf = null;
      }
      lastFrameTime = 0;
      applyLensRender(currentProgress);
    }

    minimap.addEventListener('pointerdown', function (e) { scrubbing = true; scrubAtClientY(e.clientY); });
    minimap.addEventListener('pointermove', function (e) { if (scrubbing) scrubAtClientY(e.clientY); });
    window.addEventListener('pointerup', function () { scrubbing = false; });

    var mainImg = document.getElementById('p-dispatch-img');
    if (mainImg) mainImg.addEventListener('load', syncLensNow);
    if (typeof ResizeObserver === 'function') {
      var lensRo = new ResizeObserver(function () {
        syncLensNow();
      });
      lensRo.observe(minimap);
      lensRo.observe(scroller);
      if (mainImg) lensRo.observe(mainImg);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncLensNow);
    }
    syncLensNow();

    // Req #4: Horizontal swipe / trackpad wheel across CRM / Landing browser cycles dispatches
    var browser = document.getElementById('p-landing-browser');
    if (browser) {
      var swX = 0;
      var swY = 0;
      var activeSwipe = false;
      var crmSwitchUntil = 0;

      function triggerCrmStep(dir) {
        var now = Date.now();
        if (now < crmSwitchUntil) return;
        crmSwitchUntil = now + 520;
        var idx = DISPATCH_ORDER.indexOf(activeDispatchKey);
        if (idx < 0) idx = 0;
        var nextIdx = (idx + dir + DISPATCH_ORDER.length) % DISPATCH_ORDER.length;
        window.switchDispatchDoc(DISPATCH_ORDER[nextIdx]);
      }

      browser.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        swX = e.clientX;
        swY = e.clientY;
        activeSwipe = true;
      }, { passive: true });
      browser.addEventListener('pointerup', function (e) {
        if (!activeSwipe) return;
        activeSwipe = false;
        var dx = e.clientX - swX;
        var dy = e.clientY - swY;
        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          triggerCrmStep(dx < 0 ? 1 : -1);
        }
      }, { passive: true });
      browser.addEventListener('pointercancel', function () {
        activeSwipe = false;
      }, { passive: true });

      browser.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length !== 1) return;
        swX = e.touches[0].clientX;
        swY = e.touches[0].clientY;
        activeSwipe = true;
      }, { passive: true });
      browser.addEventListener('touchend', function (e) {
        if (!activeSwipe || !e.changedTouches || e.changedTouches.length !== 1) return;
        activeSwipe = false;
        var dx = e.changedTouches[0].clientX - swX;
        var dy = e.changedTouches[0].clientY - swY;
        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          triggerCrmStep(dx < 0 ? 1 : -1);
        }
      }, { passive: true });

      browser.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) > 26 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.25) {
          triggerCrmStep(e.deltaX > 0 ? 1 : -1);
        }
      }, { passive: true });
    }
  }

  // Room 01: Exhibition Poster Cycling Artwork Window (P4)
  var COVER_WINDOW_ITEMS = [
    {
      tag: '02 · NIVARA · 2:1',
      shape: 'is-ratio-2x1',
      room: 1,
      src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-01.jpg',
      alt: 'NIVARA Brand Identity System'
    },
    {
      tag: '03 · TAYLORMADE · 1:1',
      shape: 'is-ratio-1x1',
      room: 2,
      src: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1080x1080.jpg',
      alt: 'TaylorMade Hi-Toe 5 Wedges'
    },
    {
      tag: '10 · MONOLITH · 1:2',
      shape: 'is-ratio-1x2',
      room: 9,
      src: 'assets/optimized/promosheet_banners/PUMA x PTC New Collection.jpg',
      alt: 'PUMA Palm Tree Crew Collection Monolith'
    },
    {
      tag: '05 · CALLAWAY · 3:2',
      shape: 'is-ratio-3x2',
      room: 4,
      src: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg',
      alt: 'Callaway Quantum Series Launch'
    },
    {
      tag: '11 · TRI-SETS · 4:3',
      shape: 'is-ratio-4x3',
      room: 10,
      src: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens Landscape.jpg',
      alt: 'G/FORE Exhibition Print Triptych'
    },
    {
      tag: '04 · VESSEL · 2:1',
      shape: 'is-ratio-2x1',
      room: 3,
      src: 'assets/optimized/new_additions/Vessel New Collection Golf Bags Slider App 900x600.jpg',
      alt: 'Vessel Driven Collection Store Banner'
    },
    {
      tag: '10 · AI LAB · 1:1',
      shape: 'is-ratio-1x1',
      room: 9,
      src: 'assets/optimized/new_additions/689352046_18580395709020262_5220540874800235796_n.jpg',
      alt: 'Hugo Boss Architectural AI Concept'
    }
  ];

  var COVER_SHAPES = [
    'is-ratio-2x1', 'is-ratio-1x1', 'is-ratio-1x2', 'is-ratio-3x2', 'is-ratio-4x3',
    'is-shape-land', 'is-shape-square', 'is-shape-tall', 'is-shape-cinema'
  ];

  function initCoverGuideCycling() {
    var guide = document.getElementById('p-cover-guide');
    if (!guide) return;
    var thumbs = Array.prototype.slice.call(guide.querySelectorAll('.p-guide-thumb'));
    if (!thumbs.length) return;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    var cursor = 0;
    window.setInterval(function () {
      var hero = document.getElementById('hero');
      if (!hero || !hero.classList.contains('is-active')) return;
      var box = thumbs[cursor % thumbs.length];
      var imgs = box ? box.querySelectorAll('.p-guide-thumb-img') : [];
      if (imgs.length >= 2) {
        var firstActive = imgs[0].classList.contains('is-active');
        imgs[0].classList.toggle('is-active', !firstActive);
        imgs[1].classList.toggle('is-active', firstActive);
      }
      cursor += 1;
    }, 1100);
  }

  var coverTextMeasureCtx = null;

  function getCoverMeasureCtx() {
    if (!coverTextMeasureCtx) {
      var cvs = document.createElement('canvas');
      coverTextMeasureCtx = cvs.getContext('2d');
    }
    return coverTextMeasureCtx;
  }

  function clampVal(minVal, prefVal, maxVal) {
    return Math.max(minVal, Math.min(maxVal, prefVal));
  }

  function getCoverTargetWindowSize(shapeCls) {
    var vw = Math.max(320, window.innerWidth || 390) / 100;
    if (shapeCls === 'is-ratio-1x1' || shapeCls === 'is-shape-square') {
      return { w: clampVal(132, 36 * vw, 160), h: clampVal(132, 36 * vw, 160) };
    }
    if (shapeCls === 'is-ratio-1x2' || shapeCls === 'is-shape-tall') {
      return { w: clampVal(102, 28 * vw, 122), h: clampVal(162, 44 * vw, 194) };
    }
    if (shapeCls === 'is-ratio-3x2' || shapeCls === 'is-shape-land') {
      return { w: clampVal(152, 41.5 * vw, 186), h: clampVal(101, 27.6 * vw, 124) };
    }
    if (shapeCls === 'is-ratio-4x3') {
      return { w: clampVal(144, 39.5 * vw, 174), h: clampVal(108, 29.6 * vw, 130) };
    }
    return { w: clampVal(160, 44 * vw, 198), h: clampVal(80, 22 * vw, 99) };
  }

  function layoutCoverEditorialFlow(shapeCls) {
    var flow = document.getElementById('p-cover-editorial-flow');
    var stack = document.getElementById('p-cover-headline-stack');
    var winBtn = document.getElementById('p-cover-window');
    var row2 = document.getElementById('p-cover-kinetic-row');
    var row3 = stack ? stack.querySelector('.p-cover-line.is-commerce-row') : null;
    var bioWrap = document.getElementById('p-cover-bio-wrap');
    var bioLinesEl = document.getElementById('p-cover-bio-lines');
    if (!flow || !winBtn || !bioWrap || !bioLinesEl) return;

    var flowW = flow.clientWidth || Math.max(296, (window.innerWidth || 390) - 36);
    var winSize = getCoverTargetWindowSize(shapeCls);
    var winTop = row2 ? Math.max(32, row2.offsetTop) : 40;
    winBtn.style.setProperty('--win-top', winTop + 'px');

    var availLeftW = Math.max(112, flowW - winSize.w - 14);
    if (row2) {
      var r2Natural = row2.scrollWidth || 150;
      var s2 = Math.min(1, availLeftW / Math.max(1, r2Natural));
      var extra2 = Math.max(0, availLeftW - r2Natural * s2);
      var x2 = shapeCls === 'is-ratio-1x2' ? Math.min(10, extra2 * 0.14) : (shapeCls === 'is-ratio-1x1' ? Math.min(6, extra2 * 0.1) : 0);
      var y2 = shapeCls === 'is-ratio-1x2' ? -1 : 0;
      row2.style.setProperty('--row2-scale', s2.toFixed(4));
      row2.style.setProperty('--row2-x', x2.toFixed(1) + 'px');
      row2.style.setProperty('--row2-y', y2.toFixed(1) + 'px');
    }
    if (row3) {
      var r3Natural = row3.scrollWidth || 165;
      var s3 = Math.min(1, availLeftW / Math.max(1, r3Natural));
      var extra3 = Math.max(0, availLeftW - r3Natural * s3);
      var x3 = shapeCls === 'is-ratio-1x2' ? Math.min(18, extra3 * 0.25) : (shapeCls === 'is-ratio-1x1' ? Math.min(10, extra3 * 0.16) : Math.min(4, extra3 * 0.08));
      var y3 = shapeCls === 'is-ratio-2x1' ? -1 : 0;
      row3.style.setProperty('--row3-scale', s3.toFixed(4));
      row3.style.setProperty('--row3-x', x3.toFixed(1) + 'px');
      row3.style.setProperty('--row3-y', y3.toFixed(1) + 'px');
    }

    var text = (bioWrap.getAttribute('data-bio-text') || '').trim();
    if (!text) return;

    var ctx = getCoverMeasureCtx();
    var vw = Math.max(320, window.innerWidth || 390);
    var sampleEl = bioLinesEl.querySelector('.p-cover-bio-line');
    var cs = sampleEl ? window.getComputedStyle(sampleEl) : window.getComputedStyle(bioLinesEl);
    var fontSizePx = parseFloat(cs.fontSize) || clampVal(11.5, vw * 0.031, 13);
    var fontWeight = (cs.fontWeight && cs.fontWeight !== '400') ? cs.fontWeight : '450';
    var fontFamily = (cs.fontFamily && cs.fontFamily.length > 2) ? cs.fontFamily : '"Plus Jakarta Sans", sans-serif';
    var lineH = parseFloat(cs.lineHeight) || (fontSizePx * 1.44);
    var lineStep = lineH + 2;

    if (ctx) {
      ctx.font = fontWeight + ' ' + fontSizePx.toFixed(2) + 'px ' + fontFamily;
    }

    function measureStr(str) {
      if (!ctx) return str.length * fontSizePx * 0.52;
      return ctx.measureText(str).width;
    }

    var bioTopRel = bioWrap.offsetTop || ((row3 ? (row3.offsetTop + row3.offsetHeight) : 112) + 8);
    var winBottom = winTop + winSize.h;
    var words = text.split(/\s+/);
    var wrappedLines = [];
    var wordCursor = 0;
    var lineIdx = 0;

    while (wordCursor < words.length && lineIdx < 24) {
      var lineTop = bioTopRel + lineIdx * lineStep;
      var lineBottom = lineTop + lineH;
      var overlapsWin = (lineBottom > winTop - 4) && (lineTop < winBottom + 8);
      var maxLineW = overlapsWin ? Math.max(106, flowW - winSize.w - 14) : flowW;

      var curLine = words[wordCursor];
      wordCursor += 1;
      while (wordCursor < words.length) {
        var candidate = curLine + ' ' + words[wordCursor];
        if (measureStr(candidate) <= maxLineW - 2) {
          curLine = candidate;
          wordCursor += 1;
        } else {
          break;
        }
      }
      wrappedLines.push({
        text: curLine,
        availW: Math.round(maxLineW),
        overlaps: overlapsWin
      });
      lineIdx += 1;
    }

    var prevEls = Array.prototype.slice.call(bioLinesEl.querySelectorAll('.p-cover-bio-line'));
    var prevInfo = prevEls.map(function (el) {
      return {
        text: el.textContent || '',
        overlaps: el.getAttribute('data-overlaps-win') === 'true'
      };
    });

    while (bioLinesEl.children.length < wrappedLines.length) {
      var span = document.createElement('span');
      span.className = 'p-cover-bio-line';
      bioLinesEl.appendChild(span);
    }
    while (bioLinesEl.children.length > wrappedLines.length) {
      bioLinesEl.removeChild(bioLinesEl.lastElementChild);
    }

    var lineEls = Array.prototype.slice.call(bioLinesEl.children);
    lineEls.forEach(function (el, i) {
      var spec = wrappedLines[i];
      var wasDifferent = !prevInfo[i] || prevInfo[i].text !== spec.text || prevInfo[i].overlaps !== spec.overlaps;
      el.setAttribute('data-avail-width', String(spec.availW));
      el.setAttribute('data-overlaps-win', spec.overlaps ? 'true' : 'false');
      el.style.transitionDelay = (i * 16) + 'ms';
      if (wasDifferent && prevInfo.length > 0) {
        el.style.transition = 'none';
        el.style.setProperty('--bio-dx', (prevInfo[i] && prevInfo[i].overlaps !== spec.overlaps ? (spec.overlaps ? 8 : -8) : 4) + 'px');
        el.style.opacity = '0.72';
      }
      el.textContent = spec.text;
    });

    window.requestAnimationFrame(function () {
      lineEls.forEach(function (el) {
        el.style.transition = '';
        el.style.setProperty('--bio-dx', '0px');
        el.style.opacity = '1';
      });
    });

    var contentBottom = bioTopRel + wrappedLines.length * lineStep;
    flow.style.setProperty('--flow-min-h', Math.ceil(Math.max(winBottom + 6, contentBottom)) + 'px');
  }

  function initCoverWindow() {
    var posterEl = document.getElementById('p-cover-poster');
    var winBtn = document.getElementById('p-cover-window');
    var imgA = document.getElementById('p-cover-win-a');
    var imgB = document.getElementById('p-cover-win-b');
    var bgA = document.getElementById('p-cover-bg-a');
    var bgB = document.getElementById('p-cover-bg-b');
    var tagEl = document.getElementById('p-cover-window-tag');
    if (!winBtn || !imgA || !imgB) return;

    // Preload all cover window & ambient images so shape swaps never flash unloaded frames
    COVER_WINDOW_ITEMS.forEach(function (item) {
      if (item && item.src) {
        var pre = new Image();
        pre.src = item.src;
        if (typeof pre.decode === 'function') pre.decode().catch(function () {});
      }
    });

    var curIdx = 0;
    var usingA = true;
    var usingBgA = true;
    var activeShapeCls = COVER_WINDOW_ITEMS[0].shape || 'is-ratio-2x1';
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function syncCoverAmbient(src, crossfade) {
      if (!bgA || !bgB || !src) return;
      var cssUrl = "url('" + src.replace(/'/g, "\\'") + "')";
      if (!crossfade) {
        bgA.style.backgroundImage = cssUrl;
        bgA.classList.add('is-active');
        bgB.classList.remove('is-active');
        coverAmbientState.toggle = false;
        coverAmbientState.lastSrc = src;
        return;
      }
      smoothAmbientCrossfade(bgA, bgB, src, coverAmbientState);
    }

    function applyFrame(item, crossfadeAmbient) {
      var shapeCls = item.shape || 'is-ratio-2x1';
      activeShapeCls = shapeCls;
      if (tagEl) tagEl.textContent = item.tag;
      COVER_SHAPES.forEach(function (cls) {
        winBtn.classList.remove(cls);
        if (posterEl) posterEl.classList.remove(cls);
      });
      winBtn.classList.add(shapeCls);
      if (posterEl) posterEl.classList.add(shapeCls);
      layoutCoverEditorialFlow(shapeCls);
      syncCoverAmbient(item.src, crossfadeAmbient);
    }

    applyFrame(COVER_WINDOW_ITEMS[0], false);
    initCoverGuideCycling();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        layoutCoverEditorialFlow(activeShapeCls);
      });
    }

    var resizeRaf = null;
    window.addEventListener('resize', function () {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(function () {
        layoutCoverEditorialFlow(activeShapeCls);
      });
    }, { passive: true });

    winBtn.addEventListener('click', function () {
      var item = COVER_WINDOW_ITEMS[curIdx] || COVER_WINDOW_ITEMS[0];
      if (typeof window.goToPortraitChapter === 'function') {
        window.goToPortraitChapter(item.room);
      }
    });

    if (reducedMotion) return;

    window.setInterval(function () {
      var hero = document.getElementById('hero');
      var splash = document.getElementById('p-splash');
      if (!hero || !hero.classList.contains('is-active')) return;
      if (splash && !splash.classList.contains('is-done')) return;
      curIdx = (curIdx + 1) % COVER_WINDOW_ITEMS.length;
      var nextItem = COVER_WINDOW_ITEMS[curIdx];
      var incoming = usingA ? imgB : imgA;
      var outgoing = usingA ? imgA : imgB;
      usingA = !usingA;

      incoming.src = nextItem.src;
      incoming.alt = nextItem.alt;
      window.requestAnimationFrame(function () {
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');
        applyFrame(nextItem, true);
      });
    }, 3400);
  }

  // Room 04: Responsive Spec Sheet (6 Brands × 3 Breakpoints) + Room 05 Hardware Trilogy
  var activeSpecBrandIdx = 0;
  var convAmbientToggle = false;
  var activeHardwareIdx = 0;
  var HARDWARE_ITEMS = [
    {
      kicker: '01 // CALLAWAY · QUANTUM SUITE',
      title: 'Quantum Triple-Diamond Driver Suite',
      sub: 'AI Smart Face · 360° Forged Carbon Chassis Launch',
      src: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg',
      native: 'assets/real_works/Callaway_Quantum_Series_900x600.jpg',
      face: 'Tri-Force Ti',
      chassis: '360° Carbon',
      profile: 'Low-Spin Tour',
      accent: '#e07a5f'
    },
    {
      kicker: '02 // TAYLORMADE · QI4D SERIES',
      title: 'TaylorMade Qi4D Carbonwood Series',
      sub: '60X Carbon Twist Face · High-MOI Inertia Engineering',
      src: 'assets/optimized/TaylorMade_Qi4D_Series_900x600.jpg',
      native: 'assets/real_works/TaylorMade_Qi4D_Series_900x600.jpg',
      face: '60X Carbon',
      chassis: 'Infinity Crown',
      profile: 'High MOI 10K',
      accent: '#d4af37'
    },
    {
      kicker: '03 // PXG · GEN8 IRONS',
      title: 'PXG GEN8 Dual-Perimeter Forged Irons',
      sub: '5X Forged 8620 Body · Industrial Tungsten Weighting',
      src: 'assets/optimized/PXG_GEN8_Irons_900x600.jpg',
      native: 'assets/real_works/PXG_GEN8_Irons_900x600.jpg',
      face: 'HT1770 Maraging',
      chassis: '5X Forged 8620',
      profile: 'Players Distance',
      accent: '#9fb4cc'
    }
  ];
  var hwAmbientToggle = false;

  var SPEC_BRAND_NAMES = {
    adidas: 'ADIDAS',
    jlindeberg: 'J.LINDEBERG',
    vessel: 'VESSEL',
    nicklaus: 'NICKLAUS',
    palms: 'TM PALMS',
    sailors: 'TM SAILORS'
  };

  window.switchConveyorView = function () {};

  window.selectHardwareCard = function (idx) {
    var list = document.querySelectorAll('#p-hw-trilogy-stage .p-hw-trilogy-card');
    if (!HARDWARE_ITEMS.length) return;
    activeHardwareIdx = ((idx % HARDWARE_ITEMS.length) + HARDWARE_ITEMS.length) % HARDWARE_ITEMS.length;
    var item = HARDWARE_ITEMS[activeHardwareIdx];

    list.forEach(function (card, i) {
      card.classList.toggle('is-active', i === activeHardwareIdx);
    });

    var flagship = document.getElementById('p-hw-flagship-card');
    if (flagship && item.accent) {
      flagship.style.setProperty('--hw-accent', item.accent);
    }

    var kickerEl = document.getElementById('p-hw-active-kicker');
    var imgEl = document.getElementById('p-hw-active-img');
    var titleEl = document.getElementById('p-hw-active-title');
    var subEl = document.getElementById('p-hw-active-sub');
    var faceEl = document.getElementById('p-hw-spec-face');
    var chassisEl = document.getElementById('p-hw-spec-chassis');
    var profileEl = document.getElementById('p-hw-spec-profile');

    if (kickerEl) kickerEl.textContent = item.kicker;
    if (imgEl) {
      imgEl.src = item.src;
      imgEl.alt = item.title;
    }
    if (titleEl) titleEl.textContent = item.title;
    if (subEl) subEl.textContent = item.sub;
    if (faceEl) faceEl.textContent = item.face;
    if (chassisEl) chassisEl.textContent = item.chassis;
    if (profileEl) profileEl.textContent = item.profile;

    var bgA = document.getElementById('p-hw-bg-a');
    var bgB = document.getElementById('p-hw-bg-b');
    if (bgA && bgB && item.src) {
      smoothAmbientCrossfade(bgA, bgB, item.src, hwAmbientState);
    }
  };

  window.openActiveHardwareLightbox = function () {
    var item = HARDWARE_ITEMS[activeHardwareIdx] || HARDWARE_ITEMS[0];
    if (item && typeof window.openLightboxWithImage === 'function') {
      window.openLightboxWithImage(item.native || item.src, item.title, item.kicker);
    }
  };

  window.openPortraitConveyorItem = function (brandKey, ratioKey) {
    var list = window.sliderCampaigns || {};
    var keys = window.sliderBrandKeys || ['adidas', 'jlindeberg', 'vessel', 'nicklaus', 'palms', 'sailors'];
    var resolvedBrand = brandKey || keys[activeSpecBrandIdx] || 'adidas';
    var item = list[resolvedBrand];
    if (!item || typeof window.openLightboxWithImage !== 'function') return;
    var rKey = ratioKey === 'web' ? 'desktop' : (ratioKey || 'desktop');
    var nativeKey = rKey + '_native';
    window.openLightboxWithImage(item[nativeKey] || item[rKey], item.title, rKey.toUpperCase() + ' STOREFRONT DEPLOYMENT');
  };

  var convPreloadPool = {};
  var convAutoTimer = null;
  var convResumeTimer = null;
  var convCleanTimer = null;
  var convCrossfadeRaf = null;
  var convUserPausedUntil = 0;

  function preloadConveyorBrandAssets() {
    var list = window.sliderCampaigns || {};
    var keys = window.sliderBrandKeys || ['adidas', 'jlindeberg', 'vessel', 'nicklaus', 'palms', 'sailors'];
    keys.forEach(function (k) {
      var d = list[k];
      if (!d) return;
      [d.desktop, d.app, d.mobile].forEach(function (src) {
        if (src && !convPreloadPool[src]) {
          var pre = new Image();
          pre.src = src;
          if (typeof pre.decode === 'function') pre.decode().catch(function () {});
          convPreloadPool[src] = pre;
        }
      });
    });
  }

  function isConveyorRoomActive() {
    var sec = document.getElementById('ecommerce-conveyor');
    if (!sec || !sec.classList.contains('is-active')) return false;
    if (document.hidden) return false;
    if (document.body.classList.contains('is-atlas-open') || document.body.classList.contains('has-lightbox-open')) return false;
    return true;
  }

  function setConveyorPauseUi(paused) {
    var sec = document.getElementById('ecommerce-conveyor');
    var grid = document.getElementById('p-spec-campaign-grid');
    if (sec) sec.setAttribute('data-autocycle', paused ? 'paused' : 'active');
    if (grid) grid.classList.toggle('is-user-paused', paused);
  }

  function scheduleConveyorAutoTick(delayMs) {
    window.clearTimeout(convAutoTimer);
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    convAutoTimer = window.setTimeout(function () {
      if (isConveyorRoomActive() && Date.now() >= convUserPausedUntil) {
        setConveyorPauseUi(false);
        renderSpecSheetBrand(activeSpecBrandIdx + 1, true);
      }
      scheduleConveyorAutoTick(4200);
    }, delayMs || 4200);
  }

  function noteConveyorInteraction() {
    convUserPausedUntil = Date.now() + 6500;
    setConveyorPauseUi(true);
    window.clearTimeout(convAutoTimer);
    window.clearTimeout(convResumeTimer);
    convResumeTimer = window.setTimeout(function () {
      if (Date.now() >= convUserPausedUntil) {
        setConveyorPauseUi(false);
        if (isConveyorRoomActive()) {
          renderSpecSheetBrand(activeSpecBrandIdx + 1, true);
        }
        scheduleConveyorAutoTick(4200);
      }
    }, 6500);
  }

  function ensurePlateGhost(plate, mainImg) {
    if (!plate) return null;
    var ghost = plate.querySelector('.p-spec-img-ghost');
    if (!ghost) {
      ghost = document.createElement('img');
      ghost.className = 'p-spec-img-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.alt = '';
      ghost.decoding = 'async';
      if (mainImg && mainImg.src) ghost.src = mainImg.getAttribute('src') || mainImg.src;
      plate.appendChild(ghost);
    }
    return ghost;
  }

  function renderSpecSheetBrand(indexOrKey, animateSlide) {
    var list = window.sliderCampaigns || {};
    var keys = window.sliderBrandKeys || ['adidas', 'jlindeberg', 'vessel', 'nicklaus', 'palms', 'sailors'];
    if (!keys.length) return;

    var idx = typeof indexOrKey === 'number'
      ? indexOrKey
      : keys.indexOf(indexOrKey);
    if (idx < 0) idx = 0;
    activeSpecBrandIdx = ((idx % keys.length) + keys.length) % keys.length;

    var brandKey = keys[activeSpecBrandIdx];
    var data = list[brandKey];
    if (!data) return;

    var counterEl = document.getElementById('p-spec-counter');
    var brandEl = document.getElementById('p-spec-brand');
    var subEl = document.getElementById('p-spec-sub');
    var teleSyncEl = document.getElementById('p-spec-tele-sync');
    var teleDeployEl = document.getElementById('p-spec-tele-deploy');
    if (counterEl) counterEl.textContent = String(activeSpecBrandIdx + 1).padStart(2, '0') + ' / ' + String(keys.length).padStart(2, '0');
    if (brandEl) brandEl.textContent = SPEC_BRAND_NAMES[brandKey] || brandKey.toUpperCase();
    if (subEl) {
      var parts = (data.title || '').split(':');
      subEl.textContent = parts.length > 1 ? parts[1].trim() : data.title;
    }
    if (teleSyncEl) teleSyncEl.textContent = (SPEC_BRAND_NAMES[brandKey] || brandKey.toUpperCase()) + ' · 1920 / 900 / 640';
    if (teleDeployEl) teleDeployEl.textContent = 'TAP TILE TO SWITCH';

    var bgA = document.getElementById('p-conv-bg-a');
    var bgB = document.getElementById('p-conv-bg-b');
    var bgSrc = data.app || data.desktop;
    if (bgA && bgB && bgSrc) {
      convAmbientToggle = !convAmbientToggle;
      var inc = convAmbientToggle ? bgB : bgA;
      var out = convAmbientToggle ? bgA : bgB;
      inc.style.backgroundImage = "url('" + bgSrc.replace(/'/g, "\\'") + "')";
      window.requestAnimationFrame(function () {
        inc.classList.add('is-active');
        out.classList.remove('is-active');
      });
    }

    document.querySelectorAll('#p-spec-brand-tabs [data-spec-brand], #p-spec-campaign-grid [data-spec-brand]').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-spec-brand') === brandKey);
    });

    var plateSpecs = [
      { plateId: 'p-spec-plate-web', imgId: 'p-spec-img-web', src: data.desktop },
      { plateId: 'p-spec-plate-app', imgId: 'p-spec-img-app', src: data.app },
      { plateId: 'p-spec-plate-mobile', imgId: 'p-spec-img-mobile', src: data.mobile }
    ];

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (convCrossfadeRaf) window.cancelAnimationFrame(convCrossfadeRaf);
    window.clearTimeout(convCleanTimer);

    var prepared = [];
    plateSpecs.forEach(function (spec) {
      var plate = document.getElementById(spec.plateId);
      var img = document.getElementById(spec.imgId);
      var ghost = ensurePlateGhost(plate, img);
      var prevSrc = img ? (img.getAttribute('src') || '') : '';
      if (plate) plate.classList.remove('is-entering');

      if (ghost && animateSlide && !reducedMotion && prevSrc && spec.src && prevSrc !== spec.src) {
        ghost.src = prevSrc;
        ghost.classList.remove('is-fading-out');
        ghost.classList.add('is-ghost-visible');
      }
      if (img && spec.src) {
        img.src = spec.src;
        img.alt = data.title + ' (' + spec.plateId.replace('p-spec-plate-', '').toUpperCase() + ')';
      }
      prepared.push({ plate: plate, ghost: ghost });
    });

    if (animateSlide && !reducedMotion) {
      convCrossfadeRaf = window.requestAnimationFrame(function () {
        prepared.forEach(function (entry) {
          if (entry.ghost) {
            entry.ghost.classList.remove('is-ghost-visible');
            entry.ghost.classList.add('is-fading-out');
          }
          if (entry.plate) {
            entry.plate.classList.add('is-entering');
          }
        });
        convCleanTimer = window.setTimeout(function () {
          prepared.forEach(function (entry) {
            if (entry.plate) entry.plate.classList.remove('is-entering');
            if (entry.ghost) entry.ghost.classList.remove('is-fading-out', 'is-ghost-visible');
          });
        }, 380);
      });
    }
  }

  window.selectConveyorBrand = function (indexOrKey) {
    noteConveyorInteraction();
    renderSpecSheetBrand(indexOrKey, true);
  };

  window.stepConveyorBrand = function (delta) {
    noteConveyorInteraction();
    renderSpecSheetBrand(activeSpecBrandIdx + (delta || 1), true);
  };

  function initConveyorLanes() {
    var sheet = document.getElementById('p-spec-sheet');
    if (sheet) {
      var list = window.sliderCampaigns || {};
      document.querySelectorAll('#p-spec-campaign-grid [data-spec-brand]').forEach(function (card) {
        var bKey = card.getAttribute('data-spec-brand');
        var item = list[bKey];
        var img = card.querySelector('img');
        if (item && img && (item.app || item.desktop)) {
          img.src = item.app || item.desktop;
        }
      });

      preloadConveyorBrandAssets();
      renderSpecSheetBrand(0, false);
      setConveyorPauseUi(false);
      scheduleConveyorAutoTick(4200);

      sheet.addEventListener('pointerdown', function () {
        noteConveyorInteraction();
      }, { passive: true });
      sheet.addEventListener('touchstart', function () {
        noteConveyorInteraction();
      }, { passive: true });

      var swX = 0;
      var swY = 0;
      var activeSwipe = false;
      var stepLockUntil = 0;

      sheet.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        swX = e.clientX;
        swY = e.clientY;
        activeSwipe = true;
      }, { passive: true });

      sheet.addEventListener('pointerup', function (e) {
        if (!activeSwipe) return;
        activeSwipe = false;
        var dx = e.clientX - swX;
        var dy = e.clientY - swY;
        if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          window.stepConveyorBrand(dx < 0 ? 1 : -1);
        }
      }, { passive: true });

      sheet.addEventListener('pointercancel', function () {
        activeSwipe = false;
      }, { passive: true });

      sheet.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) > 26 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.25) {
          var now = Date.now();
          if (now < stepLockUntil) return;
          stepLockUntil = now + 420;
          e.preventDefault();
          window.stepConveyorBrand(e.deltaX > 0 ? 1 : -1);
        }
      }, { passive: false });
    }

    var hwStage = document.getElementById('p-hw-trilogy-stage');
    if (hwStage) {
      window.selectHardwareCard(0);
      var hwX = 0;
      var hwY = 0;
      var hwSw = false;
      hwStage.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        hwX = e.clientX;
        hwY = e.clientY;
        hwSw = true;
      }, { passive: true });
      hwStage.addEventListener('pointerup', function (e) {
        if (!hwSw) return;
        hwSw = false;
        var dx = e.clientX - hwX;
        var dy = e.clientY - hwY;
        if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          window.selectHardwareCard(activeHardwareIdx + (dx < 0 ? 1 : -1));
        }
      }, { passive: true });
      hwStage.addEventListener('pointercancel', function () { hwSw = false; }, { passive: true });
    }

    window.refreshConveyorLanes = function () {
      renderSpecSheetBrand(activeSpecBrandIdx, false);
      if (Date.now() >= convUserPausedUntil) {
        setConveyorPauseUi(false);
        scheduleConveyorAutoTick(4200);
      }
    };

    var hwStage = document.getElementById('p-hw-trilogy-stage');
    if (hwStage) {
      var hwx = 0, hwy = 0, hwSw = false;
      hwStage.addEventListener('pointerdown', function (e) {
        hwx = e.clientX;
        hwy = e.clientY;
        hwSw = true;
      }, { passive: true });
      hwStage.addEventListener('pointerup', function (e) {
        if (!hwSw) return;
        hwSw = false;
        var dx = e.clientX - hwx;
        var dy = e.clientY - hwy;
        if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          window.selectHardwareCard(activeHardwareIdx + (dx < 0 ? 1 : -1));
        }
      }, { passive: true });
      hwStage.addEventListener('pointercancel', function () { hwSw = false; }, { passive: true });
    }
  }

  // Room 06: Upright 9:16 Center-Stage 3D Reel Cinema Carousel
  var REEL_ITEMS = [
    {
      kicker: '01 / 03 · 9:16 SOCIAL MOTION · 60FPS MP4',
      title: 'Part Sale 2026 — Apparel Story Cut',
      lightboxTitle: 'Part Sale 2026: Apparel Story Reel',
      lightboxSub: '9:16 VERTICAL VIDEO · 60FPS',
      type: 'video',
      src: 'assets/real_works/new_additions/PART SALE 2026 Apparel Story.mp4',
      ambient: 'assets/optimized/new_additions/PART_SALE_2026_Apparel_Story_poster.jpg'
    },
    {
      kicker: '02 / 03 · 9:16 PERFORMANCE MOTION · GIF LOOP',
      title: 'Galvin Green — Kinetic Performance Apparel',
      lightboxTitle: 'Galvin Green // Kinetic Performance Apparel',
      lightboxSub: 'ANIMATED DISPLAY AD',
      type: 'img',
      src: 'assets/optimized/Galvin_Green_New_Collection.gif',
      ambient: 'assets/optimized/Galvin_Green_New_Collection.gif'
    },
    {
      kicker: '03 / 03 · 9:16 HARDWARE RESTOCK · GIF LOOP',
      title: 'L.A.B. Golf DF3 — Dynamic Restock Campaign',
      lightboxTitle: 'L.A.B. Golf DF3 // Dynamic Restock Campaign',
      lightboxSub: 'ANIMATED DISPLAY AD',
      type: 'img',
      src: 'assets/optimized/LAB_Golf_DF3__Back_in_stock.gif',
      ambient: 'assets/optimized/LAB_Golf_DF3__Back_in_stock.gif'
    }
  ];
  var activeReelIdx = 0;
  var reelAmbientToggle = false;
  var lastReelAmbientSrc = REEL_ITEMS[0].ambient;

  function renderPortraitReelCarousel(idx) {
    var count = REEL_ITEMS.length;
    activeReelIdx = ((idx % count) + count) % count;
    var nextIdx = (activeReelIdx + 1) % count;
    var prevIdx = (activeReelIdx - 1 + count) % count;

    document.querySelectorAll('#p-reels-deck .p-reel-card').forEach(function (card, i) {
      card.classList.remove('is-active', 'is-prev', 'is-next');
      if (i === activeReelIdx) card.classList.add('is-active');
      else if (i === prevIdx) card.classList.add('is-prev');
      else if (i === nextIdx) card.classList.add('is-next');
    });

    document.querySelectorAll('#p-reels-tabs [data-reel-tab]').forEach(function (btn) {
      var bIdx = Number(btn.getAttribute('data-reel-tab'));
      btn.classList.toggle('is-active', bIdx === activeReelIdx);
    });

    var item = REEL_ITEMS[activeReelIdx];
    var kickerEl = document.getElementById('p-reel-active-kicker');
    var titleEl = document.getElementById('p-reel-active-title');
    if (kickerEl) kickerEl.textContent = item.kicker;
    if (titleEl) titleEl.textContent = item.title;

    var videoEl = document.getElementById('p-reel-video');
    if (videoEl) {
      if (activeReelIdx === 0) videoEl.play().catch(function () {});
      else if (!videoEl.paused) videoEl.pause();
    }

    var bgA = document.getElementById('p-reel-bg-a');
    var bgB = document.getElementById('p-reel-bg-b');
    if (bgA && bgB && item.ambient) {
      smoothAmbientCrossfade(bgA, bgB, item.ambient, reelAmbientState);
    }
  }

  window.selectPortraitReel = function (idx) {
    renderPortraitReelCarousel(idx);
  };

  window.stepPortraitReel = function (delta) {
    renderPortraitReelCarousel(activeReelIdx + (delta || 1));
  };

  window.handlePortraitReelCardTap = function (idx) {
    var target = ((idx % REEL_ITEMS.length) + REEL_ITEMS.length) % REEL_ITEMS.length;
    if (target === activeReelIdx) {
      window.openPortraitReelLightbox(target);
    } else {
      renderPortraitReelCarousel(target);
    }
  };

  window.openPortraitReelLightbox = function (idx) {
    var i = typeof idx === 'number' ? idx : activeReelIdx;
    var item = REEL_ITEMS[i] || REEL_ITEMS[0];
    if (!item) return;
    if (item.type === 'video' && typeof window.openLightboxWithVideo === 'function') {
      window.openLightboxWithVideo(item.src, item.lightboxTitle, item.lightboxSub);
    } else if (typeof window.openLightboxWithImage === 'function') {
      window.openLightboxWithImage(item.src, item.lightboxTitle, item.lightboxSub);
    }
  };

  function initReelCinemaCarousel() {
    var stage = document.getElementById('p-reels-stage');
    if (!stage) return;
    renderPortraitReelCarousel(0);

    var swX = 0;
    var swY = 0;
    var swActive = false;
    var wheelLockUntil = 0;

    stage.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      swX = e.clientX;
      swY = e.clientY;
      swActive = true;
    }, { passive: true });

    stage.addEventListener('pointerup', function (e) {
      if (!swActive) return;
      swActive = false;
      var dx = e.clientX - swX;
      var dy = e.clientY - swY;
      if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        window.stepPortraitReel(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    stage.addEventListener('pointercancel', function () {
      swActive = false;
    }, { passive: true });

    stage.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > 24 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.25) {
        var now = Date.now();
        if (now < wheelLockUntil) return;
        wheelLockUntil = now + 380;
        e.preventDefault();
        window.stepPortraitReel(e.deltaX > 0 ? 1 : -1);
      }
    }, { passive: false });
  }

  window.refreshReelTransposeScale = function () {
    renderPortraitReelCarousel(activeReelIdx);
  };

  /* ========================================================================
     SECTOR 05 // BARNEY DALE CHARACTER EXPRESSION STRIP (UNORDERED EXPRESSION SHEET)
     Decoupled from video playback order: inspects character poses freely.
     ======================================================================== */
  var SB_COL_X = [0, 336, 673, 1010, 1346, 1683]; // out of 2000px
  var SB_ROW_Y = [0, 467]; // out of 915px
  var STORYBOARD_BEATS = [
    { title: 'Study 01 // Cloud Awakes', desc: 'Buoyant greeting pose establishing Barney Dale’s weightless puffy silhouette.' },
    { title: 'Study 02 // Gentle Drift', desc: 'Secondary cloud wisps trail rightward to explore side profile weighting.' },
    { title: 'Study 03 // Playful Spark', desc: 'Twin micro-puffs detach cleanly along an expressive reaction silhouette.' },
    { title: 'Study 04 // Happy Cruise', desc: 'Open grin expression test across high-altitude sky framing.' },
    { title: 'Study 05 // Gathering Vapor', desc: 'Rear condensation shape variation highlighting soft silhouette contrast.' },
    { title: 'Study 06 // Kinetic Surge', desc: 'Forward lean key pose testing dynamic eye & brow deformation.' },
    { title: 'Study 07 // Row 2 Entry', desc: 'Mid-sheet posture shift balancing limb arc with cloud density.' },
    { title: 'Study 08 // Sudden Gasp', desc: 'Facial rig shifts from open grin to startled circular eye wide.' },
    { title: 'Study 09 // Full Swell', desc: 'Peak scale puff test filling frame margins before snap recoil.' },
    { title: 'Study 10 // Tight Squeeze', desc: 'Squash-and-stretch compression study with clenched squint keyframe.' },
    { title: 'Study 11 // Recoil Shrink', desc: 'Rapid volume contraction study exploring comedic silhouette scale.' },
    { title: 'Study 12 // Wide-Eyed Finale', desc: 'Compact recovery expression pose from the 12-pose character sheet.' }
  ];

  var activeBeatIdx = 0;

  function renderStoryboardThumb(beat, idx) {
    var col = idx % 6;
    var row = Math.floor(idx / 6);
    var posX = ((SB_COL_X[col] / 1683) * 100).toFixed(3);
    var posY = (row * 100).toFixed(1);
    return '<button type="button" class="p-sprocket-thumb' + (idx === 0 ? ' is-active' : '') +
      '" data-beat-idx="' + idx + '" style="background-position:' + posX + '% ' + posY + '%" onclick="selectStoryboardBeat(' + idx + ', true)" aria-label="' + beat.title + '">' +
      '<span>' + String(idx + 1).padStart(2, '0') + '</span></button>';
  }

  function initStoryboardLoupe() {
    var railLeft = document.getElementById('p-pose-rail-left');
    var railRight = document.getElementById('p-pose-rail-right');
    if (railLeft && railRight) {
      if (!railLeft.children.length) {
        railLeft.innerHTML = STORYBOARD_BEATS.slice(0, 6).map(function (beat, i) {
          return renderStoryboardThumb(beat, i);
        }).join('');
      }
      if (!railRight.children.length) {
        railRight.innerHTML = STORYBOARD_BEATS.slice(6, 12).map(function (beat, i) {
          return renderStoryboardThumb(beat, i + 6);
        }).join('');
      }
    } else {
      var rail = document.getElementById('p-sprocket-rail');
      if (rail && !rail.children.length) {
        rail.innerHTML = STORYBOARD_BEATS.map(function (beat, idx) {
          return renderStoryboardThumb(beat, idx);
        }).join('');
      }
    }

    selectStoryboardBeat(0, false);
  }

  function selectStoryboardBeat(idx, scrollStrip) {
    activeBeatIdx = ((idx % 12) + 12) % 12;
    var countEl = document.getElementById('p-loupe-count');
    var titleEl = document.getElementById('p-loupe-beat-title');
    var descEl = document.getElementById('p-loupe-beat-desc');

    if (countEl) countEl.textContent = 'EXPRESSION ' + String(activeBeatIdx + 1).padStart(2, '0') + ' / 12';
    if (titleEl) titleEl.textContent = STORYBOARD_BEATS[activeBeatIdx].title;
    if (descEl) descEl.textContent = STORYBOARD_BEATS[activeBeatIdx].desc;

    var col = activeBeatIdx % 6;
    var row = Math.floor(activeBeatIdx / 6);
    var posX = ((SB_COL_X[col] / 1683) * 100).toFixed(3);
    var posY = (row * 100).toFixed(1);
    var pipSprite = document.getElementById('p-pose-loupe-sprite');
    var pipTag = document.getElementById('p-pose-loupe-tag');
    if (pipSprite) pipSprite.style.backgroundPosition = posX + '% ' + posY + '%';
    if (pipTag) pipTag.textContent = 'POSE ' + String(activeBeatIdx + 1).padStart(2, '0');

    var thumbs = document.querySelectorAll('#p-sb-loupe-panel .p-sprocket-thumb');
    thumbs.forEach(function (thumb, i) {
      var attr = thumb.getAttribute('data-beat-idx');
      var tIdx = attr !== null ? Number(attr) : i;
      var isAct = tIdx === activeBeatIdx;
      thumb.classList.toggle('is-active', isAct);
      if (isAct && scrollStrip) {
        thumb.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    });
  }

  function stepStoryboardBeat(delta) {
    selectStoryboardBeat(activeBeatIdx + delta, true);
  }

  window.selectStoryboardBeat = selectStoryboardBeat;
  window.stepStoryboardBeat = stepStoryboardBeat;

  window.switchStoryboardView = function (mode, btn) {
    document.querySelectorAll('[data-sb-mode]').forEach(function (b) {
      b.classList.toggle('is-active', b === btn || b.getAttribute('data-sb-mode') === mode);
    });
    document.getElementById('p-sb-loupe-panel')?.classList.toggle('is-active', mode === 'loupe');
    document.getElementById('p-sb-full-panel')?.classList.toggle('is-active', mode === 'sheet');
  };

  window.togglePortraitCinemaPlay = function () {
    var video = document.getElementById('p-barney-video');
    var btn = document.getElementById('p-cinema-play-btn');
    if (!video) return;
    if (video.paused) {
      video.dataset.userPaused = 'false';
      video.play().catch(function () {});
      if (btn) btn.textContent = '⏸ PAUSE';
    } else {
      video.dataset.userPaused = 'true';
      video.pause();
      if (btn) btn.textContent = '▶ PLAY';
    }
  };

  window.togglePortraitCinemaMute = function () {
    var video = document.getElementById('p-barney-video');
    var btn = document.getElementById('p-cinema-mute-btn');
    if (!video) return;
    video.muted = !video.muted;
    if (btn) btn.textContent = video.muted ? '🔇 MUTE' : '🔊 SOUND';
  };

  /* ========================================================================
     SECTOR 06 // EXHIBITION POSTERS — 3D TACTILE CARD DECK (10 EDITIONS)
     ======================================================================== */
  var POSTER_ARCHIVE = [
    { set: 'set-4', tag: 'SET 04 // METAPHOR', title: 'The Cognitive Maze', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-01.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 4-01.jpg' },
    { set: 'set-4', tag: 'SET 04 // METAPHOR', title: 'Silent Pressure', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-02.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 4-02.jpg' },
    { set: 'set-4', tag: 'SET 04 // METAPHOR', title: 'Inner Equilibrium', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-03.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 4-03.jpg' },
    { set: 'set-3', tag: 'SET 03 // TYPOGRAPHY', title: 'Permission to Pause', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-01.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 3-01.jpg' },
    { set: 'set-3', tag: 'SET 03 // TYPOGRAPHY', title: 'Rhythm of Rest', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-03.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 3-03.jpg' },
    { set: 'set-3', tag: 'SET 03 // TYPOGRAPHY', title: 'Perspective Shift', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-04.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 3-04.jpg' },
    { set: 'set-3', tag: 'SET 03 // TYPOGRAPHY', title: 'Clarity Through Contrast', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-06.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 3-06.jpg' },
    { set: 'set-5', tag: 'SET 05 // PSYCHOLOGY', title: 'Emotional Spectrum', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 5-01.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 5-01.jpg' },
    { set: 'set-5', tag: 'SET 05 // PSYCHOLOGY', title: 'De-Stigmatization', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 5-02.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 5-02.jpg' },
    { set: 'set-5', tag: 'SET 05 // PSYCHOLOGY', title: 'Resilience Archetype', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 5-03.jpg', native: 'assets/real_works/posters/Mental Health Awareness Poster Set 5-03.jpg' }
  ];

  var posterFilter = 'all';
  var posterDeckIdx = 0;
  var prevPosterIdx = -1;
  var posterGridOpen = false;
  var posterBgToggle = false;
  var posterStackBound = false;
  var posterLastListKey = '';
  var posterCardEls = [];
  var posterExitTimer = null;

  function getFilteredPosters() {
    if (posterFilter === 'all') return POSTER_ARCHIVE;
    return POSTER_ARCHIVE.filter(function (p) { return p.set === posterFilter; });
  }

  function ensurePosterPool(list) {
    var stack = document.getElementById('p-poster-stack');
    if (!stack) return [];
    var key = posterFilter + ':' + list.length;
    if (key === posterLastListKey && posterCardEls.length === list.length) {
      return posterCardEls;
    }
    posterLastListKey = key;
    stack.innerHTML = list.map(function (item, idx) {
      return '<div class="p-deck-card is-loading" data-poster-idx="' + idx + '">' +
        '<span class="p-salon-skeleton" aria-hidden="true"></span>' +
        '<img src="' + item.src + '" alt="' + item.title + '" decoding="async">' +
        '<span class="p-deck-card-tag">' + item.tag + '</span>' +
        '<button type="button" class="p-deck-hd-btn" onclick="event.stopPropagation(); openActivePosterLightbox();">⛶ HD</button>' +
        '</div>';
    }).join('');
    if (typeof window.hydratePortraitSkeletons === 'function') {
      window.hydratePortraitSkeletons(stack, '.p-deck-card');
    }
    posterCardEls = Array.prototype.slice.call(stack.querySelectorAll('.p-deck-card'));
    posterCardEls.forEach(function (cardEl, idx) {
      cardEl.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        if (idx === posterDeckIdx) {
          window.openActivePosterLightbox();
        } else {
          window.jumpToPosterInDeck(idx);
        }
      });
    });
    return posterCardEls;
  }

  function signedRailOffset(idx, activeIdx, len) {
    if (!len) return 0;
    var d = ((idx - activeIdx) % len + len) % len;
    if (d > len / 2) d -= len;
    return d;
  }

  function applySlotPose(el, offset, listLen) {
    if (!el) return;
    var d = typeof listLen === 'number' && listLen > 1 && offset > listLen / 2
      ? offset - listLen
      : offset;
    el.classList.remove('is-flying-out-left', 'is-flying-out-right', 'is-dragging');
    if (d === 0) {
      el.classList.remove('is-hidden-slot');
      el.style.transform = 'translate3d(0, 0, 0) rotateY(0deg) scale(1)';
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.zIndex = '30';
      el.style.pointerEvents = 'auto';
    } else if (d === 1) {
      el.classList.remove('is-hidden-slot');
      el.style.transform = 'translate3d(68%, 0, -90px) rotateY(-18deg) scale(0.82)';
      el.style.opacity = '0.56';
      el.style.filter = 'blur(1.5px)';
      el.style.zIndex = '20';
      el.style.pointerEvents = 'auto';
    } else if (d === -1) {
      el.classList.remove('is-hidden-slot');
      el.style.transform = 'translate3d(-68%, 0, -90px) rotateY(18deg) scale(0.82)';
      el.style.opacity = '0.56';
      el.style.filter = 'blur(1.5px)';
      el.style.zIndex = '20';
      el.style.pointerEvents = 'auto';
    } else if (d === 2) {
      el.classList.remove('is-hidden-slot');
      el.style.transform = 'translate3d(122%, 0, -180px) rotateY(-28deg) scale(0.68)';
      el.style.opacity = '0.24';
      el.style.filter = 'blur(3px)';
      el.style.zIndex = '10';
      el.style.pointerEvents = 'none';
    } else if (d === -2) {
      el.classList.remove('is-hidden-slot');
      el.style.transform = 'translate3d(-122%, 0, -180px) rotateY(28deg) scale(0.68)';
      el.style.opacity = '0.24';
      el.style.filter = 'blur(3px)';
      el.style.zIndex = '10';
      el.style.pointerEvents = 'none';
    } else {
      el.classList.add('is-hidden-slot');
      el.style.transform = 'translate3d(0, 0, -240px) scale(0.62)';
      el.style.opacity = '0';
      el.style.filter = 'blur(4px)';
      el.style.zIndex = '1';
      el.style.pointerEvents = 'none';
    }
  }

  function bindPosterStackGestures() {
    if (posterStackBound) return;
    var stack = document.getElementById('p-poster-stack');
    if (!stack) return;
    posterStackBound = true;

    var sx = 0, sy = 0, curDx = 0;
    var pointerActive = false;
    var locked = false;
    var rejected = false;
    var startTs = 0;

    stack.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      pointerActive = true;
      locked = false;
      rejected = false;
      sx = e.clientX;
      sy = e.clientY;
      curDx = 0;
      startTs = performance.now();
    });

    stack.addEventListener('pointermove', function (e) {
      if (!pointerActive || rejected) return;
      var totalDx = e.clientX - sx;
      var totalDy = e.clientY - sy;
      if (!locked) {
        if (Math.abs(totalDx) < 7 && Math.abs(totalDy) < 7) return;
        if (Math.abs(totalDx) >= Math.abs(totalDy)) {
          locked = true;
        } else {
          rejected = true;
          pointerActive = false;
          return;
        }
      }
      curDx = totalDx;
      var cards = posterCardEls;
      var listLen = cards.length;
      if (!listLen) return;
      var dragPct = (curDx / Math.max(200, stack.clientWidth || 320)) * 68;
      var frontCard = cards[posterDeckIdx];
      var nextCard = listLen > 1 ? cards[(posterDeckIdx + 1) % listLen] : null;
      var prevCard = listLen > 2 ? cards[(posterDeckIdx - 1 + listLen) % listLen] : null;
      if (frontCard) {
        frontCard.classList.add('is-dragging');
        var fScale = Math.max(0.84, 1 - Math.abs(dragPct) * 0.0022);
        var fZ = -Math.abs(dragPct) * 1.1;
        frontCard.style.transform = 'translate3d(' + dragPct.toFixed(1) + '%, 0, ' + fZ.toFixed(1) + 'px) rotateY(' + (-dragPct * 0.22).toFixed(2) + 'deg) scale(' + fScale.toFixed(3) + ')';
      }
      if (nextCard) {
        nextCard.classList.add('is-dragging');
        nextCard.style.transform = 'translate3d(' + (68 + dragPct).toFixed(1) + '%, 0, -90px) rotateY(-18deg) scale(0.82)';
      }
      if (prevCard) {
        prevCard.classList.add('is-dragging');
        prevCard.style.transform = 'translate3d(' + (-68 + dragPct).toFixed(1) + '%, 0, -90px) rotateY(18deg) scale(0.82)';
      }
    });

    function releasePosterDrag() {
      if (!pointerActive) return;
      pointerActive = false;
      var elapsed = Math.max(16, performance.now() - startTs);
      var vel = curDx / elapsed;
      var cards = posterCardEls;
      var listLen = cards.length;
      var frontCard = cards[posterDeckIdx];
      var nextCard = listLen > 1 ? cards[(posterDeckIdx + 1) % listLen] : null;
      var prevCard = listLen > 2 ? cards[(posterDeckIdx - 1 + listLen) % listLen] : null;
      [frontCard, nextCard, prevCard].forEach(function (c) {
        if (c) c.classList.remove('is-dragging');
      });

      if (locked && (Math.abs(curDx) > 40 || Math.abs(vel) > 0.36)) {
        window.stepPosterDeck(curDx < 0 ? 1 : -1);
      } else {
        if (frontCard) applySlotPose(frontCard, 0, listLen);
        if (nextCard) applySlotPose(nextCard, 1, listLen);
        if (prevCard) applySlotPose(prevCard, listLen - 1, listLen);
      }
      curDx = 0;
      locked = false;
    }

    stack.addEventListener('pointerup', releasePosterDrag);
    stack.addEventListener('pointercancel', releasePosterDrag);
  }

  function renderPosterDeck() {
    var list = getFilteredPosters();
    if (!list.length) return;
    var cards = ensurePosterPool(list);
    bindPosterStackGestures();

    var normalizedIdx = ((posterDeckIdx % list.length) + list.length) % list.length;
    prevPosterIdx = normalizedIdx;
    posterDeckIdx = normalizedIdx;

    var miniGrid = document.getElementById('p-poster-mini-grid');
    var railThumbs = document.getElementById('p-poster-rail-thumbs');
    var titleEl = document.getElementById('p-poster-active-title');
    var counterEl = document.getElementById('p-poster-active-counter');
    var current = list[posterDeckIdx];

    cards.forEach(function (el, idx) {
      var offset = signedRailOffset(idx, posterDeckIdx, list.length);
      applySlotPose(el, offset, list.length);
    });

    if (railThumbs) {
      if (railThumbs.dataset.builtKey !== posterFilter) {
        railThumbs.dataset.builtKey = posterFilter;
        railThumbs.innerHTML = list.map(function (p, i) {
          return '<button type="button" class="p-poster-rail-pip' + (i === posterDeckIdx ? ' is-active' : '') + '" onclick="jumpToPosterInDeck(' + i + ')" aria-label="View ' + p.title + '">' +
            '<img src="' + p.src + '" alt="" decoding="sync"></button>';
        }).join('');
      } else {
        railThumbs.querySelectorAll('.p-poster-rail-pip').forEach(function (pip, i) {
          var act = i === posterDeckIdx;
          pip.classList.toggle('is-active', act);
          if (act) pip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
      }
    }

    if ((miniGrid && !miniGrid.dataset.builtKey) || (miniGrid && miniGrid.dataset.builtKey !== posterFilter)) {
      miniGrid.dataset.builtKey = posterFilter;
      miniGrid.innerHTML = list.map(function (p, i) {
        return '<button type="button" class="p-poster-mini-item" onclick="jumpToPosterInDeck(' + i + ')">' +
          '<div class="p-poster-mini-media is-loading">' +
            '<span class="p-salon-skeleton" aria-hidden="true"></span>' +
            '<img loading="lazy" src="' + p.src + '" alt="' + p.title + '" decoding="async">' +
          '</div>' +
          '<span>' + p.title + '</span></button>';
      }).join('');
      if (typeof window.hydratePortraitSkeletons === 'function') {
        window.hydratePortraitSkeletons(miniGrid, '.p-poster-mini-media');
      }
    }

    if (titleEl) titleEl.textContent = current.title;
    if (counterEl) counterEl.textContent = String(posterDeckIdx + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0') + ' · SWIPE OR STEP ↔';

    var bgA = document.getElementById('p-poster-bg-a');
    var bgB = document.getElementById('p-poster-bg-b');
    if (bgA && bgB) {
      posterBgToggle = !posterBgToggle;
      var inc = posterBgToggle ? bgB : bgA;
      var out = posterBgToggle ? bgA : bgB;
      inc.style.backgroundImage = "url('" + current.src.replace(/'/g, "\\'") + "')";
      inc.classList.add('is-active');
      out.classList.remove('is-active');
    }
  }

  window.stepPosterDeck = function (delta) {
    posterDeckIdx += delta;
    renderPosterDeck();
  };

  window.openActivePosterLightbox = function () {
    var list = getFilteredPosters();
    var item = list[posterDeckIdx];
    if (!item || typeof window.openLightboxWithImage !== 'function') return;
    window.openLightboxWithImage(item.native, item.title, item.tag);
  };

  window.filterPortraitPosters = function (setKey, btn) {
    var normMap = { 'set4': 'set-4', 'set3': 'set-3', 'set5': 'set-5' };
    posterFilter = normMap[setKey] || setKey || 'all';
    posterDeckIdx = 0;
    prevPosterIdx = -1;
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.p-chip-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
    }
    renderPosterDeck();
  };

  window.togglePosterGridView = function () {
    posterGridOpen = !posterGridOpen;
    document.getElementById('p-poster-deck-stage')?.classList.toggle('is-active', !posterGridOpen);
    document.getElementById('p-poster-grid-overlay')?.classList.toggle('is-active', posterGridOpen);
    var btn = document.getElementById('p-poster-mode-btn');
    if (btn) btn.textContent = posterGridOpen ? '▭ DECK' : '☷ GRID';
  };

  window.jumpToPosterInDeck = function (idx) {
    posterDeckIdx = idx;
    posterGridOpen = false;
    document.getElementById('p-poster-deck-stage')?.classList.add('is-active');
    document.getElementById('p-poster-grid-overlay')?.classList.remove('is-active');
    var btn = document.getElementById('p-poster-mode-btn');
    if (btn) btn.textContent = '☷ GRID';
    renderPosterDeck();
  };

  /* ========================================================================
     ROOM 09 // FLAGSHIP TOTEMS & AI SPATIAL LAB (7A MONOLITHS + 7B FLIP LAB)
     ======================================================================== */
  var totemAmbientToggle = false;
  var lastTotemAmbientSrc = '';
  var totemAmbientReqId = 0;
  var totemAmbientRaf = null;
  var totemDecodedCache = {};
  var aiProgrammaticScrollUntil = 0;

  function cacheDecodedTotemSrc(src) {
    if (!src) return null;
    if (!totemDecodedCache[src]) {
      var img = new Image();
      img.src = src;
      totemDecodedCache[src] = {
        img: img,
        ready: typeof img.decode === 'function' ? img.decode().catch(function () {}) : Promise.resolve()
      };
    }
    return totemDecodedCache[src];
  }

  function preloadTotemAmbientAssets() {
    (TOTEM_SPECIMENS || []).forEach(function (item) {
      if (item && item.src) cacheDecodedTotemSrc(item.src);
    });
    var carousel = document.getElementById('p-ailab-carousel');
    if (carousel) {
      carousel.querySelectorAll('.p-specimen-plate img').forEach(function (img) {
        var s = img.getAttribute('src') || img.src || '';
        if (s) cacheDecodedTotemSrc(s);
      });
    }
  }

  function syncTotemAmbientBg(src) {
    if (!src || src === lastTotemAmbientSrc) return;
    var bgA = document.getElementById('p-totem-bg-a');
    var bgB = document.getElementById('p-totem-bg-b');
    if (!bgA || !bgB) return;

    lastTotemAmbientSrc = src;
    var myReqId = ++totemAmbientReqId;
    if (totemAmbientRaf) {
      window.cancelAnimationFrame(totemAmbientRaf);
      totemAmbientRaf = null;
    }

    var cached = cacheDecodedTotemSrc(src);
    var readyPromise = cached ? cached.ready : Promise.resolve();
    readyPromise.then(function () {
      if (myReqId !== totemAmbientReqId) return;
      totemAmbientToggle = !totemAmbientToggle;
      var inc = totemAmbientToggle ? bgB : bgA;
      var out = totemAmbientToggle ? bgA : bgB;
      inc.style.backgroundImage = "url('" + src.replace(/'/g, "\\'") + "')";
      totemAmbientRaf = window.requestAnimationFrame(function () {
        totemAmbientRaf = window.requestAnimationFrame(function () {
          if (myReqId !== totemAmbientReqId) return;
          inc.classList.add('is-active');
          out.classList.remove('is-active');
          totemAmbientRaf = null;
        });
      });
    });
  }

  function getActiveAiSpecimenSrc() {
    var carousel = document.getElementById('p-ailab-carousel');
    if (!carousel) return '';
    var plates = carousel.querySelectorAll('.p-specimen-plate');
    var active = plates[activeAiSpecimenIdx];
    var img = active ? active.querySelector('img') : null;
    return img ? (img.getAttribute('src') || img.src || '') : '';
  }

  window.switchTotemTab = function (tabKey, btn) {
    var key = tabKey === 'ailab' ? 'ailab' : 'monoliths';
    document.querySelectorAll('[data-totem-tab]').forEach(function (b) {
      b.classList.toggle('is-active', b === btn || b.getAttribute('data-totem-tab') === key);
    });
    ['monoliths', 'ailab'].forEach(function (k) {
      document.getElementById('p-totem-panel-' + k)?.classList.toggle('is-active', k === key);
    });
    if (key === 'ailab') {
      syncTotemAmbientBg(getActiveAiSpecimenSrc());
    } else if (TOTEM_SPECIMENS[focusedTotemIdx]) {
      syncTotemAmbientBg(TOTEM_SPECIMENS[focusedTotemIdx].src);
    }
  };

  window.switchPromoSub = function (subKey, btn) {
    if (subKey === 'monoliths' || subKey === 'ailab') {
      window.switchTotemTab(subKey, btn);
    } else if (subKey === 'trisets' && typeof window.trisetWheelRefreshLayout === 'function') {
      window.requestAnimationFrame(window.trisetWheelRefreshLayout);
    }
  };

  var TOTEM_SPECIMENS = [
    {
      title: 'PUMA x PTC Collection',
      spec: 'APPAREL CAPSULE · 750 × 1669 PX',
      src: 'assets/optimized/promosheet_banners/PUMA x PTC New Collection.jpg',
      native: 'assets/real_works/promosheet_banners/PUMA x PTC New Collection.jpg'
    },
    {
      title: 'Bettinardi The Antidote Series',
      spec: 'PRECISION MILLED PUTTERS · 750 × 1450 PX',
      src: 'assets/optimized/promosheet_banners/Bettinardi the Antidote Putter Series.jpg',
      native: 'assets/real_works/promosheet_banners/Bettinardi the Antidote Putter Series.jpg'
    },
    {
      title: 'Callaway 2026 Chrome Tour',
      spec: 'TOUR PERFORMANCE BALL · 750 × 1523 PX',
      src: 'assets/optimized/promosheet_banners/Callaway 2026 Chrome Tour Golf Balls.jpg',
      native: 'assets/real_works/promosheet_banners/Callaway 2026 Chrome Tour Golf Balls.jpg'
    },
    {
      title: 'TaylorMade TP5 / TP5x',
      spec: 'MULTI-LAYER SPEED CORE · 750 × 1476 PX',
      src: 'assets/optimized/promosheet_banners/TaylorMade TP5 TP5x Golf Balls.jpg',
      native: 'assets/real_works/promosheet_banners/TaylorMade TP5 TP5x Golf Balls.jpg'
    },
    {
      title: 'Vessel Nightfire Collection',
      spec: 'LUXURY TOUR GEAR · 750 × 1125 PX',
      src: 'assets/optimized/promosheet_banners/Vessel Nightfire Collection.jpg',
      native: 'assets/real_works/promosheet_banners/Vessel Nightfire Collection.jpg'
    }
  ];

  var focusedTotemIdx = 0;
  var activeTotemIdx = 0;
  var elevatorAutoRaf = null;
  var elevatorUserPaused = false;
  var activeAiSpecimenIdx = 0;
  var aiPromptTypeTimer = null;

  window.getFocusedTotemIdx = function () {
    return focusedTotemIdx;
  };

  window.focusTotemPlinth = function (idx) {
    focusedTotemIdx = ((idx % TOTEM_SPECIMENS.length) + TOTEM_SPECIMENS.length) % TOTEM_SPECIMENS.length;
    var item = TOTEM_SPECIMENS[focusedTotemIdx];
    document.querySelectorAll('#p-totem-showroom .p-plinth-item').forEach(function (btn, i) {
      btn.classList.toggle('is-focused', i === focusedTotemIdx);
    });
    var idxEl = document.getElementById('p-totem-focus-idx');
    var titleEl = document.getElementById('p-totem-focus-title');
    var specEl = document.getElementById('p-totem-focus-spec');
    if (idxEl) idxEl.textContent = String(focusedTotemIdx + 1).padStart(2, '0') + ' / ' + String(TOTEM_SPECIMENS.length).padStart(2, '0') + ' · ACTIVE MONOLITH';
    if (titleEl && item) titleEl.textContent = item.title;
    if (specEl && item) specEl.textContent = item.spec;
    if (item && item.src) syncTotemAmbientBg(item.src);
  };

  window.handlePlinthTap = function (idx) {
    var target = ((idx % TOTEM_SPECIMENS.length) + TOTEM_SPECIMENS.length) % TOTEM_SPECIMENS.length;
    if (target === focusedTotemIdx) {
      window.openTotemElevator(target);
    } else {
      window.focusTotemPlinth(target);
    }
  };

  function syncElevatorThumb() {
    var vp = document.getElementById('p-elevator-viewport');
    var minimap = document.getElementById('p-elevator-minimap');
    var thumb = document.getElementById('p-elevator-thumb');
    if (!vp || !minimap || !thumb) return;
    var maxScroll = Math.max(1, vp.scrollHeight - vp.clientHeight);
    var prog = Math.max(0, Math.min(1, vp.scrollTop / maxScroll));
    var hPct = Math.max(18, (vp.clientHeight / Math.max(vp.clientHeight, vp.scrollHeight)) * 100);
    thumb.style.height = hPct.toFixed(1) + '%';
    thumb.style.top = (prog * (100 - hPct)).toFixed(1) + '%';
  }

  function stopElevatorAutoPan() {
    if (elevatorAutoRaf) {
      window.cancelAnimationFrame(elevatorAutoRaf);
      elevatorAutoRaf = null;
    }
  }

  function startElevatorAutoPan() {
    stopElevatorAutoPan();
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || elevatorUserPaused) return;
    var vp = document.getElementById('p-elevator-viewport');
    var elev = document.getElementById('p-totem-elevator');
    if (!vp || !elev) return;
    var lastTs = performance.now();

    function step(now) {
      if (!elev.classList.contains('is-open') || elevatorUserPaused) {
        elevatorAutoRaf = null;
        return;
      }
      var dt = Math.min(40, Math.max(8, now - lastTs)) / 1000;
      lastTs = now;
      var maxScroll = Math.max(0, vp.scrollHeight - vp.clientHeight);
      if (maxScroll > 8) {
        var speed = maxScroll / 7;
        vp.scrollTop = Math.min(maxScroll, vp.scrollTop + speed * dt);
        syncElevatorThumb();
        if (vp.scrollTop >= maxScroll - 1) {
          elevatorAutoRaf = null;
          return;
        }
      }
      elevatorAutoRaf = window.requestAnimationFrame(step);
    }

    elevatorAutoRaf = window.requestAnimationFrame(step);
  }

  window.openTotemElevator = function (idx) {
    activeTotemIdx = ((idx % TOTEM_SPECIMENS.length) + TOTEM_SPECIMENS.length) % TOTEM_SPECIMENS.length;
    var item = TOTEM_SPECIMENS[activeTotemIdx];
    var elev = document.getElementById('p-totem-elevator');
    var img = document.getElementById('p-elevator-img');
    var mini = document.getElementById('p-elevator-mini-img');
    var cnt = document.getElementById('p-elevator-counter');
    var title = document.getElementById('p-elevator-title');
    var spec = document.getElementById('p-elevator-spec');
    var vp = document.getElementById('p-elevator-viewport');
    if (!elev || !item) return;

    elevatorUserPaused = false;
    if (cnt) cnt.textContent = String(activeTotemIdx + 1).padStart(2, '0') + ' / ' + String(TOTEM_SPECIMENS.length).padStart(2, '0');
    if (title) title.textContent = item.title;
    if (spec) spec.textContent = item.spec;
    if (img) {
      img.onload = function () {
        if (vp) vp.scrollTop = 0;
        syncElevatorThumb();
        startElevatorAutoPan();
      };
      img.src = item.src;
      img.alt = item.title;
    }
    if (mini) mini.src = item.src;
    if (vp) vp.scrollTop = 0;
    elev.classList.add('is-open');
    elev.setAttribute('aria-hidden', 'false');
    if (img && img.complete && img.naturalHeight > 0) {
      syncElevatorThumb();
      startElevatorAutoPan();
    }
  };

  window.closeTotemElevator = function () {
    stopElevatorAutoPan();
    var elev = document.getElementById('p-totem-elevator');
    if (!elev) return;
    elev.classList.remove('is-open');
    elev.setAttribute('aria-hidden', 'true');
  };

  window.stepTotemElevator = function (delta) {
    window.openTotemElevator(activeTotemIdx + (delta || 1));
  };

  window.openActiveTotemHd = function () {
    var item = TOTEM_SPECIMENS[activeTotemIdx];
    if (!item || typeof window.openLightboxWithImage !== 'function') return;
    window.openLightboxWithImage(item.native || item.src, item.title, item.spec);
  };

  function revealAiSpecimenPrompt(plate) {
    window.clearInterval(aiPromptTypeTimer);
    if (!plate) return;
    var promptEl = plate.querySelector('.p-specimen-prompt');
    if (!promptEl) return;
    var full = promptEl.getAttribute('data-full-prompt') || promptEl.textContent || '';
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      promptEl.textContent = full;
      return;
    }
    var i = 0;
    promptEl.textContent = '';
    aiPromptTypeTimer = window.setInterval(function () {
      i += 3;
      promptEl.textContent = full.slice(0, i);
      if (i >= full.length) {
        promptEl.textContent = full;
        window.clearInterval(aiPromptTypeTimer);
      }
    }, 18);
  }

  window.selectAiSpecimen = function (idx) {
    var carousel = document.getElementById('p-ailab-carousel');
    if (!carousel) return;
    var plates = carousel.querySelectorAll('.p-specimen-plate');
    if (!plates.length) return;
    activeAiSpecimenIdx = ((idx % plates.length) + plates.length) % plates.length;

    plates.forEach(function (pl, i) {
      pl.classList.toggle('is-active', i === activeAiSpecimenIdx);
    });
    document.querySelectorAll('#p-ailab-nav .p-text-tab').forEach(function (btn, i) {
      btn.classList.toggle('is-active', i === activeAiSpecimenIdx);
    });

    var target = plates[activeAiSpecimenIdx];
    if (target) {
      aiProgrammaticScrollUntil = Date.now() + 520;
      var left = target.offsetLeft - Math.max(0, (carousel.clientWidth - target.offsetWidth) / 2);
      carousel.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      revealAiSpecimenPrompt(target);
      var img = target.querySelector('img');
      if (img) syncTotemAmbientBg(img.getAttribute('src') || img.src || '');
    }
  };

  window.toggleFlipSpecimen = window.selectAiSpecimen;

  function initTotemAndAiLab() {
    preloadTotemAmbientAssets();
    var vp = document.getElementById('p-elevator-viewport');
    var minimap = document.getElementById('p-elevator-minimap');
    if (vp) {
      vp.addEventListener('pointerdown', function () {
        elevatorUserPaused = true;
        stopElevatorAutoPan();
      }, { passive: true });
      vp.addEventListener('wheel', function () {
        elevatorUserPaused = true;
        stopElevatorAutoPan();
      }, { passive: true });
      vp.addEventListener('scroll', syncElevatorThumb, { passive: true });
    }
    if (minimap && vp) {
      var scrubbing = false;
      function scrubMini(cy) {
        elevatorUserPaused = true;
        stopElevatorAutoPan();
        var rect = minimap.getBoundingClientRect();
        var ratio = Math.max(0, Math.min(1, (cy - rect.top) / Math.max(1, rect.height)));
        var maxScroll = Math.max(0, vp.scrollHeight - vp.clientHeight);
        vp.scrollTop = ratio * maxScroll;
        syncElevatorThumb();
      }
      minimap.addEventListener('pointerdown', function (e) { scrubbing = true; scrubMini(e.clientY); });
      minimap.addEventListener('pointermove', function (e) { if (scrubbing) scrubMini(e.clientY); });
      window.addEventListener('pointerup', function () { scrubbing = false; });
    }

    var showroom = document.getElementById('p-totem-showroom');
    if (showroom) {
      var shX = 0, shY = 0, shSw = false;
      showroom.addEventListener('pointerdown', function (e) {
        shX = e.clientX;
        shY = e.clientY;
        shSw = true;
      }, { passive: true });
      showroom.addEventListener('pointerup', function (e) {
        if (!shSw) return;
        shSw = false;
        var dx = e.clientX - shX;
        var dy = e.clientY - shY;
        if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          window.focusTotemPlinth(focusedTotemIdx + (dx < 0 ? 1 : -1));
        }
      }, { passive: true });
      showroom.addEventListener('pointercancel', function () { shSw = false; }, { passive: true });
    }
    window.focusTotemPlinth(0);

    var carousel = document.getElementById('p-ailab-carousel');
    if (carousel) {
      carousel.querySelectorAll('.p-specimen-plate').forEach(function (pl, i) {
        pl.addEventListener('click', function (e) {
          if (e.target.closest('button')) return;
          if (i !== activeAiSpecimenIdx) {
            window.selectAiSpecimen(i);
          }
        });
      });

      var scrollTick = null;
      carousel.addEventListener('scroll', function () {
        if (Date.now() < aiProgrammaticScrollUntil) return;
        window.clearTimeout(scrollTick);
        scrollTick = window.setTimeout(function () {
          if (Date.now() < aiProgrammaticScrollUntil) return;
          var center = carousel.scrollLeft + carousel.clientWidth / 2;
          var bestIdx = 0;
          var bestDist = Infinity;
          var plates = carousel.querySelectorAll('.p-specimen-plate');
          plates.forEach(function (pl, i) {
            var plCenter = pl.offsetLeft + pl.offsetWidth / 2;
            var d = Math.abs(plCenter - center);
            if (d < bestDist) {
              bestDist = d;
              bestIdx = i;
            }
          });
          if (bestIdx !== activeAiSpecimenIdx) {
            activeAiSpecimenIdx = bestIdx;
            plates.forEach(function (pl, i) { pl.classList.toggle('is-active', i === bestIdx); });
            document.querySelectorAll('#p-ailab-nav .p-text-tab').forEach(function (b, i) { b.classList.toggle('is-active', i === bestIdx); });
            revealAiSpecimenPrompt(plates[bestIdx]);
            var spImg = plates[bestIdx] ? plates[bestIdx].querySelector('img') : null;
            if (spImg) syncTotemAmbientBg(spImg.getAttribute('src') || spImg.src || '');
          }
        }, 140);
      }, { passive: true });
    }
  }

  // 7D CRM Direct Mailers & Isolated Full Reader
  var activeCrmKey = 'emailer1';

  window.selectPortraitCrm = function (key, btn) {
    var item = (window.crmEmails || {})[key];
    if (!item) return;
    activeCrmKey = key;
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.p-chip-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
    }
    var subjEl = document.getElementById('p-crm-subject');
    var imgEl = document.getElementById('p-crm-img');
    var vp = document.getElementById('p-crm-viewport');
    if (subjEl) subjEl.textContent = item.subject;
    if (imgEl) {
      if (typeof window.smoothImageCrossfade === 'function') window.smoothImageCrossfade(imgEl, item.file);
      else imgEl.src = item.file;
    }
    if (vp) vp.scrollTop = 0;
  };

  window.scrollPortraitCrm = function (pos) {
    var vp = document.getElementById('p-crm-viewport');
    if (!vp) return;
    var maxScroll = Math.max(0, vp.scrollHeight - vp.clientHeight);
    var top = pos === 'top' ? 0 : (pos === 'mid' ? maxScroll * 0.48 : maxScroll);
    vp.scrollTo({ top: top, behavior: 'smooth' });
  };

  window.openIsolatedCrmReader = function () {
    var item = (window.crmEmails || {})[activeCrmKey];
    var modal = document.getElementById('p-crm-reader-modal');
    var img = document.getElementById('p-crm-reader-img');
    var title = document.getElementById('p-crm-reader-title');
    if (!item || !modal) return;
    if (title) title.textContent = item.title;
    if (img) img.src = item.native || item.file;
    modal.classList.add('is-open');
    var scroller = modal.querySelector('.p-crm-reader-scroll');
    if (scroller) scroller.scrollTop = 0;
  };

  window.closeIsolatedCrmReader = function () {
    document.getElementById('p-crm-reader-modal')?.classList.remove('is-open');
  };

  /* ========================================================================
     SECTOR 08 // 3D FLIPPABLE STUDIO PRESS-PASS & SWIPEABLE CAREER DECK
     ======================================================================== */
  var CAREER_ROLES = [
    {
      date: 'NOV 2021 — PRESENT // 5 YRS · LEAD ROLE',
      title: 'Lead Graphic Designer',
      org: 'eGolf Megastore • Dubai, UAE',
      desc: 'Sole creative lead directing GCC retail seasons (Black Friday, Ramadan, The Open), delivering 250+ omnichannel storefront sliders, 9:16 social reels, 5,000px CRM dispatches, and in-store 3D activations.',
      brands: ['Nike Golf', 'TaylorMade', 'Callaway', 'PUMA', 'BOSS', 'G/FORE', 'PXG', 'Vessel']
    },
    {
      date: '2019 — 2022 // SCENOGRAPHY & PRESS',
      title: 'Creative Event Assistant',
      org: 'FDCI Fashion Week • New Delhi, India',
      desc: 'Directed backstage runway scenography, VIP press coordination, and spatial exhibition staging for national couture showcases and designer installations.',
      brands: ['Stage Scenography', 'VIP Press', 'Runway Art Direction']
    },
    {
      date: '2019 // EXHIBITION & PRINT PRODUCTION',
      title: 'Graphic Design Intern',
      org: 'NCDPD • New Delhi, India',
      desc: 'Executed editorial publication layout, geometric vector color separation, and offset CMYK pre-press verification for national industrial design exhibitions.',
      brands: ['CMYK Pre-Press', 'Editorial Layout', 'Vector Identity']
    }
  ];

  var careerRoleIdx = 0;

  function renderCareerRole(idx) {
    careerRoleIdx = ((idx % CAREER_ROLES.length) + CAREER_ROLES.length) % CAREER_ROLES.length;
    var role = CAREER_ROLES[careerRoleIdx];
    var dateEl = document.getElementById('p-career-date');
    var countEl = document.getElementById('p-career-count');
    var titleEl = document.getElementById('p-career-title');
    var orgEl = document.getElementById('p-career-org');
    var descEl = document.getElementById('p-career-desc');
    var crestsEl = document.getElementById('p-career-brands');

    if (dateEl) dateEl.textContent = role.date;
    if (countEl) countEl.textContent = '0' + (careerRoleIdx + 1) + ' / 0' + CAREER_ROLES.length;
    if (titleEl) titleEl.textContent = role.title;
    if (orgEl) orgEl.textContent = role.org;
    if (descEl) descEl.textContent = role.desc;
    if (crestsEl) {
      crestsEl.innerHTML = role.brands.map(function (b) {
        return '<span class="p-brand-crest">' + b + '</span>';
      }).join('');
    }

    document.querySelectorAll('#p-career-dots .p-career-dot').forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === careerRoleIdx);
    });
  }

  function initCareerDeckGestures() {
    var deck = document.getElementById('p-career-deck');
    if (!deck) return;
    var sx = 0, sy = 0;
    deck.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      }
    }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      if (!sx || !e.changedTouches || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
        renderCareerRole(careerRoleIdx + (dx < 0 ? 1 : -1));
      }
      sx = 0;
    }, { passive: true });
    renderCareerRole(0);
  }

  window.selectCareerRole = function (idx) {
    renderCareerRole(idx);
  };

  window.stepCareerRole = function (delta) {
    renderCareerRole(careerRoleIdx + delta);
  };

  window.flipStudioPass = function (forceState) {
    var card = document.getElementById('p-studio-pass-card');
    if (!card) return;
    if (typeof forceState === 'boolean') card.classList.toggle('is-flipped', forceState);
    else card.classList.toggle('is-flipped');
  };

  window.downloadIreneVCard = function (btn) {
    var vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Thomas;Irene;;;',
      'FN:Irene Thomas',
      'TITLE:Lead Graphic Designer & Art Director',
      'ORG:eGolf Megastore Dubai',
      'TEL;TYPE=CELL:+971563482737',
      'EMAIL;TYPE=INTERNET:irene28thomas@gmail.com',
      'ADR;TYPE=HOME:;;Al Khail Gate;Dubai;;UAE',
      'END:VCARD'
    ].join('\r\n');

    var blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Irene_Thomas_Art_Director.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    if (btn) {
      var prev = btn.textContent;
      btn.textContent = '✓ SAVED';
      window.setTimeout(function () { btn.textContent = prev; }, 2200);
    }
  };

  window.copyIreneEmail = function (btn) {
    var email = 'irene28thomas@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () {
        if (btn) {
          var prev = btn.textContent;
          btn.textContent = '✓ COPIED';
          window.setTimeout(function () {
            btn.textContent = prev || '✉ EMAIL';
          }, 2000);
        }
      }).catch(function () {
        window.location.href = 'mailto:' + email;
      });
    } else {
      window.location.href = 'mailto:' + email;
    }
  };

  function initActiveDossierPatchwork() {
    var resume = document.getElementById('resume');
    if (!resume) return;

    var patchSelector = '.p-dossier-masthead, .p-dossier-summary, .p-kpi-box, .p-role-card, .p-arsenal-row, .p-edu-card, .p-dossier-seal';
    var patches = Array.prototype.slice.call(resume.querySelectorAll(patchSelector));
    if (!patches.length) return;

    // Quilt background lives inside #p-atelier-resume-scroll for zero-lag native compositor scrolling.
    // Highlight changes only on direct tap/click so scroll frames perform zero layout or repaint work.
    var activePatch = patches[0];
    if (activePatch) activePatch.classList.add('is-active-patch');

    resume.addEventListener('click', function (e) {
      var target = e.target && e.target.closest ? e.target.closest(patchSelector) : null;
      if (!target || !resume.contains(target) || target === activePatch) return;
      for (var j = 0; j < patches.length; j++) {
        patches[j].classList.remove('is-active-patch');
      }
      target.classList.add('is-active-patch');
      activePatch = target;
    });
  }

  // Expose legacy/public hooks
  window.selectPortraitSpread = selectPortraitSpread;
  window.stepPortraitManual = stepPortraitManual;

  function bootWidgets() {
    initCoverWindow();
    initLightTable();
    renderManualThumbs();
    initManualStageInteractions();
    selectPortraitSpread(0);
    initLandingMinimap();
    initConveyorLanes();
    initReelCinemaCarousel();
    initStoryboardLoupe();
    renderPosterDeck();
    initTotemAndAiLab();
    initCareerDeckGestures();
    initActiveDossierPatchwork();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootWidgets);
  } else {
    bootWidgets();
  }
})();
