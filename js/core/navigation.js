// =========================================================
// UNIFIED SCROLL ENGINE & GROUNDED SECTOR DETECTION
// =========================================================
let currentSectorIndex = 0;
let isHudAnimating = false;

// DOM References Cache for maximum scroll performance
let _dom = null;
function getNavDom() {
  if (!_dom) {
    _dom = {
      hudScrollPct: document.getElementById('hud-scroll-pct'),
      dockReach: document.getElementById('nav-dock-reach'),
      bgAstrolabe: document.getElementById('bg-vector-astrolabe'),
      bgGuideH: document.getElementById('bg-vector-guide-h'),
      wmHero: document.getElementById('wm-hero'),
      wmMatrix: document.getElementById('wm-matrix'),
      streamSec: document.getElementById('stream-works'),
      trackLeft: document.getElementById('track-left'),
      trackCenter: document.getElementById('track-center'),
      trackRight: document.getElementById('track-right'),
      barneySec: document.getElementById('section-barney'),
      resumeSec: document.getElementById('resume'),
      beacon: document.getElementById('grounded-beacon'),
      spine: document.querySelector('.grounded-drafting-spine'),
      spineProg: document.getElementById('grounded-spine-progress'),
      capNum: document.getElementById('thumb-cap-num'),
      capTitle: document.getElementById('thumb-cap-title'),
      capPct: document.getElementById('thumb-cap-pct'),
      hudDisplay: document.querySelector('.bg-hud-large-display'),
      hudNum: document.getElementById('bg-hud-num'),
      hudTitle: document.getElementById('bg-hud-title'),
      headerCode: document.getElementById('header-sector-code'),
      headerName: document.getElementById('header-sector-name'),
      header: document.querySelector('.grounded-atelier-header'),
      barneyHeadline: document.querySelector('#section-barney .section-headline-row'),
      barneyStage: document.querySelector('#section-barney .frame-cinema-stage'),
      node05: document.querySelector('.grounded-nav-node[data-sector="section-barney"]'),
      postersSec: document.getElementById('section-posters'),
      cinemaIgniteElements: document.querySelectorAll('#section-barney .section-headline-row, #section-barney .frame-cinema-stage, #section-barney .spec-node, #section-barney .vertical-motion-reel-card, #section-barney .reel-context-content')
    };
  }
  return _dom;
}

// =========================================================
// SYNCHRONIZED BURN WAVEFRONT PHYSICAL CONTACT ENGINE (MOBILE OPTIMIZED)
// =========================================================
let _lastSyncState = null;
let _lastIgnitedStatus = false;

