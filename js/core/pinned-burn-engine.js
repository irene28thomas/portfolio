// =========================================================================
// 8-SECTION PINNED MULTI-HOLE BURN SCROLL ENGINE FOR PORTFOLIO
// Inverted Themes: Light (Sec 1-4 & 8), Dark Noir (Sec 5-7)
// High-Performance Smooth Burn with Fluid Momentum Touch & Precision Nav
// =========================================================================

(function initPinnedBurnEngine() {
  const layer14 = document.getElementById('layer-1-4');
  const track14 = document.getElementById('track-1-4');
  const layer57 = document.getElementById('layer-5-7');
  const track57 = document.getElementById('track-5-7');
  const layer8  = document.getElementById('layer-8');
  const track8  = document.getElementById('track-8');

  const maskEl         = document.getElementById('silver-palace-burn-mask');
  const maskIntactBody = document.getElementById('mask-intact-body');
  const maskMultiHoles = document.getElementById('mask-multi-holes');
  const noiseOffsetEl  = document.getElementById('burn-noise-offset');
  const turbMain       = document.getElementById('burn-turb-main');
  const turbFine       = document.getElementById('burn-turb-fine');

  if (!layer14 || !track14 || !layer57 || !track57 || !layer8 || !track8 || !maskEl) {
    console.warn('[PinnedBurnEngine] Required layer or mask elements missing.');
    return;
  }

  // Pre-seed 68 multi-hole paper perforation/island descriptors
  const NUM_HOLES = 68;
  const holes = [];
  for (let i = 0; i < NUM_HOLES; i++) {
    holes.push({
      normX: (i / (NUM_HOLES - 1)),
      phaseY: i * 1.6180339887 * Math.PI,
      phaseR: i * 2.41421356 * Math.PI,
      speedY: 1.15 + (i % 7) * 0.22,
      speedR: 1.45 + (i % 5) * 0.28,
      maxRadius: 10 + (i % 6) * 7.5,
      bandOffset: ((i % 9) - 4) * 15.0,
      isCutoutHole: i % 2 === 0
    });
  }

  // Pre-instantiate SVG circle elements in maskMultiHoles once to eliminate per-frame innerHTML thrashing
  const cachedHoleEls = [];
  maskMultiHoles.innerHTML = '';
  const holeFrag = document.createDocumentFragment();
  for (let i = 0; i < NUM_HOLES; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('fill', holes[i].isCutoutHole ? 'black' : 'white');
    c.setAttribute('cx', '-999');
    c.setAttribute('cy', '-999');
    c.setAttribute('r', '0');
    holeFrag.appendChild(c);
    cachedHoleEls.push(c);
  }
  maskMultiHoles.appendChild(holeFrag);

  // Scroll timeline metrics & sector offset caching
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let isMobile = vw <= 860;
  let maxScroll14 = 0;
  let burnSpan1   = 0;
  let maxScroll57 = 0;
  let burnSpan2   = 0;
  let maxScroll8  = 0;
  let totalTimeline = 1;

  let currentY = 0;
  let targetY  = 0;

  const sectorOffsets = {
    'hero': 0,
    'stream-works': 0,
    'branding': 0,
    'ecommerce': 0,
    'section-barney': 0,
    'section-posters': 0,
    'section-promos': 0,
    'resume': 0
  };

  const spineWaypoints = [
    { id: 'hero', y: 0, top: 0 },
    { id: 'stream-works', y: 0, top: 0 },
    { id: 'branding', y: 0, top: 0 },
    { id: 'ecommerce', y: 0, top: 0 },
    { id: 'section-barney', y: 0, top: 0 },
    { id: 'section-posters', y: 0, top: 0 },
    { id: 'section-promos', y: 0, top: 0 },
    { id: 'resume', y: 0, top: 0 }
  ];

  // Viewport-framed scroll targets for every individual showcase stage across all sectors
  let stageLockTargets = [];

  function getRelTop(el, track) {
    if (!el || !track) return 0;
    return Math.max(0, el.getBoundingClientRect().top - track.getBoundingClientRect().top);
  }

  function getStageFramedLocalY(startEl, endEl, track, maxTrackScroll) {
    if (!startEl || !track) return 0;
    const tTop = track.getBoundingClientRect().top;
    const sTop = Math.max(0, startEl.getBoundingClientRect().top - tTop);
    const eBottom = endEl ? Math.max(sTop, endEl.getBoundingClientRect().bottom - tTop) : (sTop + startEl.offsetHeight);
    const stageH = eBottom - sTop;
    const navClearance = isMobile ? 64 : 74;
    const availH = vh - navClearance - 14;
    let idealY;
    if (stageH > 0 && stageH <= availH) {
      const extraPad = Math.max(12, Math.min(64, (availH - stageH) * 0.38));
      idealY = Math.max(0, sTop - navClearance - extraPad);
    } else {
      idealY = Math.max(0, sTop - navClearance);
    }
    return typeof maxTrackScroll === 'number' ? Math.min(maxTrackScroll, idealY) : idealY;
  }

  function measureLayout() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    isMobile = vw <= 860 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    maskEl.setAttribute('width', vw);
    maskEl.setAttribute('height', vh);

    // Adjust filter octaves for mobile performance
    if (turbMain) turbMain.setAttribute('numOctaves', isMobile ? '2' : '3');
    if (turbFine) turbFine.setAttribute('numOctaves', isMobile ? '1' : '2');

    maxScroll14 = Math.max(0, track14.scrollHeight - vh);
    burnSpan1   = Math.round(vh * 0.68); // Responsive pinned scroll distance for Burn #1 (Sec 4 -> Sec 5)
    maxScroll57 = Math.max(0, track57.scrollHeight - vh);
    burnSpan2   = Math.round(vh * 0.68); // Responsive pinned scroll distance for Burn #2 (Sec 7 -> Sec 8)
    maxScroll8  = Math.max(0, track8.scrollHeight - vh);

    // Measure exact viewport-framed offsets for all 8 primary sectors
    const elHero    = document.getElementById('hero');
    const elStream  = document.getElementById('stream-works');
    const elBrand   = document.getElementById('branding');
    const elBrandEnd = document.querySelector('.frame-brand-identity');
    const elEcom    = document.getElementById('ecommerce');
    const elEcomEnd = document.querySelector('#frames > .frame-browser-stage');
    const elBarney  = document.getElementById('section-barney');
    const elPosters = document.getElementById('poster-horizontal-runway') || document.getElementById('section-posters');
    const elPromos  = document.getElementById('section-promos');
    const elPromosEnd = document.querySelector('.promo-gallery-grid');
    const elResume  = document.getElementById('resume');

    sectorOffsets['hero']            = 0;
    sectorOffsets['stream-works']    = Math.max(0, getRelTop(elStream, track14) - 56);
    sectorOffsets['branding']        = getStageFramedLocalY(elBrand, elBrandEnd, track14, maxScroll14);
    sectorOffsets['ecommerce']       = getStageFramedLocalY(elEcom, elEcomEnd, track14, maxScroll14);
    sectorOffsets['section-barney']  = 0;
    sectorOffsets['section-posters'] = Math.max(0, getRelTop(elPosters, track57) - 62);
    sectorOffsets['section-promos']  = getStageFramedLocalY(elPromos, elPromosEnd, track57, maxScroll57);
    sectorOffsets['resume']          = 0;

    totalTimeline = maxScroll14 + burnSpan1 + maxScroll57 + burnSpan2 + maxScroll8;
    targetY  = Math.max(0, Math.min(totalTimeline, targetY));
    currentY = Math.max(0, Math.min(totalTimeline, currentY));

    const p1Start = maxScroll14;
    const p1End   = p1Start + burnSpan1;
    const p2Start = p1End + maxScroll57;
    const p2End   = p2Start + burnSpan2;

    // Measure exact waypoint targets and physical node center heights on the spine
    spineWaypoints[0].y = 0;
    spineWaypoints[1].y = sectorOffsets['stream-works'];
    spineWaypoints[2].y = sectorOffsets['branding'];
    spineWaypoints[3].y = sectorOffsets['ecommerce'];
    spineWaypoints[4].y = p1End;
    spineWaypoints[5].y = p1End + sectorOffsets['section-posters'];
    spineWaypoints[6].y = p1End + sectorOffsets['section-promos'];
    spineWaypoints[7].y = p2End;

    // Build complete list of viewport-framed showcase stages for magnetic auto-lock
    stageLockTargets = [
      { id: 'hero', y: 0 },
      { id: 'stream-works', y: sectorOffsets['stream-works'] },
      { id: 'branding', y: sectorOffsets['branding'] },
      {
        id: 'stage-brand-manual',
        y: getStageFramedLocalY(
          document.getElementById('stage-brand-manual'),
          document.getElementById('stage-brand-manual'),
          track14,
          maxScroll14
        )
      },
      { id: 'ecommerce', y: sectorOffsets['ecommerce'] },
      {
        id: 'stage-hardware',
        y: getStageFramedLocalY(
          document.getElementById('stage-hardware'),
          document.querySelector('.frame-app-slider-studio'),
          track14,
          maxScroll14
        )
      },
      {
        id: 'motion',
        y: getStageFramedLocalY(
          document.getElementById('motion'),
          document.querySelector('.motion-gif-grid'),
          track14,
          maxScroll14
        )
      },
      {
        id: 'stage-storefront-sliders',
        y: getStageFramedLocalY(
          document.getElementById('stage-storefront-sliders'),
          document.getElementById('device-switcher-studio'),
          track14,
          maxScroll14
        )
      },
      {
        id: 'stage-social-simulator',
        y: getStageFramedLocalY(
          document.getElementById('stage-social-simulator'),
          document.getElementById('stage-social-simulator'),
          track14,
          maxScroll14
        )
      },
      { id: 'section-barney', y: p1End },
      { id: 'section-posters', y: p1End + sectorOffsets['section-posters'] },
      { id: 'section-promos', y: p1End + sectorOffsets['section-promos'] },
      {
        id: 'stage-open-major',
        y: p1End + getStageFramedLocalY(
          document.getElementById('stage-open-major'),
          document.querySelector('.spatial-merch-showcase'),
          track57,
          maxScroll57
        )
      },
      {
        id: 'stage-ai-studio',
        y: p1End + getStageFramedLocalY(
          document.getElementById('stage-ai-studio'),
          document.querySelector('.ai-studio-grid'),
          track57,
          maxScroll57
        )
      },
      {
        id: 'stage-tri-sets',
        y: p1End + getStageFramedLocalY(
          document.getElementById('stage-tri-sets'),
          document.querySelector('.brand-tri-set-grid'),
          track57,
          maxScroll57
        )
      },
      {
        id: 'stage-crm',
        y: p1End + getStageFramedLocalY(
          document.getElementById('stage-crm'),
          document.querySelector('.frame-crm-stage'),
          track57,
          maxScroll57
        )
      },
      { id: 'resume', y: p2End }
    ];

    const spineTrackEl = document.getElementById('grounded-spine-track');
    if (spineTrackEl) {
      const sRect = spineTrackEl.getBoundingClientRect();
      const sHeight = sRect.height || 400;
      spineWaypoints.forEach(wp => {
        const nodeEl = document.querySelector(`.grounded-nav-node[data-sector="${wp.id}"]`);
        if (nodeEl) {
          const nr = nodeEl.getBoundingClientRect();
          wp.top = Math.max(0, Math.min(sHeight, (nr.top + nr.height / 2) - sRect.top));
        }
      });
    }
  }

  // Waypoint-accurate interpolation for the timeline progress line
  function getSpineProgressPx(currY) {
    const spineTrackEl = document.getElementById('grounded-spine-track');
    if (!spineTrackEl) return 0;
    const sHeight = spineTrackEl.offsetHeight || 400;

    if (currY <= spineWaypoints[0].y) {
      return spineWaypoints[0].top;
    }

    for (let i = 0; i < spineWaypoints.length - 1; i++) {
      const w1 = spineWaypoints[i];
      const w2 = spineWaypoints[i + 1];
      if (currY >= w1.y && currY < w2.y) {
        const span = Math.max(1, w2.y - w1.y);
        const frac = Math.max(0, Math.min(1, (currY - w1.y) / span));
        return w1.top + frac * (w2.top - w1.top);
      }
    }

    const lastW = spineWaypoints[spineWaypoints.length - 1];
    const remY = Math.max(1, totalTimeline - lastW.y);
    const frac = Math.max(0, Math.min(1, (currY - lastW.y) / remY));
    return lastW.top + frac * (sHeight - lastW.top);
  }

  // Inverse interpolation for scrubbing / clicking directly on the timeline spine
  function getYFromSpinePx(clickTop) {
    const spineTrackEl = document.getElementById('grounded-spine-track');
    if (!spineTrackEl) return 0;
    const sHeight = spineTrackEl.offsetHeight || 400;

    if (clickTop <= spineWaypoints[0].top) {
      return 0;
    }

    for (let i = 0; i < spineWaypoints.length - 1; i++) {
      const w1 = spineWaypoints[i];
      const w2 = spineWaypoints[i + 1];
      if (clickTop >= w1.top && clickTop < w2.top) {
        const span = Math.max(1, w2.top - w1.top);
        const frac = Math.max(0, Math.min(1, (clickTop - w1.top) / span));
        return w1.y + frac * (w2.y - w1.y);
      }
    }

    const lastW = spineWaypoints[spineWaypoints.length - 1];
    const remTop = Math.max(1, sHeight - lastW.top);
    const frac = Math.max(0, Math.min(1, (clickTop - lastW.top) / remTop));
    return lastW.y + frac * (totalTimeline - lastW.y);
  }

  window.addEventListener('resize', measureLayout);
  track14.addEventListener('load', measureLayout, true);
  track57.addEventListener('load', measureLayout, true);
  track8.addEventListener('load', measureLayout, true);
  if (typeof ResizeObserver !== 'undefined') {
    const trackRo = new ResizeObserver(() => measureLayout());
    trackRo.observe(track14);
    trackRo.observe(track57);
    trackRo.observe(track8);
  }
  measureLayout();

  // =========================================================================
  // BUILD LIVE-MOVING MULTI-HOLE PAPER MASK GEOMETRY
  // direction: 'bottom-to-top' (Sec 4 -> Sec 5) or 'top-to-bottom' (Sec 7 -> Sec 8)
  // progress: 0.0 -> 1.0
  // =========================================================================
  function updateLiveBurnMask(direction, progress, timeSec) {
    if (!noiseOffsetEl || !maskIntactBody || !maskMultiHoles) return;

    // Continuous non-repeating harmonic trigonometric motion (no modulo, no wrapping, zero jump)
    const dx = Math.sin(timeSec * 0.37) * 75.0 + Math.sin(timeSec * 0.83) * 35.0 + Math.cos(timeSec * 0.19) * 20.0;
    const dy = (direction === 'bottom-to-top' ? -1 : 1) * (
      Math.cos(timeSec * 0.41) * 75.0 + Math.cos(timeSec * 0.91) * 35.0 + Math.sin(timeSec * 0.23) * 20.0
    );
    noiseOffsetEl.setAttribute('dx', dx.toFixed(1));
    noiseOffsetEl.setAttribute('dy', dy.toFixed(1));

    // Generous margin ensures the wave and paper fibers enter and exit completely clear of the viewport
    const margin = 280;
    let boundaryY;
    if (direction === 'bottom-to-top') {
      boundaryY = (vh + margin) - progress * (vh + margin * 2);
    } else {
      boundaryY = -margin + progress * (vh + margin * 2);
    }

    // Undulating paper tear wave along boundaryY
    const segments = 48;
    const padX = 220;
    const spanX = vw + padX * 2;
    const wavePts = [];

    for (let i = 0; i <= segments; i++) {
      const frac = i / segments;
      const x = -padX + frac * spanX;
      const wave =
          Math.sin(frac * 7.5 + timeSec * 1.8) * 20.0
        + Math.cos(frac * 14.0 - timeSec * 2.3) * 12.0
        + Math.sin(frac * 27.0 + timeSec * 3.4) * 7.0;
      const y = boundaryY + wave;
      wavePts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }

    // Construct intact paper polygon
    let pathD = '';
    if (direction === 'bottom-to-top') {
      pathD = `M ${-padX},-350 L ${vw + padX},-350 L ${wavePts[segments]} `;
      for (let i = segments - 1; i >= 0; i--) {
        pathD += `L ${wavePts[i]} `;
      }
      pathD += 'Z';
    } else {
      pathD = `M ${wavePts[0]} `;
      for (let i = 1; i <= segments; i++) {
        pathD += `L ${wavePts[i]} `;
      }
      pathD += `L ${vw + padX},${vh + 350} L ${-padX},${vh + 350} Z`;
    }
    maskIntactBody.setAttribute('d', pathD);

    // Smooth edge taper: holes start at radius 0, expand during burn, and taper to 0 at completion
    // This guarantees zero sudden appearance or popping of holes at the viewport edges
    const clampedProg = Math.max(0, Math.min(1, progress));
    const edgeTaper = Math.sin(clampedProg * Math.PI);
    const holeScale = Math.min(1, edgeTaper * 2.2);

    const activeCount = isMobile ? 32 : NUM_HOLES;
    for (let i = 0; i < NUM_HOLES; i++) {
      const circleEl = cachedHoleEls[i];
      if (i >= activeCount || holeScale <= 0.001) {
        circleEl.setAttribute('r', '0');
        continue;
      }
      const h = holes[i];
      const driftX = Math.sin(timeSec * 0.8 + h.phaseY) * 24.0;
      const cx = h.normX * (vw + 80) - 40 + driftX;

      const localWave =
          Math.sin(h.normX * 7.5 + timeSec * 1.8) * 20.0
        + Math.cos(h.normX * 14.0 - timeSec * 2.3) * 12.0;

      const boilOffset = (Math.sin(timeSec * h.speedY + h.phaseY) * 32.0 + h.bandOffset) * holeScale;
      const cy = boundaryY + localWave + boilOffset;

      const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(timeSec * h.speedR + h.phaseR));
      const r = h.maxRadius * pulse * holeScale;

      circleEl.setAttribute('cx', cx.toFixed(1));
      circleEl.setAttribute('cy', cy.toFixed(1));
      circleEl.setAttribute('r', r.toFixed(1));
    }
  }

  // =========================================================================
  // SECTOR NAVIGATION COORDINATION & TARGET CALCULATION
  // =========================================================================
  function getSectorTargetY(sectorId) {
    measureLayout();
    const p1Start = maxScroll14;
    const p1End   = p1Start + burnSpan1;
    const p2Start = p1End + maxScroll57;
    const p2End   = p2Start + burnSpan2;

    switch (sectorId) {
      case 'hero':
        return 0;
      case 'stream-works':
        return Math.min(p1Start, sectorOffsets['stream-works']);
      case 'branding':
        return Math.min(p1Start, sectorOffsets['branding']);
      case 'ecommerce':
        return Math.min(p1Start, sectorOffsets['ecommerce']);
      case 'section-barney':
        return p1End;
      case 'section-posters':
        return Math.min(p2Start, p1End + sectorOffsets['section-posters']);
      case 'section-promos':
        return Math.min(p2Start, p1End + sectorOffsets['section-promos']);
      case 'resume':
        return p2End;
      default:
        return 0;
    }
  }

  // Override handleRailClick to drive our virtual scroll engine
  window.handleRailClick = function(e, sectorId) {
    if (e && e.preventDefault) e.preventDefault();
    targetY = getSectorTargetY(sectorId);
    if (typeof playUiSound === 'function') {
      playUiSound(900, 'triangle', 0.08);
    }
  };

  // Update navigation UI & theme
  let currentTheme = '';
  let currentSectorId = '';

  function updatePortfolioNav(activeSectorId, themeMode, overallPct) {
    // 1. Theme toggle: 'dark' adds theme-dark-cinema, 'light' removes it
    if (themeMode !== currentTheme) {
      currentTheme = themeMode;
      if (themeMode === 'dark') {
        document.body.classList.add('theme-dark-cinema');
      } else {
        document.body.classList.remove('theme-dark-cinema');
      }
    }

    // 2. Active sector navigation node
    if (activeSectorId !== currentSectorId) {
      currentSectorId = activeSectorId;
      document.querySelectorAll('.grounded-nav-node').forEach(node => {
        const sec = node.getAttribute('data-sector');
        if (sec === activeSectorId) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      });

      // Align beacon with active node tick mark
      const beacon = document.getElementById('grounded-beacon');
      const spine = document.getElementById('grounded-spine-track');
      const activeNode = document.querySelector(`.grounded-nav-node[data-sector="${activeSectorId}"]`);
      if (beacon && spine && activeNode) {
        const spineRect = spine.getBoundingClientRect();
        const mark = activeNode.querySelector('.grounded-tick-mark') || activeNode;
        const markRect = mark.getBoundingClientRect();
        if (isMobile) {
          const interpLeft = (markRect.left + markRect.width / 2) - spineRect.left;
          beacon.style.left = `${interpLeft.toFixed(1)}px`;
          beacon.style.top = '-8px';
        } else {
          const interpTop = (markRect.top + markRect.height / 2) - spineRect.top;
          beacon.style.top = `${interpTop.toFixed(1)}px`;
          beacon.style.left = '-8px';
        }
      }

      // Update header sector readout & dockSectors
      const dockSectorsList = window.dockSectors || [];
      const secIdx = dockSectorsList.findIndex(s => s.id === activeSectorId);
      if (secIdx !== -1) {
        window.currentSectorIndex = secIdx;
        const secData = dockSectorsList[secIdx];
        const headerCode = document.getElementById('header-sector-code');
        const headerName = document.getElementById('header-sector-name');
        if (headerCode) headerCode.innerText = secData.code;
        if (headerName) headerName.innerText = secData.name;

        // Update mobile thumb capsule & collapsed header micro-beacon
        const capNum = document.getElementById('thumb-cap-num');
        const capTitle = document.getElementById('thumb-cap-title');
        if (capNum) capNum.innerText = secData.code;
        if (capTitle) capTitle.innerText = secData.name;
        const collapsedPillSec = document.getElementById('collapsed-pill-sector');
        if (collapsedPillSec) collapsedPillSec.innerText = `SEC ${secData.code} • ${secData.name}`;
      }
    }

    // 3. Update Progress Readouts
    const hudScrollPct = document.getElementById('hud-scroll-pct');
    const dockReach = document.getElementById('nav-dock-reach');
    const capPct = document.getElementById('thumb-cap-pct');

    const pctStr = `${Math.min(100, Math.round(overallPct))}%`;
    if (hudScrollPct) hudScrollPct.innerText = `${pctStr} REACH`;
    if (dockReach) dockReach.innerText = pctStr;
    if (capPct) capPct.innerText = pctStr;
  }

  // =========================================================================
  // STAGE METADATA FOR AMBIENT ART BACKDROP & LEFT MARGIN CURATORIAL RAIL
  // =========================================================================
  const stageMetaCatalog = {
    'hero':                     { num: '01', label: 'OVERVIEW // PORTFOLIO MONOGRAPH', art: 'assets/optimized/new_additions/PP.jpg' },
    'stream-works':             { num: '02', label: 'CONTINUUM // KINETIC ARTWORK MATRIX', art: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg' },
    'branding':                 { num: '03', label: 'NIVARA // BOTANICAL LUXURY IDENTITY', art: 'assets/optimized/Logo_Mock.jpg' },
    'stage-brand-manual':       { num: '04', label: 'NIVARA // 13-SPREAD GUIDELINES FOLIO', art: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-01.jpg' },
    'ecommerce':                { num: '05', label: 'EGOLF // FLAGSHIP STOREFRONT LAUNCH', art: 'assets/optimized/New_Arrivals_Landing_Page_V1.jpg' },
    'stage-hardware':           { num: '06', label: 'HARDWARE // TOUR EQUIPMENT LAUNCHES', art: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg' },
    'motion':                   { num: '07', label: 'KINETIC // ANIMATED RETAIL & 60FPS REEL', art: 'assets/optimized/Galvin_Green_New_Collection.gif' },
    'stage-storefront-sliders': { num: '08', label: 'OMNICHANNEL // 3-RATIO STOREFRONT SUITE', art: 'assets/optimized/new_additions/Adidas New Collection _ Slider Desktop 1920x600.jpg' },
    'stage-social-simulator':   { num: '09', label: 'SOCIAL MATRIX // META & TIKTOK DEPLOYMENT', art: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1080x1080.jpg' },
    'section-barney':           { num: '10', label: 'CINEMA STUDIO // BARNEY DALE 2D SHORT', art: 'assets/optimized/Barney_Dale__The_Cloud_story_arc.jpg' },
    'section-posters':          { num: '11', label: 'EXHIBITION // SPECTRUM OF THE MIND', art: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-01.jpg' },
    'section-promos':           { num: '12', label: 'CAMPAIGNS // VERTICAL PROMOSHEET SUITE', art: 'assets/optimized/promosheet_banners/PUMA x PTC New Collection.jpg' },
    'stage-open-major':         { num: '13', label: 'THE OPEN // 3D SPATIAL RETAIL TAKEOVER', art: 'assets/optimized/new_additions/The Open Major Offers 2026 Hanging Banner mockup.jpg' },
    'stage-ai-studio':          { num: '14', label: 'GEN-AI STUDIO // RETAIL CONCEPT STAGING', art: 'assets/optimized/new_additions/689352046_18580395709020262_5220540874800235796_n.jpg' },
    'stage-tri-sets':           { num: '15', label: 'LOOKBOOKS // LUXURY A4 POSTER TRI-SETS', art: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens Landscape.jpg' },
    'stage-crm':                { num: '16', label: 'CRM DISPATCH // 5,000PX DIRECT CAMPAIGNS', art: 'assets/optimized/new_additions/crm_vip_launch_1500w.webp' },
    'resume':                   { num: '17', label: 'EXECUTIVE DOSSIER // CREDENTIALS & C.V.', art: 'assets/optimized/new_additions/PP.jpg' }
  };

  let activeStageId = 'hero';
  let hoveredArtOverride = null;

  function applyAmbientArtToActiveLayer(artUrl) {
    if (!artUrl) return;
    const safeUrl = `url("${artUrl}")`;
    const p1Start = maxScroll14;
    const p1End   = p1Start + burnSpan1;
    const p2Start = p1End + maxScroll57;

    if (currentY <= p1End) {
      const b14 = document.getElementById('ambient-blur-14');
      const g14 = document.getElementById('ambient-ghost-14');
      if (b14 && b14.dataset.art !== artUrl) { b14.dataset.art = artUrl; b14.style.backgroundImage = safeUrl; }
      if (g14 && g14.dataset.art !== artUrl) { g14.dataset.art = artUrl; g14.style.backgroundImage = safeUrl; }
    }
    if (currentY > p1Start && currentY <= p2Start + burnSpan2) {
      const b57 = document.getElementById('ambient-blur-57');
      const g57 = document.getElementById('ambient-ghost-57');
      if (b57 && b57.dataset.art !== artUrl) { b57.dataset.art = artUrl; b57.style.backgroundImage = safeUrl; }
      if (g57 && g57.dataset.art !== artUrl) { g57.dataset.art = artUrl; g57.style.backgroundImage = safeUrl; }
    }
    if (currentY > p2Start) {
      const b8 = document.getElementById('ambient-blur-8');
      const g8 = document.getElementById('ambient-ghost-8');
      if (b8 && b8.dataset.art !== artUrl) { b8.dataset.art = artUrl; b8.style.backgroundImage = safeUrl; }
      if (g8 && g8.dataset.art !== artUrl) { g8.dataset.art = artUrl; g8.style.backgroundImage = safeUrl; }
    }
    const railImg = document.getElementById('left-rail-art-img');
    if (railImg && railImg.getAttribute('src') !== artUrl) {
      railImg.src = artUrl;
    }
  }

  function syncStageTelemetryAndAmbient(scrollPos) {
    // 1. Hybrid Collapsing Header state
    const headerEl = document.getElementById('grounded-header');
    if (headerEl && !isMobile) {
      const shouldCollapse = scrollPos > 110;
      headerEl.classList.toggle('is-collapsed', shouldCollapse);
      document.body.classList.toggle('header-is-collapsed', shouldCollapse);
    }

    // 2. Find closest stage in stageLockTargets
    let bestId = 'hero';
    let bestIdx = 0;
    let minD = Infinity;
    for (let i = 0; i < stageLockTargets.length; i++) {
      const d = Math.abs(stageLockTargets[i].y - scrollPos);
      if (d < minD) {
        minD = d;
        bestId = stageLockTargets[i].id;
        bestIdx = i;
      }
    }

    const railCoords = document.getElementById('left-rail-coords');
    if (railCoords) {
      railCoords.innerText = `Y:${String(Math.round(scrollPos)).padStart(5, '0')}`;
    }

    if (bestId !== activeStageId) {
      activeStageId = bestId;
      const meta = stageMetaCatalog[bestId] || stageMetaCatalog['hero'];
      const railCounter = document.getElementById('left-rail-stage-counter');
      const railLabel = document.getElementById('left-rail-vertical-label');
      if (railCounter) railCounter.innerText = `${String(bestIdx + 1).padStart(2, '0')} / ${stageLockTargets.length}`;
      if (railLabel) railLabel.innerText = meta.label;
      if (!hoveredArtOverride) {
        applyAmbientArtToActiveLayer(meta.art);
      }
    }
  }

  // =========================================================================
  // SCROLL CONTROL STATE: Smooth Directional Burn & Section Auto-Lock
  // =========================================================================
  let lastScrollInputTime = performance.now();
  let lastScrollDir = 1;
  let lastInnerScrollTime = 0;

  function applyScrollDelta(delta) {
    const now = performance.now();
    lastScrollInputTime = now;
    if (Math.abs(delta) > 0.5) {
      lastScrollDir = delta > 0 ? 1 : -1;
    }

    // If user scrolls up strongly, temporarily reveal collapsed header
    if (delta < -35 && !isMobile) {
      const headerEl = document.getElementById('grounded-header');
      if (headerEl) headerEl.classList.add('is-hover-open');
      document.body.classList.add('header-hover-expanded');
    } else if (delta > 25 && !isMobile && window._lastMouseY > 70) {
      const headerEl = document.getElementById('grounded-header');
      if (headerEl) headerEl.classList.remove('is-hover-open');
      document.body.classList.remove('header-hover-expanded');
    }

    const nextY = targetY + delta;
    targetY = Math.max(0, Math.min(totalTimeline, nextY));
  }

  // =========================================================================
  // MASTER 5-PHASE SCROLL & BURN STATE MACHINE (INVERTED THEMES)
  // =========================================================================
  function renderLoop(now) {
    const timeSec = now * 0.001;

    const p1Start = maxScroll14;
    const p1End   = p1Start + burnSpan1;
    const p2Start = p1End + maxScroll57;
    const p2End   = p2Start + burnSpan2;

    // Gentle Section Auto-Lock & Directional Mid-Burn Auto-Completion when user pauses scrolling
    const idleMs = now - lastScrollInputTime;
    if (!isDragging && Math.abs(touchMomentumVel) < 0.12 && idleMs > 200) {
      // A. Directional Burn Completion: completes forward when scrolling down, or backward when scrolling up
      if (targetY > p1Start && targetY < p1End) {
        const prog1 = (targetY - p1Start) / Math.max(1, burnSpan1);
        const snapBurn1 = lastScrollDir >= 0
          ? (prog1 >= 0.12 ? p1End : p1Start)
          : (prog1 <= 0.88 ? p1Start : p1End);
        targetY += (snapBurn1 - targetY) * 0.15;
        if (Math.abs(snapBurn1 - targetY) < 0.8) targetY = snapBurn1;
      } else if (targetY > p2Start && targetY < p2End) {
        const prog2 = (targetY - p2Start) / Math.max(1, burnSpan2);
        const snapBurn2 = lastScrollDir >= 0
          ? (prog2 >= 0.12 ? p2End : p2Start)
          : (prog2 <= 0.88 ? p2Start : p2End);
        targetY += (snapBurn2 - targetY) * 0.15;
        if (Math.abs(snapBurn2 - targetY) < 0.8) targetY = snapBurn2;
      } else {
        // B. Magnetic stage auto-lock when resting within ±105px of any showcase stage target
        const snapRadius = isMobile ? 70 : 105;
        let closestDist = Infinity;
        let closestY = null;
        for (let i = 0; i < stageLockTargets.length; i++) {
          const stY = stageLockTargets[i].y;
          const dist = stY - targetY;
          if (Math.abs(dist) <= snapRadius && Math.abs(dist) < Math.abs(closestDist)) {
            closestDist = dist;
            closestY = stY;
          }
        }
        if (closestY !== null && Math.abs(closestDist) > 0.5) {
          targetY += closestDist * 0.15;
          if (Math.abs(closestY - targetY) < 0.8) targetY = closestY;
        }
      }
    }

    // Smooth lerp (0.17 for responsive yet silky glide)
    const lerpRate = isMobile ? 0.18 : 0.15;
    currentY += (targetY - currentY) * lerpRate;
    if (Math.abs(targetY - currentY) < 0.15) {
      currentY = targetY;
    }

    // Smooth touch inertia damping for tactile mobile flick-scrolling
    if (Math.abs(touchMomentumVel) > 0.08) {
      applyScrollDelta(touchMomentumVel);
      touchMomentumVel *= 0.92;
    } else {
      touchMomentumVel = 0;
    }

    // Update liquid timeline progress line in 60fps lockstep
    const spineProgEl = document.getElementById('grounded-spine-progress');
    const spineTrackEl = document.getElementById('grounded-spine-track');
    const spineProgressPx = getSpineProgressPx(currentY);
    if (spineProgEl) {
      spineProgEl.style.height = `${spineProgressPx.toFixed(1)}px`;
    }

    const spineTotalHeight = spineTrackEl ? (spineTrackEl.offsetHeight || 400) : 400;
    const spinePct = Math.max(0, Math.min(100, (spineProgressPx / spineTotalHeight) * 100));

    // Sync Left-Margin Rail, Ambient Art Background & Hybrid Collapsing Header
    syncStageTelemetryAndAmbient(currentY);

    function clearHoles() {
      if (cachedHoleEls.length && cachedHoleEls[0].getAttribute('r') !== '0') {
        for (let i = 0; i < NUM_HOLES; i++) {
          cachedHoleEls[i].setAttribute('r', '0');
        }
      }
    }

    if (currentY <= p1Start) {
      // ---------------------------------------------------------------------
      // PHASE 1: Normal Scrolling through Sectors 1 to 4 (LIGHT THEME)
      // ---------------------------------------------------------------------
      clearHoles();
      layer14.style.visibility = 'visible';
      layer14.style.pointerEvents = 'auto';
      layer14.classList.remove('layer-masked');
      track14.style.transform = `translate3d(0, ${-currentY.toFixed(1)}px, 0)`;

      layer57.style.visibility = 'hidden';
      layer57.style.pointerEvents = 'none';
      layer57.classList.remove('layer-masked');
      track57.style.transform = 'translate3d(0, 0px, 0)';

      layer8.style.visibility = 'hidden';
      layer8.style.pointerEvents = 'none';

      // Determine active sector in 1-4 using true track offsets and reading threshold
      const focusY = currentY + vh * 0.35;
      let activeId = 'hero';
      if (focusY >= sectorOffsets['ecommerce']) {
        activeId = 'ecommerce';
      } else if (focusY >= sectorOffsets['branding']) {
        activeId = 'branding';
      } else if (focusY >= sectorOffsets['stream-works']) {
        activeId = 'stream-works';
      }
      updatePortfolioNav(activeId, 'light', spinePct);

      // Kinetic matrix tracks parallax
      const trackLeft = document.getElementById('track-left');
      const trackCenter = document.getElementById('track-center');
      const trackRight = document.getElementById('track-right');
      const streamOffset = sectorOffsets['stream-works'];
      if (trackLeft && trackCenter && trackRight) {
        const topInView = streamOffset - currentY;
        const delta = (vh / 2 - (topInView + 800)) * 0.08;
        trackLeft.style.transform = `translate3d(0, ${-delta * 1.2}px, 0)`;
        trackCenter.style.transform = `translate3d(0, ${delta * 1.5}px, 0)`;
        trackRight.style.transform = `translate3d(0, ${-delta * 0.9}px, 0)`;
      }

    } else if (currentY > p1Start && currentY < p1End) {
      // ---------------------------------------------------------------------
      // PHASE 2: PINNED BURN #1 (End of Sec 4 [LIGHT] burns BOTTOM -> TOP,
      //          revealing anchored Start of Sec 5 [DARK NOIR] from bottom)
      // ---------------------------------------------------------------------
      const burnProg1 = (currentY - p1Start) / burnSpan1;

      layer14.style.visibility = 'visible';
      layer14.style.pointerEvents = 'none';
      layer14.classList.add('layer-masked');
      track14.style.transform = `translate3d(0, ${-maxScroll14.toFixed(1)}px, 0)`;

      layer57.style.visibility = 'visible';
      layer57.style.pointerEvents = 'none';
      layer57.classList.remove('layer-masked');
      track57.style.transform = 'translate3d(0, 0px, 0)';

      layer8.style.visibility = 'hidden';
      layer8.style.pointerEvents = 'none';

      updateLiveBurnMask('bottom-to-top', burnProg1, timeSec);
      // Switches from Light to Dark Noir as burn completes halfway
      updatePortfolioNav(burnProg1 > 0.5 ? 'section-barney' : 'ecommerce', burnProg1 > 0.5 ? 'dark' : 'light', spinePct);

    } else if (currentY >= p1End && currentY <= p2Start) {
      // ---------------------------------------------------------------------
      // PHASE 3: User scrolls forward through Sectors 5 to 7 (DARK NOIR THEME)
      // ---------------------------------------------------------------------
      clearHoles();
      const localY57 = currentY - p1End;

      layer14.style.visibility = 'hidden';
      layer14.style.pointerEvents = 'none';
      layer14.classList.remove('layer-masked');

      layer57.style.visibility = 'visible';
      layer57.style.pointerEvents = 'auto';
      layer57.classList.remove('layer-masked');
      track57.style.transform = `translate3d(0, ${-localY57.toFixed(1)}px, 0)`;

      layer8.style.visibility = 'hidden';
      layer8.style.pointerEvents = 'none';
      track8.style.transform = 'translate3d(0, 0px, 0)';

      // Determine active sector in 5-7
      const focusY57 = localY57 + vh * 0.35;
      let activeId = 'section-barney';
      if (focusY57 >= sectorOffsets['section-promos']) {
        activeId = 'section-promos';
      } else if (focusY57 >= sectorOffsets['section-posters']) {
        activeId = 'section-posters';
      }
      updatePortfolioNav(activeId, 'dark', spinePct);

      // Desktop Pinned Horizontal Scroll Gallery + Multi-Layer Parallax in Sector 06 (Posters)
      const runwayEl = document.getElementById('poster-horizontal-runway');
      const pinStageEl = document.getElementById('poster-horizontal-pin-stage');
      const posterViewportEl = document.getElementById('poster-horizontal-viewport');
      const posterGrid = document.getElementById('poster-grid');
      const posterBgText = document.getElementById('poster-parallax-bg-text');
      const posterProgBar = document.getElementById('poster-horiz-progress-bar');

      if (runwayEl && pinStageEl && posterGrid && window.innerWidth > 860) {
        const runwayTop = sectorOffsets['section-posters'];
        const runwayHeight = runwayEl.offsetHeight || 2200;
        const stageHeight = pinStageEl.offsetHeight || 760;
        const maxPinY = Math.max(0, runwayHeight - stageHeight - 24);
        const pinOffsetTop = Math.max(18, (vh - stageHeight) * 0.42);

        const rawPinY = localY57 - (runwayTop - pinOffsetTop);
        const pinY = Math.max(0, Math.min(maxPinY, rawPinY));
        const horizProg = maxPinY > 0 ? (pinY / maxPinY) : 0;

        pinStageEl.style.transform = `translate3d(0, ${pinY.toFixed(1)}px, 0)`;

        const viewportW = posterViewportEl ? posterViewportEl.clientWidth : (vw * 0.9);
        const gridW = posterGrid.scrollWidth || viewportW;
        const maxHorizX = Math.max(0, gridW - viewportW + 24);
        const horizX = horizProg * maxHorizX;

        posterGrid.style.transform = `translate3d(${-horizX.toFixed(1)}px, 0, 0)`;

        if (posterBgText) {
          posterBgText.style.transform = `translate3d(${(-horizX * 0.32).toFixed(1)}px, 0, 0)`;
        }
        if (posterProgBar) {
          posterProgBar.style.width = `${(horizProg * 100).toFixed(1)}%`;
        }

        const cards = posterGrid.querySelectorAll('.poster-card');
        cards.forEach((c, idx) => {
          const waveY = Math.sin(horizProg * Math.PI * 2 + idx * 0.85) * 14 * Math.sin(horizProg * Math.PI);
          c.style.transform = `translate3d(0, ${waveY.toFixed(1)}px, 0)`;
        });
      } else if (pinStageEl && posterGrid) {
        pinStageEl.style.transform = '';
        posterGrid.style.transform = '';
      }

    } else if (currentY > p2Start && currentY < p2End) {
      // ---------------------------------------------------------------------
      // PHASE 4: PINNED BURN #2 (End of Sec 7 [DARK] burns TOP -> BOTTOM,
      //          revealing anchored Start of Sec 8 [LIGHT] from top)
      // ---------------------------------------------------------------------
      const burnProg2 = (currentY - p2Start) / burnSpan2;

      layer14.style.visibility = 'hidden';
      layer14.style.pointerEvents = 'none';
      layer14.classList.remove('layer-masked');

      layer57.style.visibility = 'visible';
      layer57.style.pointerEvents = 'none';
      layer57.classList.add('layer-masked');
      track57.style.transform = `translate3d(0, ${-maxScroll57.toFixed(1)}px, 0)`;

      layer8.style.visibility = 'visible';
      layer8.style.pointerEvents = 'none';
      track8.style.transform = 'translate3d(0, 0px, 0)';

      updateLiveBurnMask('top-to-bottom', burnProg2, timeSec);
      // Switches from Dark to Light as burn completes halfway
      updatePortfolioNav(burnProg2 > 0.5 ? 'resume' : 'section-promos', burnProg2 > 0.5 ? 'light' : 'dark', spinePct);

    } else {
      // ---------------------------------------------------------------------
      // PHASE 5: User scrolls through Sector 8 (Dossier / Resume) in LIGHT THEME
      // ---------------------------------------------------------------------
      clearHoles();
      const localY8 = currentY - p2End;

      layer14.style.visibility = 'hidden';
      layer14.style.pointerEvents = 'none';
      layer14.classList.remove('layer-masked');

      layer57.style.visibility = 'hidden';
      layer57.style.pointerEvents = 'none';
      layer57.classList.remove('layer-masked');

      layer8.style.visibility = 'visible';
      layer8.style.pointerEvents = 'auto';
      track8.style.transform = `translate3d(0, ${-localY8.toFixed(1)}px, 0)`;

      updatePortfolioNav('resume', 'light', spinePct);
    }

    requestAnimationFrame(renderLoop);
  }

  // =========================================================================
  // INPUT HANDLERS: Wheel, Touch with Inertial Momentum Fling, Keyboard, Cursor
  // =========================================================================
  window.addEventListener('wheel', (e) => {
    const now = performance.now();
    const scrollable = e.target.closest('.crm-browser-scroll, .browser-scroll-viewport, .manual-thumbnail-strip');
    if (scrollable && scrollable.scrollHeight > scrollable.clientHeight + 4) {
      const atTop = scrollable.scrollTop <= 1 && e.deltaY < 0;
      const atBottom = (scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2) && e.deltaY > 0;
      if (!atTop && !atBottom) {
        lastInnerScrollTime = now;
        return;
      }
      // Short 180ms boundary cushion after hitting top/bottom of inner scroll box
      if (now - lastInnerScrollTime < 180) {
        return;
      }
    }
    applyScrollDelta(e.deltaY * 0.98);
  }, { passive: true });

  // Interactive Custom Reticle Cursor, Background Parallax & Hybrid Header Hover
  (function initInteractiveCursorAndHeader() {
    let curX = window.innerWidth / 2;
    let curY = window.innerHeight / 2;
    let ringX = curX;
    let ringY = curY;
    window._lastMouseY = curY;

    const ringEl = document.getElementById('cursor-reticle-ring');
    const dotEl = document.getElementById('cursor-reticle-dot');
    const headerEl = document.getElementById('grounded-header');
    const collapsedPill = document.getElementById('header-collapsed-pill');
    const astrolabeEl = document.getElementById('bg-vector-astrolabe');

    if (collapsedPill && headerEl) {
      collapsedPill.addEventListener('mouseenter', () => {
        headerEl.classList.add('is-hover-open');
        document.body.classList.add('header-hover-expanded');
      });
      collapsedPill.addEventListener('click', () => {
        headerEl.classList.add('is-hover-open');
        document.body.classList.add('header-hover-expanded');
      });
    }

    window.addEventListener('mousemove', (e) => {
      curX = e.clientX;
      curY = e.clientY;
      window._lastMouseY = curY;

      // Normalized -1..1 coordinates for background artwork & grid parallax
      const nx = (curX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (curY / Math.max(1, window.innerHeight) - 0.5) * 2;
      document.documentElement.style.setProperty('--cursor-nx', nx.toFixed(3));
      document.documentElement.style.setProperty('--cursor-ny', ny.toFixed(3));

      // Hybrid header top-edge hover reveal (expand when mouse is near top 52px, collapse when leaving below 84px)
      if (headerEl && document.body.classList.contains('header-is-collapsed')) {
        if (curY <= 48) {
          headerEl.classList.add('is-hover-open');
          document.body.classList.add('header-hover-expanded');
        } else if (curY > 86 && !headerEl.matches(':hover')) {
          headerEl.classList.remove('is-hover-open');
          document.body.classList.remove('header-hover-expanded');
        }
      }

      if (dotEl) {
        dotEl.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      }
      if (astrolabeEl) {
        const ax = 860 + nx * 24;
        const ay = 480 + ny * 24;
        const rot = (currentY * 0.04 + nx * 12).toFixed(1);
        astrolabeEl.setAttribute('transform', `translate(${ax.toFixed(1)}, ${ay.toFixed(1)}) rotate(${rot})`);
      }

      // Check hovered target for cursor state & live ambient art projection
      const t = e.target;
      if (t && t.closest) {
        const artTarget = t.closest('.img-upload-box, .ai-concept-card, .promo-card, .poster-card, .tri-poster-card, .studio-suite-card, .studio-banner-frame, .manual-spread-viewport, .carousel-slide-housing, .floating-card, .spatial-hero-box');
        const interactiveTarget = t.closest('button, a, .grounded-nav-node, .console-brand-tab, .crm-browser-tab-btn, .ecom-browser-tab-btn, .dossier-tab-btn');
        document.body.classList.toggle('cursor-on-art', Boolean(artTarget));
        document.body.classList.toggle('cursor-on-interactive', Boolean(interactiveTarget && !artTarget));

        if (artTarget) {
          const img = artTarget.querySelector('img');
          if (img && img.getAttribute('src')) {
            const src = img.getAttribute('src');
            if (hoveredArtOverride !== src) {
              hoveredArtOverride = src;
              applyAmbientArtToActiveLayer(src);
            }
          }
        } else if (hoveredArtOverride) {
          hoveredArtOverride = null;
          const meta = stageMetaCatalog[activeStageId];
          if (meta) applyAmbientArtToActiveLayer(meta.art);
        }
      }
    }, { passive: true });

    function updateCursorRing() {
      ringX += (curX - ringX) * 0.22;
      ringY += (curY - ringY) * 0.22;
      if (ringEl) {
        ringEl.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
      }
      requestAnimationFrame(updateCursorRing);
    }
    requestAnimationFrame(updateCursorRing);
  })();

  // Unified touch / pointer drag with velocity momentum & directional disambiguation
  let isDragging = false;
  let dragLastX = 0;
  let dragLastY = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragDirectionDetermined = false;
  let dragIsVertical = true;
  let dragLastTime = 0;
  let dragVelocity = 0;
  let touchMomentumVel = 0;

  function handleDragStart(clientX, clientY) {
    isDragging = true;
    dragLastX = clientX;
    dragLastY = clientY;
    dragStartX = clientX;
    dragStartY = clientY;
    dragDirectionDetermined = false;
    dragIsVertical = true;
    dragLastTime = performance.now();
    dragVelocity = 0;
    touchMomentumVel = 0; // instantly cancel ongoing momentum on new touch
  }

  function handleDragMove(clientX, clientY) {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max(6, now - dragLastTime);
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;

    // Disambiguate horizontal swipe (tabs, spreads, carousels) from vertical scroll
    if (!dragDirectionDetermined && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      dragDirectionDetermined = true;
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragIsVertical = false;
        isDragging = false;
        return;
      } else {
        dragIsVertical = true;
      }
    }

    if (!dragIsVertical) return;

    const stepDy = dragLastY - clientY;
    dragLastX = clientX;
    dragLastY = clientY;
    dragLastTime = now;

    // Smoothed velocity estimate (px / ms)
    const instantVelocity = stepDy / dt;
    dragVelocity = dragVelocity * 0.35 + instantVelocity * 0.65;

    // Direct movement tracking
    applyScrollDelta(stepDy);
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Apply smooth exponential inertia fling if flicked with velocity
    if (Math.abs(dragVelocity) > 0.12 && dragIsVertical) {
      const clampedVel = Math.max(-3.5, Math.min(3.5, dragVelocity));
      touchMomentumVel = clampedVel * 20.0;
    }
    dragVelocity = 0;
  }

  if (window.PointerEvent) {
    window.addEventListener('pointerdown', (e) => {
      if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea, .lightbox, video, #storyboard-lightbox, .crm-browser-scroll, .manual-thumbnail-strip')) return;
      handleDragStart(e.clientX, e.clientY);
    });
    window.addEventListener('pointermove', (e) => {
      handleDragMove(e.clientX, e.clientY);
    });
    window.addEventListener('pointerup', handleDragEnd);
    window.addEventListener('pointercancel', handleDragEnd);
  } else {
    window.addEventListener('touchstart', (e) => {
      if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea, .lightbox, video, #storyboard-lightbox, .crm-browser-scroll, .manual-thumbnail-strip')) return;
      if (e.touches && e.touches[0]) handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);
  }

  // Interactive spine scrub / click handler
  (function initSpineScrub() {
    const navSystem = document.getElementById('grounded-nav');
    const spineTrack = document.getElementById('grounded-spine-track');
    if (!navSystem) return;

    function seekSpine(e) {
      const ref = spineTrack || navSystem;
      const rect = ref.getBoundingClientRect();
      const clickTop = e.clientY - rect.top;
      lastScrollInputTime = performance.now();
      targetY = getYFromSpinePx(clickTop);
    }

    let isSpineDragging = false;
    navSystem.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.grounded-nav-node')) return;
      isSpineDragging = true;
      seekSpine(e);
    });
    window.addEventListener('pointermove', (e) => {
      if (isSpineDragging) seekSpine(e);
    });
    window.addEventListener('pointerup', () => { isSpineDragging = false; });
  })();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      const step = e.key === 'ArrowDown' ? 140 : vh * 0.65;
      applyScrollDelta(step);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      const step = e.key === 'ArrowUp' ? 140 : vh * 0.65;
      applyScrollDelta(-step);
    }
  });

  // Start engine on load (Initial theme: LIGHT)
  window.addEventListener('load', () => {
    measureLayout();
    document.body.classList.remove('theme-dark-cinema');
    requestAnimationFrame(renderLoop);
  });

  // Public API
  window.PinnedBurnEngine = {
    measureLayout,
    getSectorTargetY,
    getSpineProgressPx,
    getYFromSpinePx,
    getSpineWaypoints: () => spineWaypoints,
    getStageLockTargets: () => stageLockTargets,
    setTargetY: (y) => {
      lastScrollInputTime = performance.now();
      targetY = Math.max(0, Math.min(totalTimeline, y));
    },
    getTargetY: () => targetY,
    getCurrentY: () => currentY,
    getTotalTimeline: () => totalTimeline,
    getSectorOffsets: () => sectorOffsets
  };
})();
