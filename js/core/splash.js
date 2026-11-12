// =========================================================================
// AUTHENTIC ADOBE PHOTOSHOP CC 2026 — AUTOMATED WEBPAGE BUILDER ENGINE
// Non-interactive, single-run choreographed multi-track parallel build
// of 100% of Sector 01 (Header, Left Rail, Right Spine, Background HUD,
// Watermark, Hero Grid, Portrait) with seamless zero-jump GPU affine unzoom.
// =========================================================================

(function initAutomatedPhotoshopBuilder() {
  const splashEl = document.getElementById('atelier-splash-screen');
  if (!splashEl) return;

  const artboard = document.getElementById('ps-webpage-artboard');
  const transformBox = document.getElementById('ps-transform-box');
  const transformDims = document.getElementById('ps-transform-dims');

  // Typographic Elements & Caret
  const typeL1 = document.getElementById('ps-type-l1');
  const typeL2 = document.getElementById('ps-type-l2');
  const typeL3 = document.getElementById('ps-type-l3');
  const typeCaret = document.getElementById('ps-type-caret');
  const wordCampaigns = document.getElementById('ps-line-2');

  // 6 Multi-Tool Authentic Photoshop Cursors
  const cursorMaster = document.getElementById('ps-canvas-cursor');
  const cursorShape = document.getElementById('ps-cursor-shape');
  const cursorPen = document.getElementById('ps-cursor-pen');
  const cursorTransform = document.getElementById('ps-cursor-transform');
  const cursorType = document.getElementById('ps-cursor-type');
  const cursorEyedropper = document.getElementById('ps-cursor-eyedropper');

  const tagMaster = document.getElementById('ps-cursor-tag');
  const tagShape = document.getElementById('ps-tag-shape');
  const tagPen = document.getElementById('ps-tag-pen');
  const tagTransform = document.getElementById('ps-tag-transform');
  const tagType = document.getElementById('ps-tag-type');
  const tagEyedropper = document.getElementById('ps-tag-eyedropper');

  // Vector Shape Drag Marquee & Smart Guides
  const shapeDragBox = document.getElementById('ps-shape-drag-box');
  const shapeDragLabel = document.getElementById('ps-shape-drag-label');
  const smartGuides = document.getElementById('ps-smart-guides');

  // Toolbar & Swatches
  const toolMove = document.getElementById('ps-tool-move');
  const toolMarquee = document.getElementById('ps-tool-marquee');
  const toolType = document.getElementById('ps-tool-type');
  const toolEyedropper = document.getElementById('ps-tool-eyedropper');
  const fgSwatch = document.getElementById('ps-toolbar-swatch-fg');

  // Color Panel
  const colorRing = document.getElementById('ps-color-target-ring');
  const colorHex = document.getElementById('ps-color-hex-val');
  const colorChip = document.getElementById('ps-color-chip');

  // Layer Styles
  const btnAddFx = document.getElementById('ps-btn-add-fx');
  const layerFxPill = document.getElementById('ps-layer-fx-pill');

  // Status Bar
  const workflowText = document.getElementById('ps-status-workflow-text');
  const zoomReadout = document.getElementById('ps-status-zoom');
  const tabFilename = document.getElementById('ps-tab-filename');
  const optionsCoords = document.getElementById('ps-options-coords');
  const progressFill = document.getElementById('ps-status-progress-fill');
  const progressPct = document.getElementById('ps-status-pct');

  // Preload Modal
  const loadingModal = document.getElementById('ps-loading-modal');
  const modalTaskLabel = document.getElementById('ps-modal-task-label');
  const modalPct = document.getElementById('ps-modal-pct');
  const modalFill = document.getElementById('ps-modal-progress-fill');

  let hasUnfolded = false;
  let isBackgroundReady = false;
  let assetProgressRatio = 0.25;

  // Global history tracker for automated testing verification
  window.__psBuilderHistory = {
    track1: false,
    track2: false,
    transformBoxWasActive: false,
    track3: false,
    snapCommitted: false,
    dropShadowApplied: false,
    track4: false,
    colorSampled: false,
    track5: false,
    allCompiled: false,
    unfolded: false
  };

  // =========================================================================
  // MINIMAL WEB AUDIO SFX ENGINE (GESTURE-GATED AUTOPLAY POLICY SAFEGUARD)
  // =========================================================================
  const SOUND_ENABLED = true;
  let audioCtx = null;
  let userHasInteracted = false;

  ['pointerdown', 'click', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, () => {
      userHasInteracted = true;
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    }, { once: true, passive: true });
  });

  function getAudioCtx() {
    if (!SOUND_ENABLED) return null;
    // Guard against browser autoplay warning:
    // "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page."
    const hasUserGesture = (navigator.userActivation && navigator.userActivation.hasBeenActive) || userHasInteracted;
    if (!hasUserGesture) {
      return null; // Silently skip Web Audio until the user interacts with the page
    }
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  let lastClickTime = 0;
  const psSfx = {
    // Ultra-subtle click for guide anchors and tool snaps (throttled to avoid main-thread hiccups)
    click(freq = 600, duration = 0.016, gainVal = 0.02) {
      try {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (now - lastClickTime < 45) return;
        lastClickTime = now;
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    },
    // Soft high-tick for typewriter characters
    typeTick() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = 950 + Math.random() * 200;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.012);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.012);
      } catch (e) {}
    },
    // Soft color eyedropper sample chime
    sample() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        [523.25, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.04);
          gain.gain.setValueAtTime(0.018, ctx.currentTime + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.04 + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.04);
          osc.stop(ctx.currentTime + i * 0.04 + 0.1);
        });
      } catch (e) {}
    },
    // Solid lock click on commit
    snap() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } catch (e) {}
    },
    // Authentic two-stage mechanical camera shutter sound (mirror slap + curtain snap)
    shutter() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.exponentialRampToValueAtTime(45, now + 0.04);
        gain1.gain.setValueAtTime(0.04, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.04);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(840, now + 0.035);
        osc2.frequency.exponentialRampToValueAtTime(140, now + 0.075);
        gain2.gain.setValueAtTime(0.035, now + 0.035);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.035);
        osc2.stop(now + 0.075);
      } catch (e) {}
    }
  };

  // Helper: activate a single tool in left toolbar
  function setActiveTool(activeEl) {
    const allTools = splashEl.querySelectorAll('.ps-tool-btn');
    allTools.forEach((btn) => btn.classList.remove('ps-tool-active'));
    if (activeEl) activeEl.classList.add('ps-tool-active');
  }

  // Helper: reveal & select a layer in the Layers panel
  function activateLayer(layerNum) {
    for (let i = 1; i <= 6; i++) {
      const row = document.getElementById(`ps-layer-${i}`);
      if (!row) continue;
      if (i <= layerNum) {
        row.classList.remove('is-hidden-layer');
      }
      row.classList.toggle('is-selected', i === layerNum);
    }
  }

  // Helper: update bottom status progress
  function setStatusProgress(pct, message) {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    if (progressFill) progressFill.style.width = `${clamped}%`;
    if (progressPct) progressPct.textContent = `${clamped}%`;
    if (message && workflowText) workflowText.textContent = message;
  }

  // Helper: move and toggle specific tool cursors with auto-flipping tags
  function setCursorPos(cursorEl, leftPct, topPct, labelText, tagEl) {
    if (!cursorEl) return;
    // Auto-flip tags when near the right or top boundary to prevent any clipping
    cursorEl.classList.toggle('tag-flip-x', leftPct > 68);
    cursorEl.classList.toggle('tag-flip-y', topPct < 15);
    cursorEl.style.left = `${leftPct}%`;
    cursorEl.style.top = `${topPct}%`;
    if (labelText !== undefined && tagEl) {
      tagEl.textContent = labelText;
    }
  }

  function triggerCursorClick(cursorEl) {
    if (!cursorEl) return;
    cursorEl.classList.add('is-clicking');
    setTimeout(() => cursorEl.classList.remove('is-clicking'), 160);
  }

  function setCursorActive(cursorEl, isActive, labelText, tagEl) {
    if (!cursorEl) return;
    cursorEl.classList.toggle('is-active', !!isActive);
    if (labelText !== undefined && tagEl) {
      tagEl.textContent = labelText;
    }
  }

  // Typewriter Character Streaming Engine
  function streamTypewriter(text, targetSpan, onChar, onComplete, speed = 26) {
    if (!targetSpan) {
      if (onComplete) onComplete();
      return;
    }
    let idx = 0;
    function step() {
      if (hasUnfolded) return;
      if (idx < text.length) {
        targetSpan.textContent += text[idx];
        idx++;
        if (onChar) onChar();
        setTimeout(step, speed);
      } else {
        if (onComplete) onComplete();
      }
    }
    step();
  }

  // =========================================================================
  // 1. REAL BACKGROUND & HERO ASSET PRELOADER (Drives BIOS Boot Screen)
  // =========================================================================
  let assetLoadingPromise = null;

  function preloadBackgroundAssets(onProgress) {
    const urlsToVerify = [
      'assets/optimized/new_additions/PP.jpg',
      'assets/brand/it_logo_white.png'
    ];

    const plateIds = ['ambient-blur-14-a', 'ambient-ghost-14-a', 'ambient-blur-57-a', 'ambient-blur-8-a'];
    plateIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const bg = window.getComputedStyle(el).backgroundImage || el.style.backgroundImage || '';
        const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1] && !urlsToVerify.includes(match[1])) {
          urlsToVerify.push(match[1]);
        }
      }
    });

    let loadedCount = 0;
    const totalTasks = urlsToVerify.length + 2; // + window.load + fonts.ready

    function markTaskDone(taskLabel) {
      loadedCount++;
      assetProgressRatio = Math.min(1, loadedCount / totalTasks);
      if (onProgress) {
        onProgress(assetProgressRatio, taskLabel);
      }
      if (loadingModal && loadingModal.classList.contains('is-visible')) {
        const pct = Math.min(99, Math.round(80 + assetProgressRatio * 19));
        if (modalPct) modalPct.textContent = `${pct}%`;
        if (modalFill) modalFill.style.width = `${pct}%`;
      }
    }

    const imagePromises = urlsToVerify.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { markTaskDone(`LOADED ${src.split('/').pop()}`); resolve(); };
        img.onerror = () => { markTaskDone(`CACHED ${src.split('/').pop()}`); resolve(); };
        img.src = src;
      });
    });

    const windowLoadPromise = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        markTaskDone('DOM & SCRIPTS READY');
        resolve();
      } else {
        window.addEventListener('load', () => {
          markTaskDone('DOM & SCRIPTS READY');
          resolve();
        }, { once: true });
      }
    });

    const fontsPromise = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.then(() => { markTaskDone('TYPOGRAPHY LOADED'); }).catch(() => { markTaskDone('FONTS READY'); })
      : Promise.resolve().then(() => { markTaskDone('FONTS READY'); });

    return Promise.all([...imagePromises, windowLoadPromise, fontsPromise]).then(() => {
      isBackgroundReady = true;
      if (onProgress) onProgress(1.0, 'ALL ASSETS LOADED // DUBAI 2026');
    });
  }

  // Kick off background preload immediately
  const assetsReadyPromise = preloadBackgroundAssets();

  // Responsive artboard scale calibration so the 100dvw × 100dvh artboard fits comfortably inside canvas
  function calibrateArtboardScale() {
    const vw = window.innerWidth || 1920;
    const vh = window.innerHeight || 1080;
    const dockOffsetW = vw <= 720 ? 24 : (vw <= 960 ? 64 : 320);
    const dockOffsetH = vw <= 720 ? 64 : 160;
    const availW = Math.max(280, vw - dockOffsetW);
    const availH = Math.max(280, vh - dockOffsetH);
    const scaleX = availW / vw;
    const scaleY = availH / vh;
    const fitScale = Math.min(scaleX, scaleY, 0.667);
    document.documentElement.style.setProperty('--ps-artboard-scale', fitScale.toFixed(4));

    const liveTitle = document.querySelector('#hero .hero-main-title');
    const psTitle = document.querySelector('#ps-hero-atelier .hero-main-title');
    if (liveTitle && psTitle) {
      psTitle.style.minHeight = `${liveTitle.offsetHeight}px`;
    }
    return fitScale;
  }

  // =========================================================================
  // 2. SEAMLESS ZERO-JUMP GPU AFFINE CAMERA UNZOOM
  // =========================================================================
  function unfoldIntoLiveWebpage() {
    if (hasUnfolded) return;
    hasUnfolded = true;
    if (window.__psBuilderHistory) window.__psBuilderHistory.unfolded = true;

    if (loadingModal) loadingModal.classList.remove('is-visible');
    setStatusProgress(100, '✦ Webpage Compilation Complete — Entering Full Screen View...');

    // Smoothly step zoom readouts during unzoom to 100.0%
    const zoomSchedule = [
      { t: 0, z: '66.7%' },
      { t: 180, z: '75.0%' },
      { t: 360, z: '85.0%' },
      { t: 540, z: '95.0%' },
      { t: 720, z: '100.0%' }
    ];
    zoomSchedule.forEach(({ t, z }) => {
      setTimeout(() => {
        if (zoomReadout) zoomReadout.textContent = `${z} ▾`;
        if (tabFilename) tabFilename.textContent = `irene-portfolio-webpage.psd @ ${z} (RGB/8*)`;
      }, t);
    });

    // Hide all cursors cleanly
    [cursorPen, cursorTransform, cursorType, cursorEyedropper, cursorMaster, cursorShape].forEach((c) => {
      if (c) c.classList.remove('is-active');
    });

    // Ensure final artboard state matches live #hero 100% before unzoom (even if skipped early)
    const artboard = document.getElementById('ps-webpage-artboard');
    if (artboard) {
      artboard.classList.remove('step-portrait-shape', 'step-portrait-place');
      artboard.classList.add(
        'step-paper', 'step-bg-hud', 'step-left-rail', 'step-right-spine',
        'step-header', 'step-type-stamp', 'step-type-color', 'step-details',
        'step-pills', 'step-portrait-snap', 'step-drop-shadow', 'step-guides-hide'
      );
      if (transformBox) transformBox.classList.remove('is-active');
      if (typeL1) typeL1.textContent = 'Elevated';
      if (typeL2) typeL2.textContent = 'Campaigns';
      if (typeL3) typeL3.textContent = '& Visual Identity';
      if (typeCaret) typeCaret.style.display = 'none';

      // 1. Measure the exact physical viewport position of the artboard inside the canvas (ZERO-JUMP AFFINE CAMERA)
      const rect = artboard.getBoundingClientRect();
      const currentScale = rect.width / (window.innerWidth || 1);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const tx = centerX - (window.innerWidth / 2);
      const ty = centerY - (window.innerHeight / 2);

      artboard.style.setProperty('--artboard-start-tx', `${tx.toFixed(1)}px`);
      artboard.style.setProperty('--artboard-start-ty', `${ty.toFixed(1)}px`);
      artboard.style.setProperty('--artboard-start-scale', currentScale.toFixed(4));

      // Reparent to splashEl so it flies out completely unclipped and unfaded by workstation wrapper
      splashEl.appendChild(artboard);
    }

    // 2. Trigger GPU Affine Camera Unzoom
    splashEl.classList.add('is-unfolding');

    // 3. Cross-fade seamlessly into live DOM once the 750ms unzoom has settled
    setTimeout(() => {
      splashEl.classList.add('is-fading-out');
    }, 760);

    // 4. Complete handoff and cleanly hide splash after cross-fade completes
    setTimeout(() => {
      splashEl.classList.add('is-loaded');
      splashEl.style.display = 'none';
    }, 980);
  }

  // Compatibility hook for automated suites
  window.dismissSplash = unfoldIntoLiveWebpage;

  // Timeline Spine Scrubbing Engine: drags reticle handle from Section 06 (~68%) up to Section 01 (0%)
  function scrubTimelineSpineToOverview(onComplete) {
    const spineProgress = document.getElementById('ps-spine-progress-fill');
    const spineReticle = document.getElementById('ps-spine-reticle');
    const nodes = document.querySelectorAll('#ps-spine-nodes-container .grounded-nav-node');

    if (!spineProgress || !spineReticle) {
      if (onComplete) onComplete();
      return;
    }

    setActiveTool(toolMove);
    const scrubCursor = cursorMaster || cursorShape || cursorTransform || cursorPen;
    setCursorActive(scrubCursor, true, 'Scrub: Section 06 → 01 OVERVIEW', tagShape || tagTransform || tagPen);
    setCursorPos(scrubCursor, 96.5, 68);
    triggerCursorClick(scrubCursor);
    psSfx.click(520, 0.018, 0.02);

    const startProgress = 68;
    const startTime = performance.now();
    const duration = 440; // ms

    function animateScrub(now) {
      if (hasUnfolded) return;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - t, 3);
      const currentPct = Math.max(0, startProgress * (1 - ease));

      spineProgress.style.height = `${currentPct}%`;
      spineReticle.style.top = `${currentPct}%`;
      setCursorPos(scrubCursor, 96.5, Math.max(8, currentPct));

      // Reverse node indexing (node 06 -> 05 -> 04 -> 03 -> 02 -> 01)
      const activeIdx = Math.min(7, Math.max(0, Math.floor((currentPct / 100) * 8)));
      nodes.forEach((n, idx) => {
        if (idx === activeIdx) {
          if (!n.classList.contains('active')) {
            n.classList.add('active');
            psSfx.typeTick();
          }
        } else {
          n.classList.remove('active');
        }
      });

      if (t < 1) {
        requestAnimationFrame(animateScrub);
      } else {
        // Lock firmly to Node 01 OVERVIEW
        spineProgress.style.height = '0%';
        spineReticle.style.top = '0%';
        nodes.forEach((n, idx) => {
          if (idx === 0) n.classList.add('active');
          else n.classList.remove('active');
        });
        psSfx.snap();
        triggerCursorClick(scrubCursor);
        setCursorActive(scrubCursor, false);

        const headerCenter = document.getElementById('ps-header-grounded-center');
        if (headerCenter) {
          headerCenter.innerHTML = `
            <div class="header-active-sector-display">
              <span class="header-sector-badge">CURRENT VIEW</span>
              <span class="header-sector-pipe">/</span>
              <span class="header-sector-code">01</span>
              <span class="header-sector-name">OVERVIEW</span>
            </div>
          `;
        }
        if (optionsCoords) {
          optionsCoords.textContent = 'Timeline: 01 OVERVIEW Locked (0.0% Scroll)   Status: Ready';
        }
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(animateScrub);
  }

  // =========================================================================
  // CONCEPT 3: MINIMALIST CURATORIAL VIEWFINDER FOCUS INTRO ENGINE
  // Soft Lens Blur Buffer (0% -> 100%) -> Focus Lock Snap -> Reticle Outward Expansion -> Photoshop Workspace
  // =========================================================================
  // 2. ATELIER VIEWFINDER FOCUS SEQUENCE (Beat 1 -> Beat 2 -> Beat 3)
  // =========================================================================
  function runViewfinderFocusAndLaunch(onComplete) {
    const stage = document.getElementById('atelier-viewfinder-stage');
    const frame = document.getElementById('viewfinder-frame');
    const subject = document.getElementById('viewfinder-subject');
    const centerTarget = document.getElementById('vf-center-target');
    const fill = document.getElementById('viewfinder-progress-fill');
    const statusText = document.getElementById('viewfinder-status-text');
    const flash = document.getElementById('viewfinder-shutter-flash');
    const workspaceWindow = document.getElementById('ps-workspace-window');

    if (!stage || !frame) {
      if (workspaceWindow) workspaceWindow.classList.add('is-revealed');
      if (onComplete) onComplete();
      return;
    }

    let isSkipped = false;
    function skipToWorkspace() {
      if (isSkipped) return;
      isSkipped = true;
      if (subject) {
        subject.classList.remove('is-focusing');
        subject.classList.add('is-locked');
      }
      if (frame) {
        frame.classList.add('is-locked');
      }
      if (centerTarget) {
        centerTarget.classList.add('is-locked');
      }
      stage.classList.add('is-expanding');
      setTimeout(() => {
        stage.classList.add('is-hidden');
        if (workspaceWindow) workspaceWindow.classList.add('is-revealed');
        if (onComplete) onComplete();
      }, 150);
    }

    // Allow user click or keypress to immediately snap & launch workspace
    stage.addEventListener('click', () => {
      skipToWorkspace();
    }, { once: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') skipToWorkspace();
    }, { once: true });

    // BEAT 1: REAL ASSET PRELOADING WITH LIVING LENS FOCUS BUFFER
    // Viewfinder HUD (reticle, ticks, frame) is ALWAYS 100% crisp!
    // Only the internal subject begins softly out of focus and rack-focuses to 4K sharp.
    let currentPct = 8;
    if (fill) fill.style.width = '8%';
    if (statusText) statusText.textContent = 'ACQUIRING FOCUS... 8%';

    const startTime = Date.now();
    const minFocusDuration = 1100; // 1.1s minimum so the optical lens focus is perceptible

    const preloadPromise = preloadBackgroundAssets((ratio, taskLabel) => {
      if (isSkipped) return;
      const pct = Math.max(currentPct, Math.round(10 + ratio * 90));
      currentPct = pct;
      if (fill) fill.style.width = `${pct}%`;
      if (statusText) statusText.textContent = `ACQUIRING FOCUS... ${pct}%`;
      psSfx.click(420 + ratio * 280, 0.012, 0.015);
    });

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, minFocusDuration));

    Promise.all([preloadPromise, minDelayPromise]).then(() => {
      if (isSkipped) return;

      // BEAT 2: 100% FOCUS SNAP & ATTENTION LOCK (Camera Shutter Click + Razor Sharp Clarity)
      if (fill) fill.style.width = '100%';
      if (statusText) statusText.textContent = '● FOCUS LOCKED // EXPOSURE READY';

      // Snap subject from blur(10px) to razor-sharp blur(0px)
      if (subject) {
        subject.classList.remove('is-focusing');
        subject.classList.add('is-locked');
      }
      if (frame) {
        frame.classList.add('is-locked');
      }
      if (centerTarget) {
        centerTarget.classList.add('is-locked');
      }

      // Authentic mechanical camera shutter sound
      psSfx.shutter();

      // Subtle optical shutter bloom
      if (flash) {
        flash.classList.add('is-flashing');
        setTimeout(() => flash.classList.remove('is-flashing'), 220);
      }

      // BEAT 3: VIEWFINDER DISSOLVES SEAMLESSLY INTO PHOTOSHOP CANVAS WORKSPACE
      // Hold crisp focused lock for 340ms so user registers the 4K optical clarity
      setTimeout(() => {
        if (isSkipped) return;

        // Reveal the Photoshop workspace window concurrently as the viewfinder stage dissolves
        if (workspaceWindow) workspaceWindow.classList.add('is-revealed');
        stage.classList.add('is-expanding');
        psSfx.click(680, 0.016, 0.02);

        setTimeout(() => {
          if (isSkipped) return;
          stage.classList.add('is-hidden');
          // Begin the Photoshop automated canvas build!
          if (onComplete) onComplete();
        }, 380);

      }, 340);

    });
  }

  // =========================================================================
  // 3. PUNCHIER MULTI-TRACK PARALLEL CHOREOGRAPHY (~3.5s)
  // Starts after DOM is loaded and active in viewport
  // =========================================================================
  function startChoreographedBuild() {
    // TRACK 1 (60ms): Living Background Plates + Vector Astrolabe + Cyan Guides + Left Rail Plotting
    setTimeout(() => {
      if (hasUnfolded) return;
      if (window.__psBuilderHistory) window.__psBuilderHistory.track1 = true;
      if (artboard) {
        artboard.classList.add('step-paper', 'step-guides', 'step-bg-hud', 'step-left-rail');
      }
      activateLayer(1);
      activateLayer(2);
      setCursorActive(cursorPen, true, 'Pen (P) // Plotting Architectural Rail', tagPen);
      setCursorPos(cursorPen, 16, 12);
      psSfx.click(680, 0.016, 0.02);

      if (optionsCoords) optionsCoords.textContent = 'Canvas: 1440 × 900 px   Guides: Cyan (#00E5FF)   Color: sRGB';
      setStatusProgress(14, 'Step 1/7: Blueprint Grid, Cyan Guides & Architectural Gallery Rail...');
    }, 60);

    // TRACK 2A (340ms): Rectangle Tool (U) — Drawing Portrait Card Vector Box
    setTimeout(() => {
      if (hasUnfolded) return;
      if (window.__psBuilderHistory) window.__psBuilderHistory.track2 = true;
      setActiveTool(toolMarquee || toolMove);
      activateLayer(3);

      setCursorActive(cursorPen, false);
      setCursorActive(cursorShape, true, 'Rectangle (U) // Draw 432 × 540', tagShape);
      setCursorPos(cursorShape, 64, 19);

      if (optionsCoords) optionsCoords.textContent = 'Rectangle Tool (U): Dragging Vector Shape   X: 894 px   Y: 170 px   W: 432 px   H: 540 px   R: 28 px';
      setStatusProgress(28, 'Step 2/7: Rectangle Tool (U) — Drawing Vector Shape (432 × 540 px)...');

      // Cursor drags diagonally to create shape
      setTimeout(() => {
        if (hasUnfolded) return;
        triggerCursorClick(cursorShape);
        setCursorPos(cursorShape, 88, 76, 'Rectangle (U) // 432 × 540 px [Release]', tagShape);
        if (artboard) artboard.classList.add('step-portrait-shape');
        psSfx.click(580, 0.016, 0.02);
      }, 160);
    }, 340);

    // TRACK 2B (780ms): Embedded Smart Object (PP.jpg) Drops at Intentional Slight Tilt (+3.0°)
    setTimeout(() => {
      if (hasUnfolded) return;
      if (window.__psBuilderHistory) {
        window.__psBuilderHistory.transformBoxWasActive = true;
      }
      setCursorActive(cursorShape, false);
      setActiveTool(toolMove);

      if (artboard) {
        artboard.classList.remove('step-portrait-shape');
        artboard.classList.add('step-portrait-place');
      }
      if (transformBox) transformBox.classList.add('is-active');
      if (transformDims) transformDims.textContent = 'W: 100.0%   H: 100.0%   ∠ +3.0°';

      setCursorActive(cursorTransform, true, 'Free Transform (Ctrl+T) // Rotate Handle', tagTransform);
      setCursorPos(cursorTransform, 88, 76);
      psSfx.click(420, 0.018, 0.025);

      if (optionsCoords) optionsCoords.textContent = 'SmartObj: PP.jpg   X: 894 px   Y: 170 px   W: 100.0%   H: 100.0%   ∠: +3.0°';
      setStatusProgress(42, 'Placing Embedded Smart Object [PP.jpg] (∠ +3.0°)...');

      // Rotate upright and snap to vertical guide at 1040ms
      setTimeout(() => {
        if (hasUnfolded) return;
        setCursorPos(cursorTransform, 85, 71, 'Snap Upright (∠ 0.0°)', tagTransform);
        if (transformDims) transformDims.textContent = 'W: 100.0%   H: 100.0%   ∠ 0.0°';
        if (artboard) {
          artboard.classList.remove('step-portrait-place');
          artboard.classList.add('step-portrait-snap');
        }
        if (smartGuides) smartGuides.classList.add('is-active');
        psSfx.snap();

        setTimeout(() => smartGuides && smartGuides.classList.remove('is-active'), 180);

        if (optionsCoords) optionsCoords.textContent = 'X: 894 px   Y: 170 px   W: 432 px   H: 540 px   ∠: 0.0°   [Enter to Commit]';
      }, 260);

      // Commit Free Transform + Layer Style fx Drop Shadow at 1260ms (No Clipping)
      setTimeout(() => {
        if (hasUnfolded) return;
        triggerCursorClick(cursorTransform);
        if (window.__psBuilderHistory) {
          window.__psBuilderHistory.track3 = true;
          window.__psBuilderHistory.snapCommitted = true;
          window.__psBuilderHistory.dropShadowApplied = true;
        }
        if (artboard) {
          artboard.classList.add('step-drop-shadow');
        }
        if (transformBox) transformBox.classList.remove('is-active');
        if (btnAddFx) btnAddFx.classList.add('is-active');
        if (layerFxPill) layerFxPill.classList.add('is-active');

        setCursorPos(cursorTransform, 84, 70, 'Commit Transform [Enter]', tagTransform);
        setTimeout(() => setCursorActive(cursorTransform, false), 220);

        if (optionsCoords) optionsCoords.textContent = 'X: 894 px   Y: 170 px   ∠: 0.0°   fx: Drop Shadow (0 30px 80px rgba(0,0,0,0.22))';
        setStatusProgress(55, 'Committed Free Transform Upright (∠ 0.0°) & fx Drop Shadow Applied...');
      }, 480);
    }, 780);

    // TRACK 3 (1380ms) — Horizontal Type Tool (T) Types Headline
    setTimeout(() => {
      if (hasUnfolded) return;
      if (window.__psBuilderHistory) window.__psBuilderHistory.track4 = true;
      setActiveTool(toolType);
      if (artboard) artboard.classList.add('step-type-stamp');
      activateLayer(4);

      setCursorActive(cursorType, true, 'T: Syne 900 Black [72pt]', tagType);
      setCursorPos(cursorType, 22, 26);
      triggerCursorClick(cursorType);

      if (optionsCoords) optionsCoords.textContent = 'Syne ▾  │  900 Black ▾  │  72 pt  │  Sharp ▾  │  [Color: #181512]';
      setStatusProgress(64, 'Step 3/7: Horizontal Type Tool (T) — Syne 900 Black [72pt]...');

      // Stream Line 1: ELEVATED
      streamTypewriter('Elevated', typeL1, () => {
        psSfx.typeTick();
      }, () => {
        // Line 1 finished -> move caret to Line 2
        setTimeout(() => {
          if (hasUnfolded) return;
          setCursorPos(cursorType, 26, 33, 'T: Stamping Campaigns', tagType);
          streamTypewriter('Campaigns', typeL2, () => {
            psSfx.typeTick();
          }, () => {
            // Line 2 finished -> stream Line 3
            setTimeout(() => {
              if (hasUnfolded) return;
              setCursorPos(cursorType, 28, 40, 'T: & Visual Identity', tagType);
              streamTypewriter('& Visual Identity', typeL3, () => {
                psSfx.typeTick();
              }, () => {
                // Typewriter finished -> hide caret
                if (typeCaret) typeCaret.style.display = 'none';
                setTimeout(() => setCursorActive(cursorType, false), 250);
              }, 22);
            }, 50);
          }, 24);
        }, 50);
      }, 26);
    }, 1380);

    // TRACK 4 (2180ms) — Eyedropper Samples Terracotta from Right Dock
    setTimeout(() => {
      if (hasUnfolded) return;
      setActiveTool(toolEyedropper);
      setCursorActive(cursorEyedropper, true, 'Eyedropper // Sample #D84E29', tagEyedropper);
      setCursorPos(cursorEyedropper, 89, 18);

      setTimeout(() => {
        if (hasUnfolded) return;
        triggerCursorClick(cursorEyedropper);
        psSfx.sample(); // harmonic sample chime

        if (colorRing) colorRing.classList.add('is-terracotta');
        if (colorHex) colorHex.textContent = '#D84E29';
        if (colorChip) colorChip.classList.add('is-terracotta');
        if (fgSwatch) fgSwatch.classList.add('is-terracotta');
        if (window.__psBuilderHistory) window.__psBuilderHistory.colorSampled = true;

        if (optionsCoords) optionsCoords.textContent = 'Sampled: #D84E29 (Terracotta)   RGB: 216, 78, 41   HSB: 13°, 81%, 85%';
        setStatusProgress(74, 'Step 4/7: Display Typography Stamped & Terracotta (#D84E29) Injected...');

        // Glide eyedropper cursor across to "CAMPAIGNS" to inject color
        setTimeout(() => {
          if (hasUnfolded) return;
          setCursorPos(cursorEyedropper, 24, 33, 'Tint: #D84E29 Terracotta', tagEyedropper);
          if (artboard) artboard.classList.add('step-type-color');
          triggerCursorClick(cursorEyedropper);
          psSfx.click(820, 0.016, 0.02);
          setTimeout(() => setCursorActive(cursorEyedropper, false), 350);
        }, 280);
      }, 160);
    }, 2180);

    // TRACK 5A (2600ms): Grounded Header Bar Docks from Top Guide
    setTimeout(() => {
      if (hasUnfolded) return;
      if (artboard) {
        artboard.classList.add('step-header');
      }
      activateLayer(5);
      setActiveTool(toolMove);
      psSfx.snap();

      setCursorActive(cursorPen, true, 'Dock Top Grounded Header [Guide Snap]', tagPen);
      setCursorPos(cursorPen, 48, 4);
      setTimeout(() => setCursorActive(cursorPen, false), 300);

      if (optionsCoords) optionsCoords.textContent = 'Header Bar: Grounded 50px   Monogram Star: Stamped';
      setStatusProgress(80, 'Step 5A/7: Grounded Architectural Header Docked into Place...');
    }, 2600);

    // TRACK 5B (2820ms): Metadata Eyebrow & Bio Lead Copy Stream In
    setTimeout(() => {
      if (hasUnfolded) return;
      if (artboard) {
        artboard.classList.add('step-details');
      }
      activateLayer(6);
      psSfx.click(540, 0.016, 0.018);

      if (optionsCoords) optionsCoords.textContent = 'Bio Copy: Plus Jakarta Sans 16px   Accreditation: 5 Yrs Lead';
      setStatusProgress(85, 'Step 5B/7: Designer Accreditation & Strategic Bio Copy Placed...');
    }, 2820);

    // TRACK 5C (3020ms): Capability Pills Cascade Stagger
    setTimeout(() => {
      if (hasUnfolded) return;
      if (artboard) {
        artboard.classList.add('step-pills');
      }
      psSfx.click(720, 0.015, 0.018);

      if (optionsCoords) optionsCoords.textContent = 'Pills Row: Brand Systems • E-Commerce • Motion • Campaigns';
      setStatusProgress(89, 'Step 5C/7: 4 Interactive Capability Pills Assembled Sequentially...');
    }, 3020);

    // TRACK 6 (3260ms): Timeline Spine Deploys & Cursor Scrubs Section 06 → 01 OVERVIEW (0%)
    setTimeout(() => {
      if (hasUnfolded) return;
      if (artboard) {
        artboard.classList.add('step-right-spine', 'step-guides-hide');
      }
      activateLayer(7);
      setStatusProgress(93, 'Step 6/7: Timeline Telemetry Active — Scrubbing Handle to 01 OVERVIEW...');

      scrubTimelineSpineToOverview(() => {
        if (hasUnfolded) return;
        if (window.__psBuilderHistory) {
          window.__psBuilderHistory.track5 = true;
          window.__psBuilderHistory.allCompiled = true;
        }
        setStatusProgress(98, 'Step 7/7: All Elements 100% Compiled — Entering Full Screen View...');

        // Final completion & auto-unfold
        setTimeout(() => {
          if (hasUnfolded) return;
          if (isBackgroundReady) {
            unfoldIntoLiveWebpage();
          } else {
            if (loadingModal) loadingModal.classList.add('is-visible');
            const fallbackTimer = setTimeout(unfoldIntoLiveWebpage, 3000);
            assetsReadyPromise.then(() => {
              clearTimeout(fallbackTimer);
              setTimeout(unfoldIntoLiveWebpage, 100);
            });
          }
        }, 320);
      });
    }, 3260);
  }

  // =========================================================================
  // PHASE 5: DEDICATED HIGH-PERFORMANCE MOBILE ENTRY ANIMATION (<= 2s TOTAL)
  // =========================================================================
  function runMobileViewfinderEntry() {
    const stage = document.getElementById('atelier-viewfinder-stage');
    const frame = document.getElementById('viewfinder-frame');
    const subject = document.getElementById('viewfinder-subject');
    const centerTarget = document.getElementById('vf-center-target');
    const fill = document.getElementById('viewfinder-progress-fill');
    const statusText = document.getElementById('viewfinder-status-text');
    const flash = document.getElementById('viewfinder-shutter-flash');
    const photoCard = document.getElementById('vf-mobile-photo-card');
    const splashEl = document.getElementById('atelier-splash-screen') || document.getElementById('atelier-splash');
    const workspaceWindow = document.getElementById('ps-workspace-window');

    if (workspaceWindow) workspaceWindow.style.display = 'none';

    if (!stage || !frame) {
      if (splashEl) {
        splashEl.classList.add('is-loaded');
        splashEl.style.display = 'none';
      }
      return;
    }

    let isSkipped = false;
    let timerIds = [];

    function addTimer(fn, ms) {
      const id = setTimeout(fn, ms);
      timerIds.push(id);
      return id;
    }

    function cleanupTimers() {
      timerIds.forEach(id => clearTimeout(id));
      timerIds = [];
    }

    function triggerMobileChapter2Peek() {
      const root = document.getElementById('portfolio-lookbook-root');
      if (!root) return;
      const PEEK_STORAGE_KEY = 'atelier_mobile_peek_count';
      let count = 0;
      try {
        count = parseInt(localStorage.getItem(PEEK_STORAGE_KEY) || '0', 10);
      } catch (_) {}
      if (count >= 2) return;
      try {
        localStorage.setItem(PEEK_STORAGE_KEY, String(count + 1));
      } catch (_) {}

      // Gentle 16px glance of chapter 02 on first visits
      setTimeout(() => {
        root.classList.add('is-edge-peeking');
        setTimeout(() => {
          root.classList.remove('is-edge-peeking');
        }, 380);
      }, 120);
    }

    function completeMobileHandoff(skipPeek = false) {
      if (stage) {
        stage.classList.add('is-hidden');
        stage.style.display = 'none';
      }
      if (splashEl) {
        splashEl.classList.add('is-loaded');
        splashEl.style.display = 'none';
      }
      if (!skipPeek) {
        triggerMobileChapter2Peek();
      }
    }

    function skipToLiveChapter01() {
      if (isSkipped) return;
      isSkipped = true;
      cleanupTimers();
      completeMobileHandoff(true);
    }

    window.dismissSplash = skipToLiveChapter01;

    // Tap to skip
    stage.addEventListener('click', skipToLiveChapter01, { once: true });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') skipToLiveChapter01();
    }, { once: true });

    // Honor prefers-reduced-motion with simple fade
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      stage.style.transition = 'opacity 0.22s ease';
      if (splashEl) splashEl.style.transition = 'opacity 0.22s ease';
      addTimer(() => {
        stage.style.opacity = '0';
        if (splashEl) splashEl.style.opacity = '0';
        addTimer(() => completeMobileHandoff(true), 220);
      }, 150);
      return;
    }

    // 1. Preload PP.jpg immediately so the reveal NEVER shows an empty frame
    const portraitPreloadPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = 'assets/optimized/new_additions/PP.jpg';
      if (img.complete) resolve(img);
    });

    // 2. Rack focus 0% -> 100% over ~650ms (snappy curatorial mobile budget)
    const focusDuration = 650;
    const startTime = performance.now();

    function updateFocusTick() {
      if (isSkipped) return;
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / focusDuration);
      const pct = Math.round(progress * 100);

      if (fill) fill.style.width = `${pct}%`;
      if (statusText) statusText.textContent = `ACQUIRING FOCUS... ${pct}%`;

      if (progress < 1) {
        requestAnimationFrame(updateFocusTick);
      }
    }
    requestAnimationFrame(updateFocusTick);

    // Audio clicks during focus
    [120, 320, 520].forEach(ms => {
      addTimer(() => {
        if (!isSkipped) psSfx.click(520 + ms * 0.4, 0.012, 0.015);
      }, ms);
    });

    // When focus finishes AND portrait is loaded:
    const focusCompletePromise = new Promise(resolve => addTimer(resolve, focusDuration));

    Promise.all([focusCompletePromise, portraitPreloadPromise]).then(() => {
      if (isSkipped) return;

      // 3. Focus Lock & Shutter Flash: Reveal PP.jpg already at final mobile card size
      if (fill) fill.style.width = '100%';
      if (statusText) statusText.textContent = '● FOCUS LOCKED // EXPOSURE READY';
      if (subject) {
        subject.classList.remove('is-focusing');
        subject.classList.add('is-locked');
      }
      if (frame) frame.classList.add('is-locked');
      if (centerTarget) centerTarget.classList.add('is-locked');

      psSfx.shutter();

      if (flash) {
        flash.classList.add('is-flashing');
        addTimer(() => flash.classList.remove('is-flashing'), 180);
      }

      // Reveal PP.jpg in the frame already at final mobile card size (no jump/resize)
      if (photoCard) {
        photoCard.classList.add('is-revealed');
      }

      // 4. Hold captured photograph for 160ms so user registers the razor-sharp capture
      addTimer(() => {
        if (isSkipped) return;

        // 5. Peel open horizontally (right-to-left) into Chapter 01
        stage.classList.add('is-peeling-mobile');
        psSfx.click(740, 0.016, 0.02);

        // 6. Complete peel handoff into Chapter 01 (~360ms)
        addTimer(() => {
          if (isSkipped) return;
          completeMobileHandoff(false);
        }, 360);
      }, 160);
    });
  }

  function initSplashSequence() {
    const isMobile = (window.AtelierMode && window.AtelierMode.isMobile()) ||
      document.documentElement.dataset.mode === 'mobile';

    if (isMobile) {
      runMobileViewfinderEntry();
    } else {
      calibrateArtboardScale();
      window.addEventListener('resize', calibrateArtboardScale);
      runViewfinderFocusAndLaunch(startChoreographedBuild);
    }
  }

  // Start sequence once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => setTimeout(initSplashSequence, 60));
    });
  } else {
    requestAnimationFrame(() => setTimeout(initSplashSequence, 60));
  }

})();