function syncBurnWavefrontContact(status) {
  if (!status) return;
  const dom = getNavDom();
  if (!dom) return;

  const isDark = (status.state === 'dark');
  const isLight = (status.state === 'light');

  // Fast-path deduplication: Avoid layout queries and DOM updates when settled
  if (status.state === _lastSyncState && (isDark || isLight)) {
    return;
  }
  _lastSyncState = status.state;

  // 1. Header Synchronization (Fixed at Y = 0..50px)
  if (dom.header) {
    let isHeaderCinema = false;
    if (isDark) {
      isHeaderCinema = true;
    } else if (status.state === 'entry') {
      isHeaderCinema = status.waveY >= 25;
    } else if (status.state === 'exit') {
      isHeaderCinema = status.waveY < 25;
    }
    dom.header.classList.toggle('header-cinema-mode', isHeaderCinema);
  }

  // 2. Physical Element Contact Ignition across Transition Boundary (Strictly Scoped to Barney Dale Cinema Studio)
  const elements = dom.cinemaIgniteElements || (dom.cinemaIgniteElements = document.querySelectorAll(
    '#section-barney .section-headline-row, #section-barney .frame-cinema-stage, #section-barney .spec-node, #section-barney .vertical-motion-reel-card, #section-barney .reel-context-content'
  ));

  if (isDark) {
    if (!_lastIgnitedStatus) {
      elements.forEach(el => el.classList.add('burn-ignited'));
      _lastIgnitedStatus = true;
    }
  } else if (isLight) {
    if (_lastIgnitedStatus) {
      elements.forEach(el => el.classList.remove('burn-ignited'));
      _lastIgnitedStatus = false;
    }
  } else {
    // Active entry or exit dissolve wavefront crossing
    elements.forEach(el => {
      let isIgnited = false;
      if (status.state === 'entry') {
        const top = el.getBoundingClientRect().top;
        isIgnited = status.waveY >= top;
      } else if (status.state === 'exit') {
        const top = el.getBoundingClientRect().top;
        isIgnited = status.waveY < top;
      }
      el.classList.toggle('burn-ignited', isIgnited);
    });
    _lastIgnitedStatus = false;
  }

  // 3. Navigation Rail Node 05 & Header Active View Synchronization
  const node05 = dom.node05 || (dom.node05 = document.querySelector('.grounded-nav-node[data-sector="section-barney"]'));
  if (node05) {
    let isNode05Crossed = false;
    const postersSec = dom.postersSec || (dom.postersSec = document.getElementById('section-posters'));
    const isPastBarney = postersSec && postersSec.getBoundingClientRect().top <= window.innerHeight * 0.52;

    if (isPastBarney) {
      isNode05Crossed = false;
    } else if (status.state === 'entry') {
      const nodeRect = node05.getBoundingClientRect();
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;
      isNode05Crossed = status.waveY >= nodeCenterY;
    } else if (isDark) {
      isNode05Crossed = (currentSectorIndex === 4);
    }
    node05.classList.toggle('cinema-burn-illuminated', isNode05Crossed);

    if (isNode05Crossed && currentSectorIndex < 4) {
      const headerCode = dom.headerCode || (dom.headerCode = document.getElementById('header-sector-code'));
      const headerName = dom.headerName || (dom.headerName = document.getElementById('header-sector-name'));
      if (headerCode && headerName && headerName.innerText !== 'CINEMA STUDIO') {
        headerCode.innerText = '05';
        headerName.innerText = 'CINEMA STUDIO';
      }
    }
  }

  // 4. Global Dark Theme Envelope
  const isFullDark = isDark ||
                     (status.state === 'entry' && status.waveY >= window.innerHeight * 0.70) ||
                     (currentSectorIndex >= 4 && !isLight && status.exitProg < 0.70);

  if (isFullDark) {
    if (!document.body.classList.contains('theme-dark-cinema')) {
      document.body.classList.add('theme-dark-cinema');
    }
  } else {
    if (document.body.classList.contains('theme-dark-cinema')) {
      document.body.classList.remove('theme-dark-cinema');
    }
  }
}

if (window.BurningPaperEngine && window.BurningPaperEngine.onWavefrontUpdate) {
  window.BurningPaperEngine.onWavefrontUpdate(syncBurnWavefrontContact);
}

