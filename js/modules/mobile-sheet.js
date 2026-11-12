// =========================================================
// PHASE 3: MOBILE 2D LOOKBOOK, SCRUBBER CAPSULE & HASH ROUTER
// =========================================================
(function () {
  let lastActiveChapterIdx = 0;
  let isProgrammaticScroll = false;
  let programmaticScrollTimer = null;
  let scrollSettleTimer = null;
  let burnFlashTimer = null;

  function getSectors() {
    return window.dockSectors || (typeof dockSectors !== 'undefined' ? dockSectors : []);
  }

  function isMobileLookbookActive() {
    const isMob = window.AtelierMode
      ? window.AtelierMode.isMobile()
      : document.documentElement.dataset.mode === 'mobile';
    return isMob && !document.documentElement.classList.contains('lookbook-vertical-fallback');
  }

  function getLookbookRoot() {
    return document.getElementById('portfolio-lookbook-root');
  }

  function getChapterElements() {
    return Array.from(document.querySelectorAll('.lookbook-chapter'));
  }

  // Resolve sector id, hash (#03-brand), chapter id (chapter-03), code ('03'), or index (0..7)
  function resolveChapterIndex(query) {
    const list = getSectors();
    if (!list.length) return -1;
    if (typeof query === 'number' && !Number.isNaN(query)) {
      return Math.max(0, Math.min(list.length - 1, query));
    }
    if (!query || typeof query !== 'string') return -1;
    const clean = query.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return -1;

    // Aliases for contact / credentials / dossier
    if (clean === 'contact' || clean === 'dossier' || clean === 'credentials' || clean === 'cv') {
      return list.length - 1;
    }

    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (
        (s.id && s.id.toLowerCase() === clean) ||
        (s.hash && s.hash.toLowerCase() === clean) ||
        (s.chapterId && s.chapterId.toLowerCase() === clean) ||
        (s.code && s.code.toLowerCase() === clean) ||
        (s.shortName && s.shortName.toLowerCase() === clean)
      ) {
        return i;
      }
    }

    // Match leading 2-digit prefix like "03-..."
    const prefixMatch = clean.match(/^0?([1-8])\b/);
    if (prefixMatch) {
      const idx = parseInt(prefixMatch[1], 10) - 1;
      if (idx >= 0 && idx < list.length) return idx;
    }

    return -1;
  }

  // Short one-shot paper-burn transition on chapter change (never scroll-scrubbed on mobile)
  function triggerOneShotChapterBurn(direction = 1) {
    if (!isMobileLookbookActive()) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let flashEl = document.getElementById('mobile-chapter-burn-flash');
    if (!flashEl) {
      flashEl = document.createElement('div');
      flashEl.id = 'mobile-chapter-burn-flash';
      flashEl.className = 'mobile-chapter-burn-flash';
      flashEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(flashEl);
    }

    flashEl.style.background =
      direction >= 0
        ? 'radial-gradient(120% 80% at 88% 88%, rgba(255, 196, 112, 0.36) 0%, rgba(216, 78, 41, 0.30) 28%, rgba(30, 14, 8, 0.18) 54%, transparent 78%)'
        : 'radial-gradient(120% 80% at 12% 88%, rgba(255, 196, 112, 0.36) 0%, rgba(216, 78, 41, 0.30) 28%, rgba(30, 14, 8, 0.18) 54%, transparent 78%)';

    flashEl.classList.add('is-burning');

    if (window.BurningPaperEngine && typeof window.BurningPaperEngine.setScrollProgress === 'function') {
      window.BurningPaperEngine.setScrollProgress(0.42, 0);
      setTimeout(() => {
        if (window.BurningPaperEngine && typeof window.BurningPaperEngine.setScrollProgress === 'function') {
          window.BurningPaperEngine.setScrollProgress(0, 0);
        }
      }, 280);
    }

    clearTimeout(burnFlashTimer);
    burnFlashTimer = setTimeout(() => {
      if (flashEl) flashEl.classList.remove('is-burning');
    }, 360);
  }

  function syncActiveChapterUI(idx, options = {}) {
    const list = getSectors();
    if (!list.length) return;
    const clampedIdx = Math.max(0, Math.min(list.length - 1, idx));
    const sec = list[clampedIdx];
    const prevIdx = lastActiveChapterIdx;
    const changed = clampedIdx !== prevIdx;

    lastActiveChapterIdx = clampedIdx;
    window.currentSectorIndex = clampedIdx;

    const totalStr = String(list.length).padStart(2, '0');
    const overallPct = ((clampedIdx + 1) / list.length) * 100;
    const themeMode = sec.theme || (clampedIdx >= 4 && clampedIdx <= 6 ? 'dark' : 'light');

    if (window.PinnedBurnEngine && typeof window.PinnedBurnEngine.updatePortfolioNav === 'function') {
      window.PinnedBurnEngine.updatePortfolioNav(sec.id, themeMode, overallPct);
    } else {
      document.body.classList.toggle('theme-dark-cinema', themeMode === 'dark');
    }

    // Ensure capsule scrubber readout is always in "01 / 08" format
    const capNum = document.getElementById('thumb-cap-num');
    const capTitle = document.getElementById('thumb-cap-title');
    const capFill = document.getElementById('thumb-cap-scrubber-fill');
    if (capNum) capNum.innerText = `${sec.code} / ${totalStr}`;
    if (capTitle) capTitle.innerText = sec.shortName || sec.name;
    if (capFill) capFill.style.width = `${overallPct.toFixed(1)}%`;

    // Mark active chapter DOM element and coordinate video playback on mobile
    const chapters = getChapterElements();
    chapters.forEach((ch, cIdx) => {
      const isActive = cIdx === clampedIdx;
      ch.classList.toggle('is-active-chapter', isActive);
      if (isMobileLookbookActive()) {
        const videos = ch.querySelectorAll('video');
        if (!isActive) {
          videos.forEach(v => {
            if (!v.paused) {
              try { v.pause(); } catch (_) {}
            }
          });
        } else {
          let playedOne = false;
          videos.forEach(v => {
            if (v.hasAttribute('autoplay') && !playedOne) {
              playedOne = true;
              try { v.play().catch(() => {}); } catch (_) {}
            } else if (!v.paused) {
              try { v.pause(); } catch (_) {}
            }
          });
        }
      }
    });

    // Trigger short one-shot paper burn on mobile chapter change
    if (changed && options.triggerBurn !== false && isMobileLookbookActive()) {
      triggerOneShotChapterBurn(clampedIdx > prevIdx ? 1 : -1);
    }

    // Update URL hash (#01-overview .. #08-credentials)
    if (options.updateHash && sec.hash) {
      const targetHash = `#${sec.hash}`;
      if (window.location.hash !== targetHash) {
        try {
          if (options.replaceState) {
            history.replaceState({ chapterIdx: clampedIdx, hash: sec.hash }, '', targetHash);
          } else {
            history.pushState({ chapterIdx: clampedIdx, hash: sec.hash }, '', targetHash);
          }
        } catch (err) {
          window.location.hash = targetHash;
        }
      }
    }
  }

  function goToChapter(targetIdx, options = {}) {
    const list = getSectors();
    if (!list.length) return;
    const idx = Math.max(0, Math.min(list.length - 1, targetIdx));
    const sec = list[idx];
    const smooth = options.smooth !== false;
    const updateHash = options.updateHash !== false;

    if (isMobileLookbookActive()) {
      const root = getLookbookRoot();
      const chapters = getChapterElements();
      const targetEl = chapters[idx] || document.getElementById(sec.chapterId);

      isProgrammaticScroll = true;
      clearTimeout(programmaticScrollTimer);

      syncActiveChapterUI(idx, {
        updateHash,
        replaceState: Boolean(options.replaceState),
        triggerBurn: options.triggerBurn !== false
      });

      if (root && targetEl) {
        const targetLeft = targetEl.offsetLeft;
        root.scrollTo({
          left: targetLeft,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }

      programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll = false;
      }, smooth ? 480 : 80);
    } else if (
      window.AtelierMode &&
      window.AtelierMode.isDesktop() &&
      window.PinnedBurnEngine &&
      typeof window.PinnedBurnEngine.getSectorTargetY === 'function'
    ) {
      const y = window.PinnedBurnEngine.getSectorTargetY(sec.id);
      window.PinnedBurnEngine.setTargetY(y);
      if (updateHash && sec.hash) {
        try {
          history.pushState({ chapterIdx: idx, hash: sec.hash }, '', `#${sec.hash}`);
        } catch (e) {}
      }
    } else {
      // Plain vertical fallback
      const el = document.getElementById(sec.id) || document.getElementById(sec.chapterId);
      if (el) {
        el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      }
      syncActiveChapterUI(idx, { updateHash, triggerBurn: false });
    }
  }

  function goToSector(sectorOrHash, options = {}) {
    const idx = resolveChapterIndex(sectorOrHash);
    if (idx !== -1) {
      goToChapter(idx, options);
    }
  }

  function jumpToAdjacentSector(delta) {
    const list = getSectors();
    if (!list.length) return;
    const curr = typeof window.currentSectorIndex === 'number' ? window.currentSectorIndex : lastActiveChapterIdx;
    const newIndex = Math.max(0, Math.min(list.length - 1, curr + delta));
    if (newIndex !== curr) {
      if (isMobileLookbookActive()) {
        goToChapter(newIndex, { smooth: true, updateHash: true, triggerBurn: true });
      } else if (typeof window.handleRailClick === 'function') {
        window.handleRailClick(null, list[newIndex].id);
      }
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

  function closeMobileSectorSheet() {
    const sheet = document.getElementById('mobile-sector-sheet');
    if (sheet) sheet.classList.remove('is-open');
  }

  function renderMobileSectorSheetList() {
    const listContainer = document.getElementById('sheet-sectors-list');
    const list = getSectors();
    if (!listContainer || !list.length) return;
    const activeIdx = typeof window.currentSectorIndex === 'number' ? window.currentSectorIndex : lastActiveChapterIdx;
    const totalStr = String(list.length).padStart(2, '0');

    listContainer.innerHTML = '';
    list.forEach((sec, idx) => {
      const row = document.createElement('a');
      row.href = `#${sec.hash || sec.id}`;
      row.className = 'sheet-sector-row' + (idx === activeIdx ? ' active' : '');
      row.setAttribute('data-chapter-idx', String(idx));
      row.onclick = (e) => {
        e.preventDefault();
        closeMobileSectorSheet();
        goToChapter(idx, { smooth: true, updateHash: true, triggerBurn: true });
      };
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="sheet-row-code">${sec.code} / ${totalStr}</span>
          <div>
            <div class="sheet-row-name">${sec.name}</div>
          </div>
        </div>
        <span class="sheet-row-badge">${idx === activeIdx ? '● ACTIVE' : 'SWIPE / TAP ↗'}</span>
      `;
      listContainer.appendChild(row);
    });
  }

  // Attach native horizontal scroll tracking & interactive capsule scrubbing
  function initLookbookListeners() {
    const root = getLookbookRoot();

    // 1. Health check: degrade to vertical fallback only if scroll-snap is unsupported
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
      if (!CSS.supports('scroll-snap-type', 'x mandatory') && !CSS.supports('-webkit-scroll-snap-type', 'x mandatory')) {
        document.documentElement.classList.add('lookbook-vertical-fallback');
      }
    }

    // 2. Native horizontal scroll listener on #portfolio-lookbook-root
    if (root) {
      let ticking = false;
      root.addEventListener(
        'scroll',
        () => {
          if (!isMobileLookbookActive()) return;
          if (!ticking) {
            requestAnimationFrame(() => {
              ticking = false;
              const cw = Math.max(1, root.clientWidth);
              const rawIdx = Math.round(root.scrollLeft / cw);
              const list = getSectors();
              const idx = Math.max(0, Math.min(list.length - 1, rawIdx));
              if (!isProgrammaticScroll && idx !== lastActiveChapterIdx) {
                syncActiveChapterUI(idx, { updateHash: false, triggerBurn: true });
              }
            });
            ticking = true;
          }

          clearTimeout(scrollSettleTimer);
          scrollSettleTimer = setTimeout(() => {
            if (!isMobileLookbookActive() || isProgrammaticScroll) return;
            const cw = Math.max(1, root.clientWidth);
            const idx = Math.max(0, Math.min(getSectors().length - 1, Math.round(root.scrollLeft / cw)));
            syncActiveChapterUI(idx, { updateHash: true, triggerBurn: false });
          }, 150);
        },
        { passive: true }
      );
    }

    // 3. Interactive horizontal drag-scrubbing on #thumb-cap-core (with tap-to-open index)
    const capCore = document.getElementById('thumb-cap-core');
    if (capCore) {
      let scrubActive = false;
      let pointerDown = false;
      let startX = 0;
      let suppressNextClick = false;

      // Capture click if user dragged the scrubber so sheet doesn't pop open after scrubbing
      capCore.addEventListener(
        'click',
        (e) => {
          if (suppressNextClick) {
            e.preventDefault();
            e.stopPropagation();
            suppressNextClick = false;
          }
        },
        true
      );

      const scrubToClientX = (clientX) => {
        const rect = capCore.getBoundingClientRect();
        const list = getSectors();
        if (!rect.width || !list.length) return;
        const ratio = Math.max(0, Math.min(0.999, (clientX - rect.left) / rect.width));
        const targetIdx = Math.floor(ratio * list.length);
        if (targetIdx !== lastActiveChapterIdx) {
          goToChapter(targetIdx, { smooth: false, updateHash: false, triggerBurn: true });
        }
      };

      capCore.addEventListener('pointerdown', (e) => {
        if (!isMobileLookbookActive()) return;
        pointerDown = true;
        scrubActive = false;
        startX = e.clientX;
        if (capCore.setPointerCapture) {
          try {
            capCore.setPointerCapture(e.pointerId);
          } catch (err) {}
        }
      });

      capCore.addEventListener('pointermove', (e) => {
        if (!pointerDown || !isMobileLookbookActive()) return;
        const dx = e.clientX - startX;
        if (!scrubActive && Math.abs(dx) >= 10) {
          scrubActive = true;
          suppressNextClick = true;
          capCore.classList.add('is-scrubbing');
        }
        if (scrubActive) {
          scrubToClientX(e.clientX);
        }
      });

      const endScrub = () => {
        if (!pointerDown) return;
        pointerDown = false;
        if (scrubActive) {
          scrubActive = false;
          capCore.classList.remove('is-scrubbing');
          syncActiveChapterUI(lastActiveChapterIdx, { updateHash: true, triggerBurn: false });
          setTimeout(() => {
            suppressNextClick = false;
          }, 80);
        }
      };

      capCore.addEventListener('pointerup', endScrub);
      capCore.addEventListener('pointercancel', endScrub);
    }

    // 4. Intercept anchor clicks to #01-overview .. #08-credentials / #contact / #resume / etc.
    document.addEventListener('click', (e) => {
      const link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const idx = resolveChapterIndex(href);
      if (idx !== -1) {
        e.preventDefault();
        closeMobileSectorSheet();
        goToChapter(idx, { smooth: true, updateHash: true, triggerBurn: true });
      }
    });

    // 5. Handle browser Back / Forward buttons and URL hash changes
    const handleHashOrPopState = () => {
      const hash = window.location.hash;
      if (!hash) {
        if (isMobileLookbookActive()) {
          goToChapter(0, { smooth: true, updateHash: false, triggerBurn: true });
        }
        return;
      }
      const idx = resolveChapterIndex(hash);
      if (idx !== -1) {
        goToChapter(idx, { smooth: true, updateHash: false, triggerBurn: true });
      }
    };

    window.addEventListener('popstate', handleHashOrPopState);
    window.addEventListener('hashchange', handleHashOrPopState);

    // 6. Re-sync when switching between mobile and desktop modes
    window.addEventListener('atelier:modechange', () => {
      if (isMobileLookbookActive()) {
        goToChapter(lastActiveChapterIdx, { smooth: false, updateHash: false, triggerBurn: false });
      }
    });

    // 7. Initial sync on load (respect initial hash if present, else Chapter 01)
    const initialIdx = window.location.hash ? resolveChapterIndex(window.location.hash) : 0;
    const startIdx = initialIdx !== -1 ? initialIdx : 0;
    syncActiveChapterUI(startIdx, { updateHash: false, triggerBurn: false });
    if (startIdx > 0) {
      setTimeout(() => {
        goToChapter(startIdx, { smooth: false, updateHash: false, triggerBurn: false });
      }, 60);
    }

    // 8. Viewport IntersectionObserver to lazy-initialize chapters and pause off-screen media
    if (typeof IntersectionObserver !== 'undefined' && root) {
      const chapterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const ch = entry.target;
            const isNear = entry.isIntersecting;
            ch.classList.toggle('is-near-viewport', isNear);

            if (!isNear && isMobileLookbookActive()) {
              // Pause all media inside off-screen chapters immediately
              const vids = ch.querySelectorAll('video');
              vids.forEach((v) => {
                if (!v.paused) {
                  try { v.pause(); } catch (_) {}
                }
              });
            }
          });
        },
        {
          root: root,
          rootMargin: '0px 100% 0px 100%', // Preload next/prev chapter within 1 viewport width
          threshold: [0, 0.1, 0.5]
        }
      );

      getChapterElements().forEach((ch) => chapterObserver.observe(ch));
    }
  }

  // Desktop-only touch swipe for Nivara 13-Spread Manual (disabled on mobile so horizontal swipe strictly changes chapters)
  (function initManualTouchSwipe() {
    const stage = document.querySelector('.manual-spread-stage-wrap');
    if (!stage) return;
    let startX = 0;
    let startY = 0;
    stage.addEventListener(
      'touchstart',
      (e) => {
        if (window.AtelierMode && window.AtelierMode.isMobile()) return;
        if (!e.touches || !e.touches[0]) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );
    stage.addEventListener(
      'touchend',
      (e) => {
        if (window.AtelierMode && window.AtelierMode.isMobile()) return;
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const diffX = e.changedTouches[0].clientX - startX;
        const diffY = e.changedTouches[0].clientY - startY;
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            if (typeof stepManualSpread === 'function') stepManualSpread(1);
          } else {
            if (typeof stepManualSpread === 'function') stepManualSpread(-1);
          }
        }
      },
      { passive: true }
    );
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLookbookListeners);
  } else {
    initLookbookListeners();
  }

  window.Lookbook2D = {
    goToChapter,
    goToSector,
    resolveChapterIndex,
    syncActiveChapterUI,
    triggerOneShotChapterBurn,
    isMobileLookbookActive
  };

  window.goToChapter = goToChapter;
  window.goToSector = goToSector;
  window.jumpToAdjacentSector = jumpToAdjacentSector;
  window.toggleMobileSectorSheet = toggleMobileSectorSheet;
  window.closeMobileSectorSheet = closeMobileSectorSheet;
  window.renderMobileSectorSheetList = renderMobileSectorSheetList;
})();
