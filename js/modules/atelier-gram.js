// ==========================================================================
// ATELIER MOBILE // LUXURY CURATORIAL APPLICATION CONTROLLER
// Complete fidelity mobile experience mirroring PC Adobe Photoshop portfolio
// ==========================================================================

(function () {
  let activeTab = 'feed';
  let activeStoryData = null;
  let activeStorySlideIdx = 0;
  let storyTimer = null;
  let storyStartTime = 0;
  let storyElapsed = 0;
  let isStoryPaused = false;
  const STORY_DURATION = 4200; // 4.2s per slide
  const visitedStories = new Set(); // Session tracking for grayed-out story rings

  // Map of tab aliases for flexibility and test backward-compatibility
  const TAB_MAP = {
    feed: 'feed',
    curated: 'feed',
    overview: 'feed',
    explore: 'explore',
    gallery: 'explore',
    archive: 'explore',
    reels: 'reels',
    cinema: 'reels',
    motion: 'reels',
    dms: 'dms',
    crm: 'dms',
    dispatch: 'dms',
    profile: 'profile',
    dossier: 'profile',
    resume: 'profile'
  };

  // 1. Tab Switching Engine with HTML5 History & Context Header Toggling
  function switchAtelierGramTab(rawTabKey, pushHistory = true) {
    const tabKey = TAB_MAP[rawTabKey] || rawTabKey;

    // Context-Aware Header Toggling: Hide header in Gallery (explore) and Cinema (reels) for edge-to-edge focus
    const root = document.getElementById('atelier-gram-root');
    if (root) {
      const shouldHideHeader = (tabKey === 'explore' || tabKey === 'reels');
      root.classList.toggle('ag-header-hidden', shouldHideHeader);
    }

    // HTML5 History Routing: Push route so Back button doesn't close app
    if (pushHistory && window.history && window.history.pushState) {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== tabKey) {
        window.history.pushState({ tab: tabKey }, '', `#${tabKey}`);
      }
    }

    if (tabKey === activeTab) {
      const currentSurface = document.getElementById(`ag-tab-${tabKey}`);
      if (currentSurface) currentSurface.scrollTo({ top: 0, behavior: 'smooth' });
      if (tabKey === 'feed' && root) root.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    activeTab = tabKey;

    if (root) {
      if (tabKey === 'feed') {
        root.classList.remove('ag-legacy-tab-active');
        root.style.scrollSnapType = 'y proximity';
        root.scrollTop = 0;
      } else {
        root.classList.add('ag-legacy-tab-active');
        root.style.scrollSnapType = 'none';
        root.scrollTop = 0;
      }
    }

    // Switch surface panels
    document.querySelectorAll('.ag-tab-surface').forEach(panel => {
      panel.classList.remove('is-active-tab');
    });
    const targetSurface = document.getElementById(`ag-tab-${tabKey}`);
    if (targetSurface) {
      targetSurface.classList.add('is-active-tab');
      targetSurface.scrollTop = 0;
    }

    // Pause videos outside the active tab to prevent background audio leaks
    document.querySelectorAll('video').forEach(v => {
      const isInsideTarget = targetSurface && targetSurface.contains(v);
      if (!isInsideTarget) {
        if (!v.paused) v.pause();
        if (v.id === 'ag-overview-barney-video') {
          v.muted = true;
          if (typeof syncSpatialAudioUi === 'function') syncSpatialAudioUi(false);
        }
      }
    });

    if (tabKey === 'feed') {
      initPetalDial();
    }

    // Switch bottom nav tabs
    document.querySelectorAll('.ag-nav-tab-btn').forEach(btn => {
      const bKey = TAB_MAP[btn.dataset.tab] || btn.dataset.tab;
      btn.classList.toggle('is-active', bKey === tabKey);
    });

    // Update top header dynamic title
    const titleEl = document.getElementById('ag-header-dynamic-title');
    if (titleEl) {
      const titles = {
        feed: 'Atelier · Curated',
        explore: 'Archive · Gallery',
        reels: 'Cinema · Motion',
        dms: 'CRM · Email Systems',
        profile: 'Dossier · Resume'
      };
      titleEl.textContent = titles[tabKey] || 'IRENE THOMAS';
    }

    // Video playback coordination: pause when leaving reels, play when entering
    const reelsScroller = document.getElementById('ag-reels-scroller');
    if (reelsScroller) {
      const videos = reelsScroller.querySelectorAll('video');
      if (tabKey !== 'reels') {
        videos.forEach(v => { try { v.pause(); } catch (_) {} });
      } else {
        syncActiveReelPlayback();
      }
    }

    if (typeof playUiSound === 'function') {
      playUiSound(880, 'sine', 0.03);
    }
  }

  function hydrateVideoSources(video) {
    if (!video || video.dataset.hydrated === 'true') return;
    let changed = false;
    if (video.dataset.src && !video.getAttribute('src')) {
      video.setAttribute('src', video.dataset.src);
      changed = true;
    }
    video.querySelectorAll('source[data-src]').forEach(source => {
      if (!source.getAttribute('src')) {
        source.setAttribute('src', source.dataset.src);
        changed = true;
      }
    });
    if (changed) {
      video.dataset.hydrated = 'true';
      try { video.load(); } catch (_) {}
    }
  }

  // 2. Reels Single-Video Playback Coordinator
  function syncActiveReelPlayback() {
    const scroller = document.getElementById('ag-reels-scroller');
    if (!scroller || activeTab !== 'reels') return;
    const items = scroller.querySelectorAll('.ag-reel-snap-item');
    const scrollerHeight = scroller.clientHeight || window.innerHeight;
    const currentScrollTop = scroller.scrollTop;

    items.forEach(item => {
      const video = item.querySelector('video');
      if (!video) return;
      const itemTop = item.offsetTop;
      const diff = Math.abs(currentScrollTop - itemTop);
      if (diff < scrollerHeight * 0.4) {
        hydrateVideoSources(video);
        if (video.paused) {
          try { video.play().catch(() => {}); } catch (_) {}
        }
      } else {
        if (!video.paused) {
          try { video.pause(); } catch (_) {}
        }
      }
    });
  }

  function initReelsScrollListener() {
    const scroller = document.getElementById('ag-reels-scroller');
    if (!scroller) return;
    let scrollTimeout;
    scroller.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(syncActiveReelPlayback, 60);
    }, { passive: true });
  }

  function toggleMobileReelAudio(btn) {
    const scroller = document.getElementById('ag-reels-scroller');
    if (!scroller) return;
    const videos = scroller.querySelectorAll('video');
    let isCurrentlyMuted = true;
    videos.forEach(v => { if (!v.muted) isCurrentlyMuted = false; });

    const newMutedState = !isCurrentlyMuted;
    videos.forEach(v => { v.muted = newMutedState; });

    document.querySelectorAll('.ag-reel-mute-btn').forEach(b => {
      b.textContent = newMutedState ? '🔇' : '🔊';
      b.setAttribute('aria-label', newMutedState ? 'Unmute Audio' : 'Mute Audio');
    });

    if (typeof playUiSound === 'function') {
      playUiSound(newMutedState ? 440 : 880, 'sine', 0.04);
    }
  }

  // 3. Carousel Scroll Listeners (Update live indicator: "01 / 13")
  function initCarouselScrollListeners() {
    document.querySelectorAll('.ag-post-carousel-stage').forEach(stage => {
      const track = stage.querySelector('.ag-post-carousel-track');
      const counterBadge = stage.querySelector('.ag-carousel-counter-badge');
      const dots = stage.querySelectorAll('.ag-carousel-dot');
      if (!track) return;

      const totalSlides = track.querySelectorAll('.ag-post-carousel-slide').length;
      if (counterBadge && totalSlides > 0) {
        counterBadge.textContent = `01 / ${String(totalSlides).padStart(2, '0')}`;
      }

      track.addEventListener('scroll', () => {
        const slideWidth = track.clientWidth || 1;
        const currentIdx = Math.round(track.scrollLeft / slideWidth);
        const displayIdx = Math.min(totalSlides, Math.max(1, currentIdx + 1));

        if (counterBadge) {
          counterBadge.textContent = `${String(displayIdx).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
        }

        if (dots.length > 0) {
          dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === currentIdx);
          });
        }
      }, { passive: true });
    });
  }

  // 4. Double-Tap Stamp Seal Animation
  let lastTapTime = 0;
  function handlePostDoubleTap(e, stageEl, heartBtnId) {
    const now = Date.now();
    const timeDiff = now - lastTapTime;

    if ((lastTapTime > 0 && timeDiff <= 450) || (e && e.forceDoubleTap)) {
      lastTapTime = 0;
      const overlay = stageEl.querySelector('.ag-atelier-stamp-overlay');
      if (overlay) {
        overlay.classList.add('is-popped');
        setTimeout(() => overlay.classList.remove('is-popped'), 950);
      }
      if (heartBtnId) {
        const heartBtn = document.getElementById(heartBtnId);
        if (heartBtn) {
          heartBtn.classList.add('is-liked');
        }
      }
      if (typeof playUiSound === 'function') {
        playUiSound(1040, 'triangle', 0.05);
      }
    } else {
      lastTapTime = now;
    }
  }

  function togglePostLike(btn) {
    if (!btn) return;
    btn.classList.toggle('is-liked');
    if (typeof playUiSound === 'function') {
      playUiSound(btn.classList.contains('is-liked') ? 980 : 520, 'sine', 0.03);
    }
  }

  // 5. Expandable Specs Drawer
  function toggleSpecsDrawer(drawerId, btn) {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;
    const isOpen = drawer.classList.contains('is-open');

    if (isOpen) {
      drawer.classList.remove('is-open');
      if (btn) btn.classList.remove('is-active');
    } else {
      drawer.classList.add('is-open');
      if (btn) btn.classList.add('is-active');
    }

    if (typeof playUiSound === 'function') {
      playUiSound(isOpen ? 640 : 860, 'sine', 0.03);
    }
  }

  // 6. Storefront Responsive Ratio Switcher (Desktop, Tablet, Mobile)
  function switchStorefrontRatio(ratio, btn) {
    const card = btn.closest('.ag-project-card');
    if (!card) return;
    const stage = card.querySelector('.ag-post-carousel-stage');
    const track = card.querySelector('.ag-post-carousel-track');
    const img = card.querySelector('.ag-post-carousel-slide img');
    if (!stage || !img) return;

    card.querySelectorAll('.ag-ratio-pill-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const ratios = {
      desktop: {
        src: 'assets/optimized/new_additions/Jack Nicklaus Collection _ Slider Desktop 1920x600.jpg',
        style: 'height: 140px; aspect-ratio: 16/5;',
        title: 'Desktop Hero · 1920 × 600'
      },
      tablet: {
        src: 'assets/optimized/TaylorMade_Qi4D_Series_900x600.jpg',
        style: 'height: 220px; aspect-ratio: 3/2;',
        title: 'Tablet Banner · 900 × 600'
      },
      mobile: {
        src: 'assets/optimized/New_Arrivals_Landing_Page_V1.jpg',
        style: 'height: 280px; aspect-ratio: 3/4;',
        title: 'Mobile Storefront · 640 × 427'
      }
    };

    const target = ratios[ratio] || ratios.desktop;
    img.src = target.src;
    img.alt = target.title;
    if (track) track.setAttribute('style', target.style);

    if (typeof playUiSound === 'function') {
      playUiSound(740, 'sine', 0.03);
    }
  }

  // 8. Gallery Category Filter
  function filterExploreGallery(category, btn) {
    const rail = document.querySelector('.ag-gallery-filter-rail');
    if (rail && btn) {
      rail.querySelectorAll('.ag-filter-pill-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    }

    const tiles = document.querySelectorAll('.ag-explore-tile');
    tiles.forEach(tile => {
      if (category === 'all' || tile.dataset.cat === category) {
        tile.style.display = 'block';
      } else {
        tile.style.display = 'none';
      }
    });

    if (typeof playUiSound === 'function') {
      playUiSound(920, 'sine', 0.04);
    }
  }

  // 9. CRM DIRECT MARKETING 5,000PX SUITE (FULL-WIDTH IMMERSIVE FOLIO)
  const CRM_DATA = {
    egolf: {
      client: 'eGolf Megastore · Dubai Flagship',
      file: 'eGolf VIP Seasonal Launch',
      specs: '5,000 × 1,200 px · High-Res',
      srcLow: 'assets/optimized/new_additions/crm_vip_launch_750w.webp',
      srcHigh: 'assets/optimized/new_additions/crm_vip_launch_1500w.webp',
      tech: {
        dims: '5,000 × 1,200 PX',
        grid: '7-Tier Modular Grid',
        format: 'WebP Lossless (150 DPI)',
        space: 'sRGB IEC61966-2.1'
      },
      kpis: { ctr: '38.4%', opens: '64.2%', orders: '2,480+' }
    },
    callaway: {
      client: 'Callaway Golf Regional · Major Tournaments',
      file: 'Callaway Major Tournaments',
      specs: '5,000 × 1,200 px · High-Res',
      srcLow: 'assets/optimized/new_additions/crm_major_tournaments_750w.webp',
      srcHigh: 'assets/optimized/new_additions/crm_major_tournaments_1500w.webp',
      tech: {
        dims: '5,000 × 1,200 PX',
        grid: 'Tour Hero Layout',
        format: 'WebP Lossless (150 DPI)',
        space: 'Display P3 Wide Gamut'
      },
      kpis: { ctr: '42.1%', opens: '71.0%', orders: '3,120+' }
    },
    taylormade: {
      client: 'TaylorMade & Vessel · Luxury Cart Bag',
      file: 'Vessel Luxury Release',
      specs: '5,000 × 1,200 px · High-Res',
      srcLow: 'assets/optimized/new_additions/crm_vessel_luxury_750w.webp',
      srcHigh: 'assets/optimized/new_additions/crm_vessel_luxury_1500w.webp',
      tech: {
        dims: '5,000 × 1,200 PX',
        grid: 'Luxury Product Architecture',
        format: 'WebP Lossless (150 DPI)',
        space: 'sRGB IEC61966-2.1'
      },
      kpis: { ctr: '36.8%', opens: '68.5%', orders: '1,890+' }
    }
  };

  let activeCrmKey = 'egolf';

  function switchCrmCampaign(campaignKey, btn) {
    const data = CRM_DATA[campaignKey];
    if (!data) return;
    activeCrmKey = campaignKey;

    document.querySelectorAll('.ag-crm-tab-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const fileEl = document.getElementById('ag-crm-active-file');
    const specsEl = document.getElementById('ag-crm-active-specs');
    const imgEl = document.getElementById('ag-crm-active-img');
    const ctrEl = document.getElementById('ag-crm-kpi-ctr');
    const opensEl = document.getElementById('ag-crm-kpi-opens');
    const ordersEl = document.getElementById('ag-crm-kpi-orders');

    // Technical spec readout elements
    const specDimsEl = document.getElementById('ag-crm-spec-dims');
    const specGridEl = document.getElementById('ag-crm-spec-grid');
    const specFormatEl = document.getElementById('ag-crm-spec-format');
    const specSpaceEl = document.getElementById('ag-crm-spec-space');

    if (fileEl) fileEl.textContent = `FILE: ${data.file}`;
    if (specsEl) specsEl.textContent = data.specs;
    if (imgEl) {
      imgEl.src = data.srcLow;
      imgEl.alt = `${data.client} 5,000px CRM Newsletter`;
    }

    if (specDimsEl) specDimsEl.textContent = data.tech.dims;
    if (specGridEl) specGridEl.textContent = data.tech.grid;
    if (specFormatEl) specFormatEl.textContent = data.tech.format;
    if (specSpaceEl) specSpaceEl.textContent = data.tech.space;

    // Backward compatibility with test assertions
    if (ctrEl) ctrEl.textContent = data.kpis.ctr;
    if (opensEl) opensEl.textContent = data.kpis.opens;
    if (ordersEl) ordersEl.textContent = data.kpis.orders;

    if (typeof playUiSound === 'function') {
      playUiSound(760, 'sine', 0.03);
    }
  }

  // Compatibility stubs for test harness
  function openDmConversation(key) { switchCrmCampaign(key); }
  function closeDmConversation() { switchCrmCampaign('egolf'); }

  // 10. Dossier Segmented Tab Switcher
  function switchProfileDossierTab(tabName, btn) {
    const container = document.getElementById('ag-tab-profile');
    if (!container) return;

    container.querySelectorAll('.ag-profile-segment-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    container.querySelectorAll('.ag-profile-tab-content').forEach(c => c.style.display = 'none');
    const target = document.getElementById(`ag-profile-tab-${tabName}`);
    if (target) target.style.display = 'block';

    if (typeof playUiSound === 'function') {
      playUiSound(840, 'sine', 0.03);
    }
  }

    // ==========================================================================
  // ==========================================================================
// 11. DYNAMIC OVERVIEW CONTROLLERS & BESPOKE INTERACTIVE MODULES
// Cohesive medium-native architecture: Highlights, Petal Dial, Unabridged Nivara
// ==========================================================================

  // --- A. STORY HIGHLIGHT KEYS & DATASETS ---
  const STORY_KEYS = ['omnichannel', 'cinema', 'nivara', 'hardware', 'retail', 'posters', 'crm', 'ai', 'lookbooks'];
  let activeStoryKey = 'omnichannel';
  let activeStoryIndex = 0;

  // 12 Omnichannel Multi-Ratio Campaign Triads
  const OMNICHANNEL_PETAL_CARDS = [
    { id: 'tm-1-1', brand: 'TaylorMade Golf', campaign: 'Hi-Toe 5 Wedges', ratio: '1:1', ratioKey: '1-1', ratioLabel: '1:1 FEED MASTER', dims: '1080×1080', src: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1080x1080.jpg' },
    { id: 'tm-9-16', brand: 'TaylorMade Golf', campaign: 'Hi-Toe 5 Wedges', ratio: '9:16', ratioKey: '9-16', ratioLabel: '9:16 VERTICAL STORY', dims: '1080×1920', src: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1080x1920.jpg' },
    { id: 'tm-16-9', brand: 'TaylorMade Golf', campaign: 'Hi-Toe 5 Wedges', ratio: '16:9', ratioKey: '16-9', ratioLabel: '16:9 DISPLAY NETWORK', dims: '1920×1080', src: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1920x1080.jpg' },
    { id: 'puma-1-1', brand: 'PUMA Golf', campaign: 'Featured Brand of the Month', ratio: '1:1', ratioKey: '1-1', ratioLabel: '1:1 FEED MASTER', dims: '1080×1080', src: 'assets/optimized/new_additions/Sponsored Ads - Featured Brand of the Month PUMA 1080x1080 1.jpg' },
    { id: 'puma-9-16', brand: 'PUMA Golf', campaign: 'Featured Brand of the Month', ratio: '9:16', ratioKey: '9-16', ratioLabel: '9:16 VERTICAL STORY', dims: '1080×1920', src: 'assets/optimized/new_additions/Sponsored Ads - Featured Brand of the Month PUMA 1080x1920 1.jpg' },
    { id: 'puma-16-9', brand: 'PUMA Golf', campaign: 'Featured Brand of the Month', ratio: '16:9', ratioKey: '16-9', ratioLabel: '16:9 DISPLAY NETWORK', dims: '1920×1080', src: 'assets/optimized/new_additions/Sponsored Ads - Featured Brand of the Month PUMA 1920x1080 1.jpg' },
    { id: 'mcl-1-1', brand: 'McLaren Golf', campaign: 'Series 3 Irons Launch', ratio: '1:1', ratioKey: '1-1', ratioLabel: '1:1 FEED MASTER', dims: '1080×1080', src: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1080.jpg' },
    { id: 'mcl-9-16', brand: 'McLaren Golf', campaign: 'Series 3 Irons Launch', ratio: '9:16', ratioKey: '9-16', ratioLabel: '9:16 VERTICAL STORY', dims: '1080×1920', src: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1920.jpg' },
    { id: 'mcl-16-9', brand: 'McLaren Golf', campaign: 'Series 3 Irons Launch', ratio: '16:9', ratioKey: '16-9', ratioLabel: '16:9 DISPLAY NETWORK', dims: '1920×1080', src: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1920x1080.jpg' },
    { id: 'gg-1-1', brand: 'Galvin Green / PXG', campaign: 'Flash Deals Sponsored', ratio: '1:1', ratioKey: '1-1', ratioLabel: '1:1 FEED MASTER', dims: '1080×1080', src: 'assets/optimized/new_additions/GG PXG L&S JKN Flash Deals Sponsored Ads 1080x1080 1.jpg' },
    { id: 'gg-9-16', brand: 'Galvin Green / PXG', campaign: 'Flash Deals Sponsored', ratio: '9:16', ratioKey: '9-16', ratioLabel: '9:16 VERTICAL STORY', dims: '1080×1920', src: 'assets/optimized/new_additions/GG PXG L&S JKN Flash Deals Sponsored Ads 1080x1920 1.jpg' },
    { id: 'gg-16-9', brand: 'Galvin Green / PXG', campaign: 'Flash Deals Sponsored', ratio: '16:9', ratioKey: '16-9', ratioLabel: '16:9 DISPLAY NETWORK', dims: '1920×1080', src: 'assets/optimized/new_additions/GG PXG L&S JKN Flash Deals Sponsored Ads 1920x1080 1.jpg' }
  ];

  let currentPetalAngle = 0;
  let activePetalIndex = 0;
  let activePetalFilter = 'all';
  let isPetalDragging = false;
  let petalDragStartX = 0;
  let petalDragStartAngle = 0;
  const PETAL_TOTAL = 12;
  const PETAL_STEP = 360 / PETAL_TOTAL; // 30 degrees
  const PETAL_RADIUS = 215; // Arc radius for circumference alignment

  // Complete Unabridged Nivara Suite (All 13 Spreads)
  const OVERVIEW_NIVARA_SPREADS = [
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-01.jpg', title: 'Brand Philosophy & Concept Architecture', label: 'Spread 01 · Concept Architecture' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-02.jpg', title: 'Logomark Grid & Geometric Ratios', label: 'Spread 02 · Logomark Geometry' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-03.jpg', title: 'Primary Logotype Anatomy & Clearspace', label: 'Spread 03 · Logotype Clearspace' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-04.jpg', title: 'Botanical Color Harmony & Tonal Palette', label: 'Spread 04 · Botanical Color System' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-05.jpg', title: 'Botanical Monogram & Embossed Glyphs', label: 'Spread 05 · Botanical Monogram' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-06.jpg', title: 'Typographic Hierarchy & Editorial Grids', label: 'Spread 06 · Typography Hierarchy' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-07.jpg', title: 'Primary Packaging System & Glass Bottles', label: 'Spread 07 · Primary Packaging' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-08.jpg', title: 'Carton Packaging Dielines & Foil Stamp', label: 'Spread 08 · Carton Dielines' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-09.jpg', title: 'Secondary Packaging & Embellishment Specs', label: 'Spread 09 · Secondary Packaging' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-10.jpg', title: 'Unboxing Ritual & Interior Liner Patterns', label: 'Spread 10 · Unboxing Ritual' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-11.jpg', title: 'Digital Brand Portal & Responsive E-Commerce', label: 'Spread 11 · Digital Merchandising' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-12.jpg', title: 'Spatial Retail Merchandising & Boutique Fixtures', label: 'Spread 12 · Retail Fixtures' },
    { src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-13.jpg', title: 'Production Compliance & Global Print Standards', label: 'Spread 13 · Print Standards' }
  ];
  let currentNivaraSpreadIdx = 0;

  // --- B. STORY HIGHLIGHTS NAVIGATION CONTROLLER ---
  function initStoryHighlights() {
    const scroller = document.getElementById('ag-highlights-scroller');
    if (!scroller) return;

    // Apply visited rings from session state
    visitedStories.forEach(k => {
      document.querySelectorAll(`.ag-story-highlight-item[data-story="${k}"], .ag-story-node[data-story="${k}"]`).forEach(btn => {
        btn.classList.add('is-visited');
      });
    });
  }

  // Backward compatibility alias for legacy tests
  function initInfiniteRhombusLoop() {
    initStoryHighlights();
  }

  // --- C. STORY VIEWER MODAL CONTROLLER ---
  function openStoryViewer(storyKey) {
    if (!STORY_KEYS.includes(storyKey)) storyKey = 'omnichannel';
    activeStoryKey = storyKey;
    activeStoryIndex = STORY_KEYS.indexOf(storyKey);

    visitedStories.add(storyKey);
    document.querySelectorAll(`.ag-story-highlight-item[data-story="${storyKey}"], .ag-story-node[data-story="${storyKey}"]`).forEach(btn => {
      btn.classList.add('is-visited');
    });

    const modal = document.getElementById('ag-story-viewer-modal');
    if (!modal) return;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    renderStoryProgressBar();
    mountBespokeStoryView(storyKey);

    const indexBadge = document.getElementById('ag-story-index-badge');
    if (indexBadge) {
      indexBadge.textContent = `${String(activeStoryIndex + 1).padStart(2, '0')} / 09`;
    }

    if (typeof playUiSound === 'function') {
      playUiSound(920, 'sine', 0.04);
    }
  }

  function closeStoryViewer() {
    const modal = document.getElementById('ag-story-viewer-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    // Pause any modal video
    const video = document.getElementById('ag-cinema-modal-video');
    if (video) {
      try { video.pause(); } catch (_) {}
    }
  }

  function renderStoryProgressBar() {
    const container = document.getElementById('ag-story-progress-bar');
    if (!container) return;
    container.innerHTML = '';

    STORY_KEYS.forEach((key, idx) => {
      const seg = document.createElement('div');
      seg.className = 'ag-story-progress-segment';
      if (idx < activeStoryIndex) seg.classList.add('is-viewed');
      if (idx === activeStoryIndex) seg.classList.add('is-active');
      container.appendChild(seg);
    });
  }

  function navigateStoryHighlight(direction, event) {
    if (event) event.stopPropagation();
    let nextIdx = activeStoryIndex + (direction === 'next' ? 1 : -1);

    if (nextIdx < 0) {
      closeStoryViewer();
      return;
    }
    if (nextIdx >= STORY_KEYS.length) {
      closeStoryViewer();
      return;
    }

    transitionToStoryHighlight(STORY_KEYS[nextIdx]);
  }

  function transitionToStoryHighlight(targetKey) {
    activeStoryKey = targetKey;
    activeStoryIndex = STORY_KEYS.indexOf(targetKey);

    visitedStories.add(targetKey);
    document.querySelectorAll(`.ag-story-highlight-item[data-story="${targetKey}"], .ag-story-node[data-story="${targetKey}"]`).forEach(btn => {
      btn.classList.add('is-visited');
    });

    renderStoryProgressBar();
    mountBespokeStoryView(targetKey);

    const indexBadge = document.getElementById('ag-story-index-badge');
    if (indexBadge) {
      indexBadge.textContent = `${String(activeStoryIndex + 1).padStart(2, '0')} / 09`;
    }
  }

  function mountBespokeStoryView(key) {
    const modal = document.getElementById('ag-story-viewer-modal');
    if (!modal) return;

    modal.classList.toggle('is-petal-mode', key === 'omnichannel');

    document.querySelectorAll('.ag-bespoke-story-view').forEach(view => {
      view.classList.remove('is-active');
    });

    const targetView = document.getElementById(`ag-story-view-${key}`);
    if (targetView) {
      targetView.classList.add('is-active');
    }

    const subtitles = {
      omnichannel: 'Omnichannel Campaigns',
      cinema: 'Film & Motion',
      nivara: 'Nivara Brand Identity',
      hardware: 'Tour Equipment Campaigns',
      retail: 'Responsive Storefronts',
      posters: 'Spectrum of Mind Exhibition',
      crm: 'CRM Email Systems',
      ai: 'Generative AI Direction',
      lookbooks: 'Retail Print Lookbooks'
    };
    const subEl = document.getElementById('ag-story-modal-subtitle');
    if (subEl) subEl.textContent = subtitles[key] || 'Irene Thomas Portfolio';

    if (key === 'omnichannel') {
      initPetalDial();
    }
    if (key === 'cinema') {
      const cinemaVid = document.getElementById('ag-cinema-modal-video');
      if (cinemaVid) {
        hydrateVideoSources(cinemaVid);
        try { cinemaVid.play().catch(() => {}); } catch (_) {}
      }
    }
  }

  let wasPetalDragged = false;

  // --- D. RADIAL PETAL DIAL (OMNICHANNEL 360° CIRCULAR WHEEL) ---
  function initPetalDial() {
    const wheelPlanes = document.querySelectorAll('.ag-petal-wheel-plane, #ag-petal-wheel-plane, #ag-feed-petal-wheel-plane');
    if (wheelPlanes.length === 0) return;

    wheelPlanes.forEach(plane => {
      // Avoid re-populating if 12 cards already exist
      if (plane.children.length === OMNICHANNEL_PETAL_CARDS.length) return;
      plane.innerHTML = '';
      OMNICHANNEL_PETAL_CARDS.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = `ag-petal-mini-card is-ratio-${card.ratioKey}`;
        cardEl.dataset.idx = idx;
        cardEl.dataset.ratio = card.ratioKey;
        cardEl.setAttribute('role', 'button');
        cardEl.setAttribute('tabindex', '0');
        cardEl.setAttribute('aria-label', `${card.brand} — ${card.campaign} (${card.ratioLabel})`);
        cardEl.draggable = false;
        cardEl.addEventListener('dragstart', (e) => e.preventDefault());
        cardEl.onclick = (e) => {
          e.stopPropagation();
          if (wasPetalDragged) return;
          selectPetalCard(idx);
        };

        const img = document.createElement('img');
        img.src = card.src;
        img.alt = `${card.brand} - ${card.campaign} (${card.ratio})`;
        img.loading = 'lazy';
        img.draggable = false;
        cardEl.appendChild(img);

        plane.appendChild(cardEl);
      });
    });

    updatePetalPositions();
    renderPetalStage(activePetalIndex);

    // Bind dragging events to all petal dial wrappers (excluding outer filter overlay)
    document.querySelectorAll('.ag-petal-dial-wrapper').forEach(wrapper => {
      if (wrapper.dataset.listenerAttached) return;
      wrapper.dataset.listenerAttached = 'true';

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startAngle = 0;
      let isHorizontalSwipe = false;

      const handlePointerStart = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        startAngle = currentPetalAngle;
        isHorizontalSwipe = false;
        wasPetalDragged = false;
      };

      const handlePointerMove = (clientX, clientY, e) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (!isHorizontalSwipe) {
          if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalSwipe = true;
            wasPetalDragged = true;
          } else if (Math.abs(dy) > 10) {
            isDragging = false;
            return;
          }
        }

        if (isHorizontalSwipe) {
          if (e && e.cancelable) {
            e.preventDefault();
          }
          wasPetalDragged = true;
          currentPetalAngle = startAngle + (dx * 0.38);
          updatePetalPositions();
        }
      };

      const handlePointerEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (!isHorizontalSwipe) return;
        isHorizontalSwipe = false;
        setTimeout(() => { wasPetalDragged = false; }, 100);

        let closestCardIdx = Math.round(-currentPetalAngle / PETAL_STEP);
        if (activePetalFilter !== 'all') {
          // Snap to the nearest card that matches the active filter
          const ratioOffset = activePetalFilter === '1-1' ? 0 : (activePetalFilter === '9-16' ? 1 : 2);
          const brandIndex = Math.round((closestCardIdx - ratioOffset) / 3);
          closestCardIdx = brandIndex * 3 + ratioOffset;
        }
        snapToPetal(closestCardIdx);
      };

      wrapper.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handlePointerStart(e.clientX, e.clientY);
        const onMouseMove = (me) => handlePointerMove(me.clientX, me.clientY, me);
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          handlePointerEnd();
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      wrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
        }
      }, { passive: false });

      wrapper.addEventListener('touchend', handlePointerEnd, { passive: true });
      wrapper.addEventListener('touchcancel', handlePointerEnd, { passive: true });
    });
  }

  function updatePetalPositions() {
    const cards = document.querySelectorAll('.ag-petal-mini-card');
    cards.forEach((card) => {
      const idx = parseInt(card.dataset.idx, 10);
      let angleDeg = (idx * PETAL_STEP + currentPetalAngle) % 360;
      if (angleDeg > 180) angleDeg -= 360;
      if (angleDeg < -180) angleDeg += 360;

      const isMatchingRatio = (activePetalFilter === 'all' || card.dataset.ratio === activePetalFilter);

      if (Math.abs(angleDeg) <= 80) {
        card.style.display = 'block';
        const normDist = Math.abs(angleDeg) / 80;
        const scale = 1.05 - (normDist * 0.22);
        let opacity = 1.0 - (normDist * 0.40);

        if (!isMatchingRatio) {
          opacity *= 0.22;
          card.style.pointerEvents = 'none';
        } else {
          card.style.pointerEvents = 'auto';
        }

        card.style.transform = `rotate(${angleDeg}deg) translateY(-${PETAL_RADIUS}px) scale(${scale})`;
        card.style.opacity = opacity;
        card.classList.toggle('is-active-petal', Math.abs(angleDeg) < PETAL_STEP / 2 && isMatchingRatio);
      } else {
        card.style.display = 'none';
        card.classList.remove('is-active-petal');
      }
    });
  }

  function snapToPetal(targetIdx) {
    let normalizedTarget = (targetIdx % PETAL_TOTAL + PETAL_TOTAL) % PETAL_TOTAL;
    activePetalIndex = normalizedTarget;
    renderPetalStage(normalizedTarget);
    const targetAngle = -targetIdx * PETAL_STEP;
    const startAngle = currentPetalAngle;
    const startTime = performance.now();
    const duration = 280;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      currentPetalAngle = startAngle + (targetAngle - startAngle) * ease;
      updatePetalPositions();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        currentPetalAngle = -normalizedTarget * PETAL_STEP;
        updatePetalPositions();
        renderPetalStage(normalizedTarget);
      }
    }
    requestAnimationFrame(step);
  }

  function selectPetalCard(idx) {
    snapToPetal(idx);
    if (typeof playUiSound === 'function') {
      playUiSound(880, 'triangle', 0.03);
    }
  }

  function renderPetalStage(idx) {
    const card = OMNICHANNEL_PETAL_CARDS[idx];
    if (!card) return;

    // Update images in both feed and modal
    document.querySelectorAll('#ag-petal-active-stage-img, .ag-petal-stage-img, #ag-omnichannel-active-img').forEach(img => {
      img.src = card.src;
      img.alt = `${card.brand} - ${card.campaign} (${card.ratioLabel})`;
    });

    // Update brand text
    document.querySelectorAll('#ag-petal-hud-brand, .ag-petal-hud-brand').forEach(b => {
      b.textContent = card.brand.toUpperCase();
    });

    // Update title text
    document.querySelectorAll('#ag-petal-hud-title, .ag-petal-hud-title').forEach(t => {
      t.textContent = `${card.campaign} · ${card.dims}`;
    });

    // Update ratio pill / badge
    document.querySelectorAll('#ag-petal-hud-ratio, .ag-petal-hud-ratio, #ag-omnichannel-spec-pill').forEach(r => {
      r.textContent = card.ratioLabel;
    });

    // Update dimensions pill
    document.querySelectorAll('#ag-petal-hud-dims, .ag-petal-hud-dims').forEach(d => {
      d.textContent = `${card.dims} PX`;
    });

    // Update stage aspect ratio class
    document.querySelectorAll('#ag-omnichannel-stage, .ag-omnichannel-stage').forEach(st => {
      st.className = st.className.replace(/\bis-ratio-[\w-]+\b/g, '').trim() + ` is-ratio-${card.ratioKey}`;
    });
  }

  function filterPetalDial(ratioKey, btn) {
    activePetalFilter = ratioKey;
    document.querySelectorAll('.ag-petal-filter-btn, .ag-omnichannel-ratio-btn').forEach(b => {
      const text = (b.textContent || '').trim().toLowerCase();
      const bFilter = b.dataset.filter || (text.includes('all') ? 'all' : (text.includes('9:16') ? '9-16' : (text.includes('16:9') ? '16-9' : (text.includes('1:1') ? '1-1' : ''))));
      b.classList.toggle('is-active', bFilter === ratioKey);
    });

    if (ratioKey !== 'all') {
      const currentBrand = Math.floor(activePetalIndex / 3);
      const ratioOffset = ratioKey === '1-1' ? 0 : (ratioKey === '9-16' ? 1 : 2);
      const targetIdx = currentBrand * 3 + ratioOffset;
      if (targetIdx >= 0 && targetIdx < OMNICHANNEL_PETAL_CARDS.length) {
        snapToPetal(targetIdx);
      } else {
        const firstMatch = OMNICHANNEL_PETAL_CARDS.findIndex(c => c.ratioKey === ratioKey);
        if (firstMatch !== -1) snapToPetal(firstMatch);
      }
    } else {
      updatePetalPositions();
    }
  }

  function openActivePetalLightbox() {
    const card = OMNICHANNEL_PETAL_CARDS[activePetalIndex] || OMNICHANNEL_PETAL_CARDS[0];
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(card.src, `${card.brand} — ${card.campaign}`, `${card.ratioLabel} · ${card.dims} px`);
    }
  }

  function switchOmnichannelRatio(ratio, buttonEl) {
    const ratioKey = ratio === '9:16' ? '9-16' : (ratio === '16:9' ? '16-9' : '1-1');
    filterPetalDial(ratioKey, buttonEl);
  }

  // --- E. NIVARA BOTANICAL ARCHITECTURE (UNABRIDGED SUITE) ---
  function switchNivaraSpread(idx, btn) {
    if (idx < 0 || idx >= OVERVIEW_NIVARA_SPREADS.length) return;
    currentNivaraSpreadIdx = idx;

    document.querySelectorAll('.ag-folio-pill').forEach(b => {
      const bIdx = parseInt(b.dataset.spreadIdx, 10);
      b.classList.toggle('is-active', bIdx === idx);
    });
    if (btn) btn.classList.add('is-active');

    const spread = OVERVIEW_NIVARA_SPREADS[idx];
    const img = document.getElementById('ag-nivara-spread-img');
    const num = document.getElementById('ag-nivara-spread-num');
    const title = document.getElementById('ag-nivara-spread-title');

    if (img && spread) img.src = spread.src;
    if (num) num.textContent = `SPREAD ${String(idx + 1).padStart(2, '0')} / 13`;
    if (title && spread) title.textContent = spread.title;

    const scroller = document.getElementById('ag-nivara-pills-scroller');
    const activePill = scroller ? scroller.querySelector(`.ag-folio-pill[data-spread-idx="${idx}"]`) : null;
    if (scroller && activePill) {
      const targetLeft = Math.max(0, activePill.offsetLeft - (scroller.clientWidth - activePill.offsetWidth) / 2);
      scroller.scrollLeft = targetLeft;
    }

    if (typeof playUiSound === 'function') {
      playUiSound(840, 'triangle', 0.02);
    }
  }

  function stepNivaraSpread(delta) {
    const nextIdx = (currentNivaraSpreadIdx + delta + OVERVIEW_NIVARA_SPREADS.length) % OVERVIEW_NIVARA_SPREADS.length;
    const targetBtn = document.querySelector(`.ag-folio-pill[data-spread-idx="${nextIdx}"]`);
    switchNivaraSpread(nextIdx, targetBtn);
  }

  function toggleNivaraDielines() {
    const overlay = document.getElementById('ag-nivara-dielines-overlay');
    const btn = document.getElementById('ag-nivara-cad-btn');
    const handle = document.getElementById('ag-nivara-peel-handle');
    if (overlay) {
      const active = overlay.classList.toggle('is-active');
      if (btn) btn.classList.toggle('is-active', active);
      overlay.style.clipPath = active
        ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
        : 'polygon(0 0, 0% 0, 0% 100%, 0 100%)';
      if (handle) {
        handle.style.left = active ? '100%' : '0%';
      }
    }
    if (typeof playUiSound === 'function') {
      playUiSound(1020, 'sine', 0.03);
    }
  }

  function openActiveNivaraLightbox() {
    const s = OVERVIEW_NIVARA_SPREADS[currentNivaraSpreadIdx] || OVERVIEW_NIVARA_SPREADS[0];
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(s.src, `Nivara Botanical Cosmetics — ${s.label}`, s.title);
    }
  }

  function selectNivaraArtifact(src, title) {
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(src, `Nivara Botanical Cosmetics — ${title}`, 'Brand Identity System');
    }
  }

  // Nivara Modal Controller
  function switchNivaraModalSpread(idx, btn) {
    const img = document.getElementById('ag-nivara-modal-spread-img');
    const tag = document.getElementById('ag-nivara-modal-tag');
    document.querySelectorAll('.ag-nivara-thumb-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const s = OVERVIEW_NIVARA_SPREADS[idx];
    if (s && img) {
      img.src = s.src;
      if (tag) tag.textContent = s.label;
    }
  }

  function toggleNivaraModalDielines() {
    const overlay = document.getElementById('ag-nivara-modal-dielines');
    if (overlay) overlay.classList.toggle('is-active');
  }

  // --- F. KINETIC CINEMA & AUTHENTIC EPISODIC ARTBOARD ---
  function syncSpatialAudioUi(isPlaying) {
    isGlobalSpatialAudioPlaying = Boolean(isPlaying);
    const hudBtn = document.getElementById('ag-hud-audio-btn');
    const barneyPill = document.getElementById('ag-barney-audio-pill');
    if (hudBtn) hudBtn.classList.toggle('is-playing', isGlobalSpatialAudioPlaying);
    if (barneyPill) {
      barneyPill.classList.toggle('is-playing', isGlobalSpatialAudioPlaying);
      const label = barneyPill.querySelector('.ag-commentary-label');
      if (label) {
        label.textContent = isGlobalSpatialAudioPlaying
          ? "Sound on — tap to mute"
          : "Tap to play with sound";
      }
    }
  }

  function toggleMobileVideoAudio(btn, videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;
    hydrateVideoSources(video);
    video.muted = !video.muted;
    if (!video.muted || video.paused) {
      try { video.play().catch(() => {}); } catch (_) {}
    }
    if (videoId === 'ag-overview-barney-video') {
      syncSpatialAudioUi(!video.muted);
      return;
    }
    if (btn) {
      btn.classList.toggle('is-playing', !video.muted);
      const label = btn.querySelector('.ag-commentary-label');
      if (label) {
        label.textContent = video.muted
          ? "Tap to play with sound"
          : "Sound on — tap to mute";
      } else {
        btn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
      }
    }
  }

  // --- G. OTHER DYNAMIC MODULES ---
  function switchHardwareSpecimen(hwKey, btn) {
    document.querySelectorAll('.ag-hw-switch-card').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const img = document.getElementById('ag-hardware-active-img');
    const moi = document.getElementById('ag-hw-stat-moi');
    const cor = document.getElementById('ag-hw-stat-cor');
    const wt = document.getElementById('ag-hw-stat-wt');
    const loft = document.getElementById('ag-hw-stat-loft');

    const specs = {
      callaway: { src: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg', moi: '10,000+ G·CM²', cor: '0.830 MAX COR', wt: '198.5 GRAMS', loft: '±2.0° ADJUST' },
      taylormade: { src: 'assets/optimized/TaylorMade_Qi4D_Series_900x600.jpg', moi: '9,850 G·CM²', cor: '0.825 HIGH COR', wt: '215.0 GRAMS', loft: '±1.5° ADJUST' },
      pxg: { src: 'assets/optimized/PXG_GEN8_Irons_900x600.jpg', moi: 'HOLLOW BODY', cor: '0.815 FORGED', wt: '245.0 GRAMS', loft: 'STANDARD LIE' }
    };

    const d = specs[hwKey];
    if (d && img) {
      img.src = d.src;
      if (moi) moi.textContent = d.moi;
      if (cor) cor.textContent = d.cor;
      if (wt) wt.textContent = d.wt;
      if (loft) loft.textContent = d.loft;
    }
  }

  // Storefront Morphing Station
  function morphStorefrontViewport(device, btn) {
    document.querySelectorAll('.ag-vp-pill').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const container = document.getElementById('ag-vp-stage-container');
    const indicator = document.getElementById('ag-vp-res-indicator');

    if (container) {
      container.className = `ag-viewport-stage-container is-${device}-ratio`;
    }

    const labels = {
      desktop: '1920 × 600 px · Desktop (16:5)',
      app: '900 × 600 px · Tablet (3:2)',
      mobile: '640 × 427 px · Mobile (3:2)'
    };
    if (indicator) indicator.textContent = labels[device] || labels.desktop;
  }

  function switchStorefrontBrand(brand, btn) {
    document.querySelectorAll('.ag-sf-brand-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const img = document.getElementById('ag-vp-active-img');
    const brands = {
      nicklaus: 'assets/optimized/new_additions/Jack Nicklaus Collection _ Slider Mobile 640x427.jpg',
      adidas: 'assets/optimized/new_additions/Adidas New Collection _ Slider Mobile 640x427.jpg',
      jlindeberg: 'assets/optimized/new_additions/JLindeberg 30Y Collection Slider Mobile 640x427.jpg'
    };
    if (img && brands[brand]) img.src = brands[brand];
  }

  // VIP CRM Dispatch
  let activeOverviewCrmKey = 'vip';
  const OVERVIEW_CRM_DATA = {
    vip: {
      low: 'assets/optimized/new_additions/crm_vip_launch_750w.webp',
      high: 'assets/optimized/new_additions/crm_vip_launch_1500w.webp',
      title: 'VIP Email Campaign · Irene Thomas Collection'
    },
    majors: {
      low: 'assets/optimized/new_additions/crm_major_tournaments_750w.webp',
      high: 'assets/optimized/new_additions/crm_major_tournaments_1500w.webp',
      title: 'Major Tournaments Campaign · Callaway Regional'
    },
    vessel: {
      low: 'assets/optimized/new_additions/crm_vessel_luxury_750w.webp',
      high: 'assets/optimized/new_additions/crm_vessel_luxury_1500w.webp',
      title: 'Vessel Luxury Cart Bag · TaylorMade Collaboration'
    }
  };

  function switchOverviewCrm(campaign, btn) {
    activeOverviewCrmKey = campaign;
    document.querySelectorAll('.ag-crm-pill').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const img = document.getElementById('ag-overview-crm-img');
    const c = OVERVIEW_CRM_DATA[campaign] || OVERVIEW_CRM_DATA.vip;
    if (img && c) img.src = c.low;
  }

  function inspectActiveCrmAsset() {
    const c = OVERVIEW_CRM_DATA[activeOverviewCrmKey] || OVERVIEW_CRM_DATA.vip;
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(c.high, `${c.title} — 1500w Retina Inspection`, '5,000px Ultra-Long Continuous Pre-Press Master');
    }
  }

  // Generative AI
  function switchGenAiConcept(src, btn) {
    document.querySelectorAll('.ag-genai-thumb-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const img = document.getElementById('ag-genai-active-img');
    if (img) img.src = src;
  }

  // Retail Lookbooks
  const LOOKBOOK_BRANDS = {
    gfore: {
      port: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens.jpg',
      land: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens Landscape.jpg'
    },
    greyson: {
      port: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/Greyson/Greyson 03 01 2026_A4.jpg',
      land: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/Greyson/Greyson 03 01 2026_A4 lanscape.jpg'
    },
    jlindeberg: {
      port: "assets/optimized/new_additions/A4 Posters - New Arrivals (2)/J.Lindeberg/J.Lindeberg 24 02 26 A4 Men's.jpg",
      land: "assets/optimized/new_additions/A4 Posters - New Arrivals (2)/J.Lindeberg/J.Lindeberg 24 02 26 A4 Landscape Men's.jpg"
    },
    nike: {
      port: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/Nike/NIKE 19 02 26 A4 M.jpg',
      land: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/Nike/NIKE 19 02 26 A4 landscape M.jpg'
    },
    ua: {
      port: 'assets/optimized/new_additions/UA_FW25 20 12 2025 A4 1.jpg',
      land: 'assets/optimized/new_additions/UA_FW25 20 12 2025 A4 Landscape 1.jpg'
    }
  };

  let activeLookbookBrand = 'gfore';
  function switchLookbookBrand(brand, btn) {
    activeLookbookBrand = brand;
    document.querySelectorAll('.ag-lb-brand-pill').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const portImg = document.getElementById('ag-lb-portrait-img');
    const landImg = document.getElementById('ag-lb-landscape-img');

    const d = LOOKBOOK_BRANDS[brand] || LOOKBOOK_BRANDS.gfore;
    if (portImg) portImg.src = d.port;
    if (landImg) landImg.src = d.land;
  }

  function openActiveLookbookInLightbox(type) {
    const portImg = document.getElementById('ag-lb-portrait-img');
    const landImg = document.getElementById('ag-lb-landscape-img');
    const src = (type === 'portrait' ? (portImg && portImg.src) : (landImg && landImg.src)) || '';
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(src, `Luxury POS Lookbook — ${activeLookbookBrand.toUpperCase()}`, `DIN A4 ${type.toUpperCase()} Master Print`);
    }
  }

  // --- H. MODAL HELPERS (CINEMA, HARDWARE, STOREFRONT, CRM, AI, EXHIBITION) ---
  function switchCinemaModalReel(reelKey, btn) {
    const video = document.getElementById('ag-cinema-modal-video');
    const title = document.getElementById('ag-cinema-modal-title');
    document.querySelectorAll('.ag-cinema-reel-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const reels = {
      barney: { src: 'assets/optimized/Barney_Dale__The_Cloud_story_arc.mp4', poster: 'assets/optimized/Barney_Dale__The_Cloud_story_arc_poster.webp', title: 'Barney Dale: The Cloud' },
      galvin: { src: 'assets/optimized/Galvin_Green_New_Collection.mp4', poster: 'assets/optimized/Galvin_Green_New_Collection_poster.webp', title: 'Galvin Green Collection' },
      lab: { src: 'assets/optimized/LAB_Golf_DF3__Back_in_stock.mp4', poster: 'assets/optimized/LAB_Golf_DF3__Back_in_stock_poster.webp', title: 'L.A.B. Golf DF3 Campaign' },
      part: { src: 'assets/optimized/new_additions/PART SALE 2026 Apparel Story.mp4', poster: 'assets/optimized/new_additions/PART_SALE_2026_Apparel_Story_poster.webp', title: 'Seasonal Apparel Story' }
    };
    const r = reels[reelKey];
    if (r && video) {
      video.src = r.src;
      video.dataset.hydrated = 'true';
      video.poster = r.poster;
      if (title) title.textContent = r.title;
      try { video.play().catch(() => {}); } catch (_) {}
    }
  }

  function switchHardwareModal(hwKey, btn) {
    const img = document.getElementById('ag-hw-modal-img');
    const name = document.getElementById('ag-hw-modal-name');
    document.querySelectorAll('.ag-hw-modal-tab').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    const data = {
      callaway: { src: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg', name: 'Callaway Quantum Tour Driver' },
      taylormade: { src: 'assets/optimized/TaylorMade_Qi4D_Series_900x600.jpg', name: 'TaylorMade Qi4D Hybrid System' },
      pxg: { src: 'assets/optimized/PXG_GEN8_Irons_900x600.jpg', name: 'PXG GEN8 Forged Irons' }
    };
    const d = data[hwKey];
    if (d && img) {
      img.src = d.src;
      if (name) name.textContent = d.name;
    }
  }

  function morphStorefrontModalDev(devKey, btn) {
    document.querySelectorAll('.ag-sf-modal-pill').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
  }

  function switchStorefrontModalBrand(brandKey, btn) {
    const img = document.getElementById('ag-sf-modal-img');
    document.querySelectorAll('.ag-sf-modal-brand, .ag-sf-modal-brand-btn').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
    const brands = {
      nicklaus: 'assets/optimized/new_additions/Jack Nicklaus Collection _ Slider Mobile 640x427.jpg',
      adidas: 'assets/optimized/new_additions/Adidas New Collection _ Slider Mobile 640x427.jpg',
      jlindeberg: 'assets/optimized/new_additions/JLindeberg 30Y Collection Slider Mobile 640x427.jpg'
    };
    if (img && brands[brandKey]) img.src = brands[brandKey];
  }

  const EXHIBITION_SETS = [
    {
      src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-01.jpg',
      title: 'Spectrum of Mind · Set 03',
      sub: 'Helvetica Neue Light · Swiss Typography Asymmetry'
    },
    {
      src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-01.jpg',
      title: 'Spectrum of Mind · Set 04',
      sub: 'Akzidenz-Grotesk · Chromatic Tension & Grid Systems'
    },
    {
      src: 'assets/optimized/posters/Mental Health Awareness Poster Set 5-01.jpg',
      title: 'Spectrum of Mind · Set 05',
      sub: 'Univers Condensed · High-Contrast Minimalist Balance'
    }
  ];
  let activeExhibitionIdx = 0;

  function switchExhibitionModal(idx, btn) {
    if (typeof idx === 'string' && idx.startsWith('p')) {
      idx = parseInt(idx.replace('p', ''), 10) - 1;
    }
    if (idx < 0 || idx >= EXHIBITION_SETS.length) return;
    activeExhibitionIdx = idx;
    const item = EXHIBITION_SETS[idx];
    const img = document.getElementById('ag-museum-modal-img');
    const title = document.getElementById('ag-museum-modal-title');
    const type = document.getElementById('ag-museum-modal-type');

    document.querySelectorAll('.ag-museum-tab, .ag-ex-tab').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');

    if (img) img.src = item.src;
    if (title) title.textContent = item.title;
    if (type) type.textContent = item.sub;
  }

  function openActiveExhibitionLightbox() {
    const item = EXHIBITION_SETS[activeExhibitionIdx] || EXHIBITION_SETS[0];
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(item.src, item.title, item.sub);
    }
  }

  function switchCrmModalCampaign(campaignKey, btn) {
    activeOverviewCrmKey = campaignKey;
    const img = document.getElementById('ag-crm-modal-img');
    document.querySelectorAll('.ag-crm-modal-pill, .ag-crm-m-pill').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
    const c = OVERVIEW_CRM_DATA[campaignKey] || OVERVIEW_CRM_DATA.vip;
    if (img && c) img.src = c.low;
  }

  const GENAI_CONCEPTS = [
    { src: 'assets/optimized/new_additions/689352046_18580395709020262_5220540874800235796_n.jpg', label: 'Concept 01 · Liquid Chrome' },
    { src: 'assets/optimized/new_additions/690140026_18580395751020262_7846448488869614368_n.jpg', label: 'Concept 02 · Volumetric Sole' },
    { src: 'assets/optimized/new_additions/708881960_18585805291020262_4494170539801241625_n.jpg', label: 'Concept 03 · Aerodynamic Weave' }
  ];
  let activeGenAiIdx = 0;

  function switchGenAiModalConcept(idx, btn) {
    if (typeof idx === 'string' && idx.startsWith('c')) {
      idx = parseInt(idx.replace('c', ''), 10) - 1;
    }
    if (idx < 0 || idx >= GENAI_CONCEPTS.length) return;
    activeGenAiIdx = idx;
    const img = document.getElementById('ag-ai-modal-img');
    document.querySelectorAll('.ag-ai-m-tab, .ag-ai-modal-thumb').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
    if (img) img.src = GENAI_CONCEPTS[idx].src;
  }

  function openActiveGenAiLightbox() {
    const item = GENAI_CONCEPTS[activeGenAiIdx] || GENAI_CONCEPTS[0];
    if (typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(item.src, `AI Visual Concept — ${item.label}`, 'AI Visual Direction · Concept Study');
    }
  }

  function switchLookbookModalBrand(lbKey, btn) {
    activeLookbookBrand = lbKey;
    document.querySelectorAll('.ag-lb-m-btn, .ag-lb-modal-tab').forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
    const d = LOOKBOOK_BRANDS[lbKey] || LOOKBOOK_BRANDS.gfore;
    const portImg = document.getElementById('ag-lb-modal-portrait-img');
    const landImg = document.getElementById('ag-lb-modal-landscape-img');
    if (portImg) portImg.src = d.port;
    if (landImg) landImg.src = d.land;
  }

  // --- H. THE OPEN 2026 IN-STORE CHAMPIONSHIP COLLATERAL ---
  const THE_OPEN_ASSETS = [
    { src: 'assets/optimized/new_additions/The Open Major Offers 2026 A4 UAE Select Stores 1.jpg', label: 'The Open 2026 · A4 Store Collateral' },
    { src: 'assets/optimized/new_additions/The Open Major Offers 2026 A4 TDM DHM.jpg', label: 'The Open 2026 · A4 Merchandising' },
    { src: 'assets/optimized/new_additions/The Open Major Offers 2026 Hanging Banner mockup.jpg', label: 'The Open 2026 · Hanging Banner Mockup' },
    { src: 'assets/optimized/new_additions/Ryan Fox The Open 2026 Champion Post.jpg', label: 'The Open 2026 · Championship Social (1080×1080)' }
  ];
  let activeTheOpenIdx = 0;

  function switchTheOpenAsset(idx, btn) {
    if (idx < 0 || idx >= THE_OPEN_ASSETS.length) return;
    activeTheOpenIdx = idx;
    const asset = THE_OPEN_ASSETS[idx];
    const img = document.getElementById('ag-the-open-active-img');
    const spec = document.getElementById('ag-the-open-spec');
    if (img) img.src = asset.src;
    if (spec) spec.textContent = asset.label;

    document.querySelectorAll('.ag-the-open-btn').forEach((b, i) => {
      b.classList.toggle('is-active', i === idx);
    });
    if (btn) btn.classList.add('is-active');

    if (typeof playUiSound === 'function') {
      playUiSound(840, 'sine', 0.02);
    }
  }

  function openActiveTheOpenLightbox() {
    const asset = THE_OPEN_ASSETS[activeTheOpenIdx];
    if (asset && typeof openLightboxWithImage === 'function') {
      openLightboxWithImage(asset.src, 'The Open 2026 — In-Store Merchandising', asset.label);
    }
  }

  // Dummy fallback for legacy calls
  function initBarneyComicScroller() {}


  // ==========================================================================
  // SPATIAL MONOGRAPH CONTROLLER (100DVH SNAP ENGINE, FLOATING HUD & BESPOKE ACTS)
  // ==========================================================================

  let activeSpatialAct = 'ag-act-omnichannel';
  let isGlobalSpatialAudioPlaying = false;

  function dimSpatialHud(dimState) {
    const hud = document.getElementById('ag-spatial-compass-hud');
    if (hud) hud.classList.toggle('ag-hud-dimmed', Boolean(dimState));
  }

  function toggleSpatialChapterIndex(forceState) {
    const indexModal = document.getElementById('ag-radial-chapter-index');
    const capsuleBtn = document.getElementById('ag-compass-capsule');
    if (!indexModal) return;
    const isOpen = (typeof forceState === 'boolean') ? forceState : !indexModal.classList.contains('is-open');
    indexModal.classList.toggle('is-open', isOpen);
    indexModal.setAttribute('aria-hidden', String(!isOpen));
    if (capsuleBtn) capsuleBtn.setAttribute('aria-expanded', String(isOpen));
  }

  function syncSpatialActHud(act) {
    if (!act) return;
    activeSpatialAct = act.id;
    const actNum = act.dataset.act || '01';
    const actName = act.dataset.actName || 'OMNICHANNEL';

    const hudIndicator = document.getElementById('ag-hud-act-indicator');
    if (hudIndicator) {
      const numEl = hudIndicator.querySelector('.ag-hud-act-num');
      const labelEl = hudIndicator.querySelector('.ag-hud-act-label');
      if (numEl) numEl.textContent = `${String(actNum).padStart(2, '0')} / 08`;
      if (labelEl) labelEl.textContent = actName;
    }
    const compassName = document.getElementById('ag-compass-act-name');
    if (compassName) {
      compassName.textContent = `${String(actNum).padStart(2, '0')} / 08 · ${actName}`;
    }

    document.querySelectorAll('.ag-chapter-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.actTarget === act.id);
    });
  }

  function jumpToSpatialAct(actId, btn) {
    const actEl = document.getElementById(actId);
    const root = document.getElementById('atelier-gram-root');
    if (actEl) {
      if (root && activeTab !== 'feed') {
        switchAtelierGramTab('feed', false);
      }
      actEl.scrollIntoView({ behavior: 'instant', block: 'start' });
      syncSpatialActHud(actEl);
    }
    toggleSpatialChapterIndex(false);
    if (btn) {
      document.querySelectorAll('.ag-chapter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    }
  }

  function toggleGlobalSpatialAudio() {
    const barneyVideo = document.getElementById('ag-overview-barney-video');
    const nextState = !isGlobalSpatialAudioPlaying;
    syncSpatialAudioUi(nextState);
    if (barneyVideo) {
      hydrateVideoSources(barneyVideo);
      if (nextState) {
        barneyVideo.muted = false;
        barneyVideo.play().catch(() => {});
      } else {
        barneyVideo.muted = true;
      }
    }
    if (typeof playUiSound === 'function') {
      playUiSound(540, 'sine', 0.05);
    }
  }

  function startColophonClock() {
    const clockEl = document.getElementById('ag-colophon-live-time');
    if (!clockEl) return;
    function updateClock() {
      const now = new Date();
      // Dubai GST is UTC+4
      const dubaiTime = new Date(now.getTime() + (now.getTimezoneOffset() + 240) * 60000);
      const h = String(dubaiTime.getHours()).padStart(2, '0');
      const m = String(dubaiTime.getMinutes()).padStart(2, '0');
      const s = String(dubaiTime.getSeconds()).padStart(2, '0');
      if (clockEl) clockEl.textContent = `Dubai (GST): ${h}:${m}:${s} · Available for commissions`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  function initBarneyJogWheel() {
    const dial = document.getElementById('ag-barney-jogwheel');
    const container = document.getElementById('ag-barney-jogwheel-container');
    const viewport = document.getElementById('ag-barney-filmstrip-viewport');
    const track = document.getElementById('ag-barney-filmstrip-track');
    const sceneTag = document.getElementById('ag-barney-scene-tag');
    if (!dial || !track || !viewport) return;

    let isDragging = false;
    let startX = 0;
    let totalDragDist = 0;
    let suppressViewportClick = false;
    let jogAngle = 0;
    let panPercent = 0;

    function onStart(e) {
      if (e.type === 'mousedown') e.preventDefault();
      isDragging = true;
      totalDragDist = 0;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      dimSpatialHud(true);
    }

    function onMove(e) {
      if (!isDragging) return;
      const currentX = (e.touches ? e.touches[0].clientX : e.clientX);
      const dx = currentX - startX;
      startX = currentX;
      totalDragDist += Math.abs(dx);

      jogAngle += dx * 1.8;
      dial.style.transform = `rotate(${jogAngle}deg)`;

      panPercent = Math.max(0, Math.min(100, panPercent - (dx / (viewport.clientWidth || 390)) * 125));

      const maxOffset = track.scrollWidth - (viewport.clientWidth || 390);
      const offset = (panPercent / 100) * Math.max(0, maxOffset);
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;

      if (sceneTag) {
        if (panPercent < 25) sceneTag.textContent = 'STAGE 01: PROLOGUE';
        else if (panPercent < 50) sceneTag.textContent = 'STAGE 02: ASCENT';
        else if (panPercent < 75) sceneTag.textContent = 'STAGE 03: TURBULENCE';
        else sceneTag.textContent = 'STAGE 04: RESOLUTION';
      }
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      if (totalDragDist > 6) {
        suppressViewportClick = true;
        setTimeout(() => { suppressViewportClick = false; }, 80);
      }
      dimSpatialHud(false);
    }

    dial.addEventListener('mousedown', onStart);
    dial.addEventListener('touchstart', onStart, { passive: true });
    if (container) {
      container.addEventListener('mousedown', onStart);
      container.addEventListener('touchstart', onStart, { passive: true });
    }
    viewport.addEventListener('mousedown', onStart);
    viewport.addEventListener('touchstart', onStart, { passive: true });
    viewport.addEventListener('click', (e) => {
      if (suppressViewportClick) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  function initNivaraPeelSlider() {
    const canvas = document.getElementById('ag-nivara-spread-canvas');
    const handle = document.getElementById('ag-nivara-peel-handle');
    const overlay = document.getElementById('ag-nivara-dielines-overlay');
    const cadBtn = document.getElementById('ag-nivara-cad-btn');
    if (!canvas || !handle || !overlay) return;

    let isDragging = false;

    function updatePeel(clientX) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percent = (x / rect.width) * 100;
      handle.style.left = `${percent}%`;
      overlay.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
      const active = percent > 1;
      overlay.classList.toggle('is-active', active);
      if (cadBtn) cadBtn.classList.toggle('is-active', active);
    }

    function onStart(e) {
      if (e.type === 'mousedown') e.preventDefault();
      isDragging = true;
      dimSpatialHud(true);
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      updatePeel(clientX);
    }

    function onMove(e) {
      if (!isDragging) return;
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      updatePeel(clientX);
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      dimSpatialHud(false);
    }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: true });
    handle.addEventListener('click', (e) => e.stopPropagation());
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  function initGenAiWipeSlider() {
    const canvas = document.getElementById('ag-genai-bifurcated-canvas');
    const handle = document.getElementById('ag-genai-wipe-handle');
    const clippedLayer = document.getElementById('ag-genai-wipe-clipped-layer');
    if (!canvas || !handle || !clippedLayer) return;

    let isDragging = false;

    function updateWipe(clientX) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percent = (x / rect.width) * 100;
      handle.style.left = `${percent}%`;
      clippedLayer.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
    }

    function onStart(e) {
      if (e.type === 'mousedown') e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      dimSpatialHud(true);
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      updateWipe(clientX);
    }

    function onMove(e) {
      if (!isDragging) return;
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      updateWipe(clientX);
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      dimSpatialHud(false);
    }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: true });
    handle.addEventListener('click', (e) => e.stopPropagation());
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  function initCrmRetinaLoupe() {
    const loupe = document.getElementById('ag-crm-retina-loupe');
    const viewport = document.getElementById('ag-overview-crm-viewport');
    if (!loupe || !viewport) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let loupeX = 20, loupeY = 20;

    function onStart(e) {
      isDragging = true;
      dimSpatialHud(true);
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
    }

    function onMove(e) {
      if (!isDragging) return;
      const cx = (e.touches ? e.touches[0].clientX : e.clientX);
      const cy = (e.touches ? e.touches[0].clientY : e.clientY);
      const dx = cx - startX;
      const dy = cy - startY;
      startX = cx;
      startY = cy;

      const rect = viewport.getBoundingClientRect();
      loupeX = Math.max(10, Math.min(rect.width - 130, loupeX + dx));
      loupeY = Math.max(10, Math.min(rect.height - 130, loupeY + dy));

      loupe.style.left = `${loupeX}px`;
      loupe.style.top = `${loupeY}px`;
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      dimSpatialHud(false);
    }

    loupe.addEventListener('mousedown', onStart);
    loupe.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  function initColophonVCard() {
    const card = document.getElementById('ag-colophon-vcard');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -12;
      const rotateY = (x - 0.5) * 12;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty('--sheen-x', `${x * 100}%`);
      card.style.setProperty('--sheen-y', `${y * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    });
  }

  function initArchiveSwatchDeck() {
    const deck = document.getElementById('ag-archive-swatch-deck');
    if (!deck) return;
    const pCard = document.getElementById('ag-lb-portrait-card');
    const lCard = document.getElementById('ag-lb-landscape-card');
    if (!pCard || !lCard) return;

    let isFlipped = false;
    function applyDeckState() {
      if (isFlipped) {
        pCard.style.transform = 'translate3d(18px, 12px, -30px) rotate(4deg)';
        pCard.style.zIndex = '5';
        pCard.style.opacity = '0.75';
        lCard.style.transform = 'translate3d(0, 0, 20px) rotate(-1deg)';
        lCard.style.zIndex = '10';
        lCard.style.opacity = '1';
      } else {
        pCard.style.transform = 'translate3d(0, 0, 20px) rotate(-1deg)';
        pCard.style.zIndex = '10';
        pCard.style.opacity = '1';
        lCard.style.transform = 'translate3d(18px, 12px, -30px) rotate(4deg)';
        lCard.style.zIndex = '5';
        lCard.style.opacity = '0.75';
      }
    }

    deck.addEventListener('click', (e) => {
      const clickedPortrait = pCard.contains(e.target);
      const clickedLandscape = lCard.contains(e.target);
      if (clickedPortrait && isFlipped) {
        e.stopPropagation();
        isFlipped = false;
        applyDeckState();
      } else if (clickedLandscape && !isFlipped) {
        e.stopPropagation();
        isFlipped = true;
        applyDeckState();
      } else if (!clickedPortrait && !clickedLandscape) {
        isFlipped = !isFlipped;
        applyDeckState();
      }
    }, true);
  }

  function initSpatialMonographEngine() {
    const acts = document.querySelectorAll('.ag-spatial-act');
    if (acts.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          syncSpatialActHud(entry.target);
        }
      });
    }, { threshold: [0.25, 0.5] });

    acts.forEach(act => observer.observe(act));

    const barneyVideo = document.getElementById('ag-overview-barney-video');
    if (barneyVideo) {
      barneyVideo.addEventListener('click', () => {
        hydrateVideoSources(barneyVideo);
        if (barneyVideo.paused) {
          barneyVideo.play().catch(() => {});
        } else {
          barneyVideo.pause();
        }
      });
    }

    startColophonClock();
    initBarneyJogWheel();
    initNivaraPeelSlider();
    initGenAiWipeSlider();
    initCrmRetinaLoupe();
    initColophonVCard();
    initArchiveSwatchDeck();
  }

  // --- I. INITIALIZATION & ROUTING ---
  function initAtelierRouting() {
    window.addEventListener('popstate', (e) => {
      const modal = document.getElementById('ag-story-viewer-modal');
      if (modal && modal.classList.contains('is-open')) {
        closeStoryViewer();
        return;
      }
      const lb = document.getElementById('atelier-lightbox-modal');
      if (lb && lb.classList.contains('is-open')) {
        if (typeof closeLightboxModal === 'function') {
          closeLightboxModal(false);
          return;
        }
      }
      const hash = window.location.hash.replace('#', '') || 'feed';
      const targetTab = TAB_MAP[hash] || 'feed';
      switchAtelierGramTab(targetTab, false);
    });

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && TAB_MAP[initialHash]) {
      switchAtelierGramTab(initialHash, false);
    } else {
      switchAtelierGramTab('feed', false);
    }
  }

  let isAtelierGramInitialized = false;
  function initAtelierGram() {
    const isMobile = (window.AtelierMode && window.AtelierMode.isMobile()) ||
      document.documentElement.dataset.mode === 'mobile';

    if (!isMobile || isAtelierGramInitialized) return;
    isAtelierGramInitialized = true;

    initStoryHighlights();
    initPetalDial();
    initSpatialMonographEngine();
    initCarouselScrollListeners();
    initReelsScrollListener();
    initAtelierRouting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAtelierGram);
  } else {
    initAtelierGram();
  }

  window.addEventListener('resize', initAtelierGram);
  window.addEventListener('atelier:modechange', initAtelierGram);
  window.addEventListener('modechange', initAtelierGram);

  // Global Exports
  window.switchAtelierGramTab = switchAtelierGramTab;
  window.toggleMobileReelAudio = toggleMobileReelAudio;
  if (!window.toggleReelAudio) {
    window.toggleReelAudio = toggleMobileReelAudio;
  }
  window.handlePostDoubleTap = handlePostDoubleTap;
  window.togglePostLike = togglePostLike;
  window.toggleSpecsDrawer = toggleSpecsDrawer;
  window.switchStorefrontRatio = switchStorefrontRatio;
  window.switchOmnichannelRatio = switchOmnichannelRatio;
  window.filterExploreGallery = filterExploreGallery;
  window.switchCrmCampaign = switchCrmCampaign;
  window.inspectActiveCrmAsset = inspectActiveCrmAsset;
  window.openDmConversation = openDmConversation;
  window.closeDmConversation = closeDmConversation;
  window.switchProfileDossierTab = switchProfileDossierTab;

  // Highlights & Overview Exports
  window.initStoryHighlights = initStoryHighlights;
  window.initInfiniteRhombusLoop = initInfiniteRhombusLoop;
  window.openStoryViewer = openStoryViewer;
  window.closeStoryViewer = closeStoryViewer;
  window.navigateStoryHighlight = navigateStoryHighlight;
  window.transitionToStoryHighlight = transitionToStoryHighlight;
  window.selectPetalCard = selectPetalCard;
  window.filterPetalDial = filterPetalDial;
  window.openActivePetalLightbox = openActivePetalLightbox;
  window.initPetalDial = initPetalDial;

  // Modal Exports
  window.switchCinemaModalReel = switchCinemaModalReel;
  window.switchNivaraModalSpread = switchNivaraModalSpread;
  window.toggleNivaraModalDielines = toggleNivaraModalDielines;
  window.switchHardwareModal = switchHardwareModal;
  window.morphStorefrontModalDev = morphStorefrontModalDev;
  window.switchStorefrontModalBrand = switchStorefrontModalBrand;
  window.switchExhibitionModal = switchExhibitionModal;
  window.openActiveExhibitionLightbox = openActiveExhibitionLightbox;
  window.switchCrmModalCampaign = switchCrmModalCampaign;
  window.switchGenAiModalConcept = switchGenAiModalConcept;
  window.openActiveGenAiLightbox = openActiveGenAiLightbox;
  window.switchLookbookModalBrand = switchLookbookModalBrand;
  window.openActiveLookbookInLightbox = openActiveLookbookInLightbox;

  // Dynamic Modules Exports
  window.toggleMobileVideoAudio = toggleMobileVideoAudio;
  window.switchNivaraSpread = switchNivaraSpread;
  window.stepNivaraSpread = stepNivaraSpread;
  window.toggleNivaraDielines = toggleNivaraDielines;
  window.openActiveNivaraLightbox = openActiveNivaraLightbox;
  window.selectNivaraArtifact = selectNivaraArtifact;
  window.switchHardwareSpecimen = switchHardwareSpecimen;
  window.morphStorefrontViewport = morphStorefrontViewport;
  window.switchStorefrontBrand = switchStorefrontBrand;
  window.switchOverviewCrm = switchOverviewCrm;
  window.switchGenAiConcept = switchGenAiConcept;
  window.switchLookbookBrand = switchLookbookBrand;
  window.switchTheOpenAsset = switchTheOpenAsset;
  window.openActiveTheOpenLightbox = openActiveTheOpenLightbox;

  // Spatial Monograph Exports
  window.dimSpatialHud = dimSpatialHud;
  window.toggleSpatialChapterIndex = toggleSpatialChapterIndex;
  window.jumpToSpatialAct = jumpToSpatialAct;
  window.toggleGlobalSpatialAudio = toggleGlobalSpatialAudio;
  window.initSpatialMonographEngine = initSpatialMonographEngine;

})();