function onUnifiedScroll() {
  if (document.getElementById('layer-1-4')) {
    return; // PinnedBurnEngine manages navigation, sector tracking, and pinned themes
  }
  const dom = getNavDom();
  const scrollY = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

  // 1. Update Scroll Percentage Readout
  if (dom.hudScrollPct) {
    dom.hudScrollPct.innerText = `${Math.min(100, Math.round(scrollPct)).toString().padStart(2, '0')}% REACH`;
  }
  if (dom.dockReach) {
    dom.dockReach.innerText = `${Math.min(100, Math.round(scrollPct))}%`;
  }

  // 2. Background Vector Astrolabe Parallax & Rotation
  if (dom.bgAstrolabe) {
    dom.bgAstrolabe.setAttribute('transform', `translate(860, 480) rotate(${(scrollY * 0.15) % 360})`);
  }
  if (dom.bgGuideH) {
    const yPos = 350 + (scrollY * 0.1) % 400;
    dom.bgGuideH.setAttribute('y1', yPos);
    dom.bgGuideH.setAttribute('y2', yPos);
  }

  // 3. Kinetic Watermarks
  if (dom.wmHero) dom.wmHero.style.transform = `translate3d(${-scrollY * 0.18}px, 0, 0)`;
  if (dom.wmMatrix && dom.streamSec) {
    const rect = dom.streamSec.getBoundingClientRect();
    dom.wmMatrix.style.transform = `translate3d(${rect.top * 0.22}px, 0, 0)`;
  }

  // 4. Diagonal Matrix Parallax (Desktop screens > 860px)
  if (dom.streamSec && window.innerWidth > 860) {
    const rect = dom.streamSec.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
      const delta = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.08;
      if (dom.trackLeft) dom.trackLeft.style.transform = `translate3d(0, ${-delta * 1.2}px, 0)`;
      if (dom.trackCenter) dom.trackCenter.style.transform = `translate3d(0, ${delta * 1.5}px, 0)`;
      if (dom.trackRight) dom.trackRight.style.transform = `translate3d(0, ${-delta * 0.9}px, 0)`;
    }
  }

  // 5. Scroll-Linked Burn Transition Calculation (Pinpoint Mobile-Responsive Window)
  let entryProgress = 0;
  let exitProgress = 0;
  const isMobile = window.innerWidth <= 860;

  if (dom.barneySec) {
    const r = dom.barneySec.getBoundingClientRect();
    const startY = isMobile ? window.innerHeight * 0.96 : window.innerHeight * 0.88;
    const endY = isMobile ? window.innerHeight * 0.08 : window.innerHeight * 0.12;

    if (r.top <= startY) {
      entryProgress = Math.min(1, Math.max(0, (startY - r.top) / (startY - endY)));
    }
    if (r.top <= endY) {
      entryProgress = 1;
    }
  }

  if (dom.resumeSec) {
    const r = dom.resumeSec.getBoundingClientRect();
    const startY = isMobile ? window.innerHeight * 0.96 : window.innerHeight * 0.88;
    const endY = isMobile ? window.innerHeight * 0.08 : window.innerHeight * 0.12;

    if (r.top <= startY) {
      exitProgress = Math.min(1, Math.max(0, (startY - r.top) / (startY - endY)));
    }
    if (r.top <= endY) {
      exitProgress = 1;
    }
  }

  // Inform Burning Paper Canvas Engine
  BurningPaperEngine.setScrollProgress(entryProgress, exitProgress);

  // 6. Grounded Sector Spy & Precise Beacon Tracking
  let foundIndex = 0;
  const atPageBottom = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 60);
  const sectorEls = dom.sectorEls || (dom.sectorEls = dockSectors.map(s => document.getElementById(s.id)));

  if (atPageBottom) {
    foundIndex = dockSectors.length - 1;
  } else {
    for (let i = 0; i < dockSectors.length; i++) {
      const el = sectorEls[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.52) {
          foundIndex = i;
        }
      }
    }
  }

  const currentSec = dockSectors[foundIndex];

  // Precise Visual Indicator Dot & Progress Line Tracking (Strict Checkpoint Sync)
  const beacon = dom.beacon;
  const spine = dom.spine;
  const spineProg = dom.spineProg;
  
  // Update Mobile Floating Capsule Real-Time
  if (dom.capNum && dom.capTitle && dom.capPct) {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPctVal = scrollMax > 0 ? Math.round((window.pageYOffset / scrollMax) * 100) : 0;
    dom.capNum.innerText = currentSec.code;
    dom.capTitle.innerText = window.innerWidth <= 860 ? (currentSec.shortName || currentSec.name) : currentSec.name;
    dom.capPct.innerText = `${scrollPctVal}%`;
  }

      const activeNode = document.querySelector(`.grounded-nav-node[data-sector="${currentSec.id}"]`);

      if (spine && activeNode) {
        const spineRect = spine.getBoundingClientRect();
        const mark = activeNode.querySelector('.grounded-tick-mark') || activeNode;
        const markRect = mark.getBoundingClientRect();

        let interpTop = (markRect.top + markRect.height / 2) - spineRect.top;
        let interpLeft = (markRect.left + markRect.width / 2) - spineRect.left;

        if (foundIndex < dockSectors.length - 1) {
          const nextSecEl = document.getElementById(dockSectors[foundIndex + 1].id);
          const nextNode = document.querySelector(`.grounded-nav-node[data-sector="${dockSectors[foundIndex + 1].id}"]`);
          const currentSecEl = document.getElementById(currentSec.id);
          if (nextSecEl && nextNode && currentSecEl) {
            const secTop = currentSecEl.getBoundingClientRect().top + window.pageYOffset;
            const nextTop = nextSecEl.getBoundingClientRect().top + window.pageYOffset;
            const dist = nextTop - secTop;
            if (dist > 50) {
              const frac = Math.max(0, Math.min(1, (window.pageYOffset - (secTop - 60)) / dist));
              const nextMark = nextNode.querySelector('.grounded-tick-mark') || nextNode;
              const nextMarkRect = nextMark.getBoundingClientRect();
              const nextTopPos = (nextMarkRect.top + nextMarkRect.height / 2) - spineRect.top;
              const nextLeftPos = (nextMarkRect.left + nextMarkRect.width / 2) - spineRect.left;
              interpTop = interpTop + frac * (nextTopPos - interpTop);
              interpLeft = interpLeft + frac * (nextLeftPos - interpLeft);
            }
          }
        }

        if (isMobile) {
          // Horizontal Bottom Dock Tracking on Mobile
          if (beacon) {
            beacon.style.left = `${interpLeft}px`;
            beacon.style.top = '-8px';
          }
          if (spineProg) {
            spineProg.style.width = `${Math.max(0, interpLeft)}px`;
            spineProg.style.height = '2px';
          }
        } else {
          // Vertical Right Dock Tracking on Desktop
          if (beacon) {
            beacon.style.top = `${interpTop}px`;
            beacon.style.left = '-8px';
          }
          if (spineProg) {
            spineProg.style.height = `${Math.max(0, interpTop)}px`;
            spineProg.style.width = '2px';
          }
        }
      }

      // Update HUD and Header with smooth animations when sector changes
      if (foundIndex !== currentSectorIndex) {
        currentSectorIndex = foundIndex;

        // A. Smooth Bottom-Right HUD Animation
        const hudDisplay = document.querySelector('.bg-hud-large-display');
        const hudNum = document.getElementById('bg-hud-num');
        const hudTitle = document.getElementById('bg-hud-title');

        if (hudDisplay && hudNum && hudTitle) {
          hudDisplay.classList.add('hud-animating');
          setTimeout(() => {
            hudNum.innerText = currentSec.code;
            hudTitle.innerText = currentSec.name;
            hudDisplay.classList.remove('hud-animating');
          }, 140);
        }

        // B. Smooth Header Active Sector Name Animation
        const headerCode = document.getElementById('header-sector-code');
        const headerName = document.getElementById('header-sector-name');
        if (headerCode && headerName) {
          headerName.classList.add('sector-switching');
          setTimeout(() => {
            headerCode.innerText = currentSec.code;
            headerName.innerText = currentSec.name;
            headerName.classList.remove('sector-switching');
          }, 120);
        }

        // C. Update Grounded Nav Ticks
        document.querySelectorAll('.grounded-nav-node').forEach(node => {
          node.classList.toggle('active', node.getAttribute('data-sector') === currentSec.id);
        });

        playUiSound(700 + foundIndex * 45, 'sine', 0.04);
      }
    }

    function handleRailClick(e, sectorId) {
      if (e) e.preventDefault();
      const el = document.getElementById(sectorId);
      if (!el) return;

      const header = document.getElementById('grounded-header');
      const headerHeight = header ? header.offsetHeight : 50;

      // Find the primary text heading element inside the section for razor-sharp framing
      let targetHeading = el.querySelector('.section-eyebrow, .section-title, .stream-eyebrow, .dossier-archive-stamp, .hero-meta-badge');
      if (!targetHeading) targetHeading = el;

      // Exactly 16px of comfortable breathing room below the sticky header (matching section 2 & 5)
      const rect = targetHeading.getBoundingClientRect();
      const topOffset = rect.top + window.pageYOffset - (headerHeight + 16);

      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
      playUiSound(900, 'triangle', 0.08);
    }

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => { onUnifiedScroll(); scrollTicking = false; });
        scrollTicking = true;
      }
    }, { passive: true });

