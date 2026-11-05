// =========================================================
// PARTICLE DISSOLVE TRANSITION WITH ORGANIC FROSTED EDGE REVEAL
// HIGH-PERFORMANCE 60FPS ATELIER DISSOLVE ENGINE (MOBILE OPTIMIZED)
// =========================================================
const BurningPaperEngine = (function() {
  const canvas = document.getElementById('disintegration-canvas');
  if (!canvas) return { setScrollProgress: () => {}, getWavefrontStatus: () => null, onWavefrontUpdate: () => {} };
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Window resize handler with mobile URL-bar jitter filter
  window.addEventListener('resize', () => {
    const newW = window.innerWidth;
    const newH = window.innerHeight;
    if (newW !== width || Math.abs(newH - height) > 120) {
      width = canvas.width = newW;
      height = canvas.height = newH;
      needsRedraw = true;
      checkAndStartLoop();
    }
  }, { passive: true });

  // Mobile Device Detection & Mesh Configuration
  const isMobileDevice = () => window.innerWidth <= 860;
  const getColStep = () => isMobileDevice() ? 14 : 10;
  const MAX_NOISE_AMP = 95; // Maximum peak excursion in pixels
  const SAFETY_MARGIN = 20; // Ensures peaks start and end completely offscreen
  const VERTICAL_SPAN_OFFSET = MAX_NOISE_AMP + SAFETY_MARGIN; // 115px

  // Recycled Particle Pool (Zero GC allocation during touch scrolls)
  const MAX_MOTES = 60;
  const motePool = [];
  for (let i = 0; i < MAX_MOTES; i++) {
    motePool.push({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 1,
      alpha: 1,
      decay: 0.02,
      type: 0
    });
  }

  function getMoteCap() {
    return isMobileDevice() ? 24 : 50;
  }

  function spawnDissolveMote(x, y, isReverse = false) {
    const cap = getMoteCap();
    let activeCount = 0;
    let freeMote = null;

    for (let i = 0; i < cap; i++) {
      if (motePool[i].active) {
        activeCount++;
      } else if (!freeMote) {
        freeMote = motePool[i];
      }
    }

    if (!freeMote || activeCount >= cap) return;

    freeMote.active = true;
    freeMote.x = x + (Math.random() - 0.5) * 24;
    freeMote.y = y + (Math.random() - 0.5) * 14;
    freeMote.vx = (Math.random() - 0.5) * 2.8;
    freeMote.vy = isReverse ? (Math.random() * 3.8 + 1.2) : -(Math.random() * 4.2 + 1.5);
    freeMote.r = Math.random() * 2.2 + 0.8;
    freeMote.alpha = 1;
    freeMote.decay = 0.018 + Math.random() * 0.025;
    freeMote.type = Math.random(); // <0.45: frosted white, 0.45-0.75: amber, >0.75: dark ash
  }

  // Lightweight 3-harmonic FBM noise with precalculated time phases
  function calcFbm(x, p1, p2, p3) {
    return Math.sin(x * 0.0032 + p1) * 58 +
           Math.sin(x * 0.0105 + p2) * 26 +
           Math.sin(x * 0.0250 + p3) * 11;
  }

  // Scroll State with anti-asymptotic snap
  let targetEntry = 0;
  let currentEntry = 0;
  let targetExit = 0;
  let currentExit = 0;

  // Wavefront Telemetry & Synchronized Contact Callback
  let currentStatus = { state: 'light', waveY: -1000, entryProg: 0, exitProg: 0 };
  let onWavefrontUpdateCallback = null;
  function onWavefrontUpdate(fn) { onWavefrontUpdateCallback = fn; }
  function getWavefrontStatus() { return currentStatus; }

  // Lifecycle & RAF Sleep State Engine
  let isRunning = false;
  let needsRedraw = true;
  let time = 0;

  function checkAndStartLoop() {
    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(render);
    }
  }

  function setScrollProgress(entryProg, exitProg) {
    const nextEntry = Math.max(0, Math.min(1, entryProg));
    const nextExit = Math.max(0, Math.min(1, exitProg));

    if (Math.abs(nextEntry - targetEntry) > 0.0005 || Math.abs(nextExit - targetExit) > 0.0005) {
      targetEntry = nextEntry;
      targetExit = nextExit;
      needsRedraw = true;
      checkAndStartLoop();
    }
  }

  function render() {
    time += 0.024;
    const isMobile = isMobileDevice();

    // Fast-response adaptive easing for pinpoint mobile touch responsiveness
    const diffEntry = Math.abs(targetEntry - currentEntry);
    const diffExit = Math.abs(targetExit - currentExit);

    // Pinpoint convergence: snap when close or when at boundary limits
    if (diffEntry < 0.0015 || (isMobile && (targetEntry === 0 || targetEntry === 1) && diffEntry < 0.06)) {
      currentEntry = targetEntry;
    } else {
      // On mobile: 0.82 for fast swipe convergence (zero lag), 0.60 for gentle drag
      const easeRate = isMobile ? (diffEntry > 0.2 ? 0.82 : 0.60) : 0.35;
      currentEntry += (targetEntry - currentEntry) * easeRate;
    }

    if (diffExit < 0.0015 || (isMobile && (targetExit === 0 || targetExit === 1) && diffExit < 0.06)) {
      currentExit = targetExit;
    } else {
      const easeRate = isMobile ? (diffExit > 0.2 ? 0.82 : 0.60) : 0.35;
      currentExit += (targetExit - currentExit) * easeRate;
    }

    const inEntryZone = currentEntry > 0 && currentEntry < 1;
    const inExitZone = currentExit > 0 && currentExit < 1;

    // Check if any dissolve motes are active
    let activeMotesCount = 0;
    const cap = getMoteCap();
    for (let i = 0; i < cap; i++) {
      if (motePool[i].active) activeMotesCount++;
    }

    // Static Idle States: Sleep RAF loop when not in transition and no motes remain
    const isSettled = !inEntryZone && !inExitZone &&
                      (currentEntry === targetEntry) &&
                      (currentExit === targetExit) &&
                      (activeMotesCount === 0);

    if (isSettled) {
      if (currentEntry === 0 || currentExit === 1) {
        // 100% Light Ivory Paper state
        if (needsRedraw) {
          ctx.clearRect(0, 0, width, height);
          if (!document.getElementById('layer-1-4')) {
            ctx.fillStyle = '#F8F6F0';
            ctx.fillRect(0, 0, width, height);
          }
          needsRedraw = false;
        }
        currentStatus = { state: 'light', waveY: -1000, entryProg: 0, exitProg: currentExit === 1 ? 1 : 0 };
      } else if (currentEntry === 1 && currentExit === 0) {
        // 100% Dark Cinema state
        if (needsRedraw) {
          ctx.clearRect(0, 0, width, height);
          if (!document.getElementById('layer-1-4')) {
            ctx.fillStyle = '#101114';
            ctx.fillRect(0, 0, width, height);
          }
          needsRedraw = false;
        }
        currentStatus = { state: 'dark', waveY: height + 2000, entryProg: 1, exitProg: 0 };
      }

      if (onWavefrontUpdateCallback) {
        onWavefrontUpdateCallback(currentStatus);
      }

      // Enter sleep state — stop RAF to save 100% CPU/GPU and eliminate mobile thermal lag
      isRunning = false;
      return;
    }

    // ACTIVE TRANSITION DRAWING:
    ctx.clearRect(0, 0, width, height);

    if (inEntryZone) {
      // ENTRY DISSOLVE: Dark section breaks apart along rough edge revealing light paper below
      const totalSpan = height + VERTICAL_SPAN_OFFSET * 2;
      const baseY = -VERTICAL_SPAN_OFFSET + currentEntry * totalSpan;
      currentStatus = { state: 'entry', waveY: baseY, entryProg: currentEntry, exitProg: 0 };
      const colStep = getColStep();

      // Precalculate trigonometric phases once per frame
      const p1 = 42 + time * 0.09;
      const p2 = 84 - time * 0.14;
      const p3 = time * 0.20;

      // 1. Light Ivory Paper Base underneath
      ctx.fillStyle = '#F8F6F0';
      ctx.fillRect(0, 0, width, height);

      // 2. Crumbling Dark Section above, dissolving across fractal columnar boundaries
      ctx.fillStyle = '#101114';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, baseY + calcFbm(width, p1, p2, p3));
      for (let x = width; x >= 0; x -= colStep) {
        ctx.lineTo(x, baseY + calcFbm(x, p1, p2, p3));
      }
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Continuous floating frosted motes spawning from dissolving wavefront
      const spawnCount = isMobile ? 1 : 3;
      for (let i = 0; i < spawnCount; i++) {
        const px = Math.random() * width;
        const py = baseY + calcFbm(px, p1, p2, p3);
        if (py >= -20 && py <= height + 20) {
          spawnDissolveMote(px, py, false);
        }
      }
    } else if (inExitZone) {
      // EXIT DISSOLVE: Light Ivory Paper entering above along fractal dissolve edge
      const totalSpan = height + VERTICAL_SPAN_OFFSET * 2;
      const baseY = -VERTICAL_SPAN_OFFSET + currentExit * totalSpan;
      currentStatus = { state: 'exit', waveY: baseY, entryProg: 1, exitProg: currentExit };
      const colStep = getColStep();

      const p1 = 99 + time * 0.09;
      const p2 = 198 - time * 0.14;
      const p3 = time * 0.20;

      // 1. Dark Cinema Base underneath
      ctx.fillStyle = '#101114';
      ctx.fillRect(0, 0, width, height);

      // 2. Light Ivory Paper entering above along fractal dissolve edge
      ctx.fillStyle = '#F8F6F0';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, baseY + calcFbm(width, p1, p2, p3));
      for (let x = width; x >= 0; x -= colStep) {
        ctx.lineTo(x, baseY + calcFbm(x, p1, p2, p3));
      }
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      const spawnCount = isMobile ? 1 : 3;
      for (let i = 0; i < spawnCount; i++) {
        const px = Math.random() * width;
        const py = baseY + calcFbm(px, p1, p2, p3);
        if (py >= -20 && py <= height + 20) {
          spawnDissolveMote(px, py, true);
        }
      }
    }

    // Inform listeners of real-time wavefront state
    if (onWavefrontUpdateCallback) {
      onWavefrontUpdateCallback(currentStatus);
    }

    // Render Active Frosted Dissolve Motes (Recycled pool, zero GC pause, batched draws)
    if (activeMotesCount > 0) {
      // Pass 1: Frosted white motes
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < cap; i++) {
        const p = motePool[i];
        if (!p.active) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -30 || p.y > height + 30) {
          p.active = false;
          continue;
        }

        if (p.type < 0.45) {
          ctx.globalAlpha = p.alpha * 0.9;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pass 2: Crystalline amber motes
      ctx.fillStyle = '#FFE1AA';
      for (let i = 0; i < cap; i++) {
        const p = motePool[i];
        if (!p.active || p.type < 0.45 || p.type >= 0.75) continue;
        ctx.globalAlpha = p.alpha * 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pass 3: Dark ash motes
      ctx.fillStyle = '#14161A';
      for (let i = 0; i < cap; i++) {
        const p = motePool[i];
        if (!p.active || p.type < 0.75) continue;
        ctx.globalAlpha = p.alpha * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(render);
  }

  // Initial render pass to establish light ivory canvas, then sleep until scrolled
  checkAndStartLoop();

  return { setScrollProgress, getWavefrontStatus, onWavefrontUpdate };
})();

window.BurningPaperEngine = BurningPaperEngine;