window.currentSectorIndex = currentSectorIndex;
window.onUnifiedScroll = onUnifiedScroll;
window.handleRailClick = handleRailClick;

// =========================================================
// INTERACTIVE NAVIGATION SPINE SCROLLBAR HANDLER (Req 4)
// =========================================================
// =========================================================
    (function initNavSpineInteraction() {
      const navSystem = document.getElementById('grounded-nav');
      if (!navSystem) return;

      function handleSpineNav(e, smooth = true) {
        const isMobile = window.innerWidth <= 860;
        const spine = document.getElementById('grounded-spine-track') || navSystem;
        const rect = spine.getBoundingClientRect();
        let pct = 0;
        if (isMobile) {
          const clickX = e.clientX - rect.left;
          pct = Math.max(0, Math.min(1, clickX / rect.width));
        } else {
          const clickY = e.clientY - rect.top;
          pct = Math.max(0, Math.min(1, clickY / rect.height));
        }
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: pct * docHeight, behavior: smooth ? 'smooth' : 'auto' });
      }

      let isDragging = false;
      navSystem.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.grounded-nav-node')) {
          isDragging = true;
          handleSpineNav(e, false);
        }
      });
      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          handleSpineNav(e, false);
        }
      });
      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      navSystem.addEventListener('click', (e) => {
        if (!e.target.closest('.grounded-nav-node')) {
          handleSpineNav(e, true);
        }
      });
    })();
