// =========================================================================
// SECTOR 04: OMNICHANNEL RESPONSIVE DEVICE SWITCHER & CAROUSEL CONTROLLER
// =========================================================================
let activeSliderBrand = 'adidas';
let activeSliderDevice = (typeof document !== 'undefined' && document.documentElement.dataset.mode === 'mobile') ? 'mobile' : 'desktop';

function updateCarouselPositions(activeIdx) {
      const slides = document.querySelectorAll('.carousel-slide-housing');
      const n = slides.length;
      if (!n) return;

      slides.forEach((slide, idx) => {
        slide.classList.remove('is-center', 'is-prev', 'is-next', 'is-hidden');
        
        let diff = (idx - activeIdx + n) % n;
        if (diff > n / 2) diff -= n;
        
        if (diff === 0) {
          slide.classList.add('is-center');
          slide.style.transform = 'translate(-50%, -50%) scale(1)';
          slide.style.opacity = '1';
          slide.style.zIndex = '15';
          slide.style.filter = 'none';
          slide.style.pointerEvents = 'auto';
        } else if (diff === -1 || (activeIdx === 0 && idx === n - 1)) {
          slide.classList.add('is-prev');
          slide.style.transform = 'translate(calc(-50% - 100% + 150px), -50%) scale(0.92)';
          slide.style.opacity = '0.45';
          slide.style.zIndex = '8';
          slide.style.filter = 'brightness(0.65)';
          slide.style.pointerEvents = 'auto';
        } else if (diff === 1 || (activeIdx === n - 1 && idx === 0)) {
          slide.classList.add('is-next');
          slide.style.transform = 'translate(calc(-50% + 100% - 150px), -50%) scale(0.92)';
          slide.style.opacity = '0.45';
          slide.style.zIndex = '8';
          slide.style.filter = 'brightness(0.65)';
          slide.style.pointerEvents = 'auto';
        } else {
          slide.classList.add('is-hidden');
          slide.style.transform = diff < 0 ? 'translate(-220%, -50%) scale(0.8)' : 'translate(120%, -50%) scale(0.8)';
          slide.style.opacity = '0';
          slide.style.zIndex = '1';
          slide.style.pointerEvents = 'none';
        }
      });
    }

    function handleCarouselSlideClick(idx) {
      const currentIdx = sliderBrandKeys.indexOf(activeSliderBrand);
      if (idx === currentIdx) {
        openActiveDeviceSliderLightbox();
      } else {
        selectSliderCampaignByIndex(idx);
      }
    }

    function updateDeviceSliderDisplay() {
      const data = sliderCampaigns[activeSliderBrand];
      if (!data) return;

      const resBadge = document.getElementById('slider-res-badge');
      const titleEl = document.getElementById('slider-campaign-title');
      const descEl = document.getElementById('slider-campaign-desc');
      const anchorEl = document.getElementById('slider-spec-anchor');
      const paletteEl = document.getElementById('slider-spec-palette');

      // Update slide images to match current active device resolution
      sliderBrandKeys.forEach((brandKey, idx) => {
        const slideImg = document.querySelector(`.carousel-slide-housing[data-index="${idx}"] img`);
        if (slideImg && sliderCampaigns[brandKey]) {
          const newSrc = sliderCampaigns[brandKey][activeSliderDevice];
          if (slideImg.getAttribute('src') !== newSrc) {
            slideImg.src = newSrc;
          }
        }
      });

      const resLabels = {
        desktop: "1920 × 600 PX // 3.2:1 RATIO",
        app: "900 × 600 PX // 3:2 RATIO",
        mobile: "640 × 427 PX // 1.5:1 RATIO"
      };

      if (resBadge) resBadge.innerText = resLabels[activeSliderDevice];
      if (titleEl) titleEl.innerText = data.title;
      if (descEl) descEl.innerText = data.desc;
      if (anchorEl) anchorEl.innerText = data.anchor;
      if (paletteEl) paletteEl.innerText = data.palette;

      const activeIdx = sliderBrandKeys.indexOf(activeSliderBrand);
      if (activeIdx >= 0) {
        updateCarouselPositions(activeIdx);
      }
    }

    function selectSliderCampaign(brandKey, btn) {
      activeSliderBrand = brandKey;
      const navButtons = document.querySelectorAll('#slider-brand-nav .console-brand-tab');
      navButtons.forEach(b => b.classList.remove('active'));
      
      const brandIndex = sliderBrandKeys.indexOf(brandKey);
      if (btn) {
        btn.classList.add('active');
      } else if (brandIndex >= 0 && navButtons[brandIndex]) {
        navButtons[brandIndex].classList.add('active');
      }

      // Update Carousel HUD status
      const counterEl = document.getElementById('slider-carousel-counter');
      if (counterEl && brandIndex >= 0) {
        counterEl.innerText = `0${brandIndex + 1} / 06`;
      }
      const dots = document.querySelectorAll('#slider-carousel-dots .carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === brandIndex);
      });

      updateDeviceSliderDisplay();
      playUiSound(800, 'sine', 0.04);
    }

    function selectSliderCampaignByIndex(index) {
      const safeIndex = (index + sliderBrandKeys.length) % sliderBrandKeys.length;
      const brandKey = sliderBrandKeys[safeIndex];
      const navButtons = document.querySelectorAll('#slider-brand-nav .console-brand-tab');
      selectSliderCampaign(brandKey, navButtons[safeIndex]);
    }

    function cycleSliderCampaign(direction) {
      const currentIndex = sliderBrandKeys.indexOf(activeSliderBrand);
      selectSliderCampaignByIndex(currentIndex + direction);
    }

    function setSliderDevice(deviceKey, btn) {
      if (deviceKey === activeSliderDevice) return;
      activeSliderDevice = deviceKey;
      
      const viewport = document.getElementById('slider-device-viewport');
      document.querySelectorAll('#device-mode-toggle-group .device-toggle-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      
      if (viewport) {
        viewport.className = `device-stage-viewport device-${activeSliderDevice}`;
      }
      updateDeviceSliderDisplay();
      playUiSound(920, 'triangle', 0.04);
    }

    // Attach wheel and touch swipe gestures to storefront carousel outer stage
    (function initStorefrontCarouselGestures() {
      function attachGestures() {
        const stage = document.getElementById('device-carousel-outer-stage');
        if (!stage) return;

        let wheelCooldown = false;
        stage.addEventListener('wheel', (e) => {
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
          if (Math.abs(delta) > 25 && !wheelCooldown) {
            wheelCooldown = true;
            cycleSliderCampaign(delta > 0 ? 1 : -1);
            setTimeout(() => { wheelCooldown = false; }, 350);
          }
        }, { passive: true });

        let touchStartX = 0;
        let touchStartY = 0;
        stage.addEventListener('touchstart', (e) => {
          if (window.AtelierMode && window.AtelierMode.isMobile()) return;
          if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
          if (window.AtelierMode && window.AtelierMode.isMobile()) return;
          if (e.changedTouches.length === 1) {
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
              cycleSliderCampaign(diffX < 0 ? 1 : -1);
            }
          }
        }, { passive: true });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          attachGestures();
          updateCarouselPositions(0);
          renderMobileStorefrontStack();
        });
      } else {
        attachGestures();
        updateCarouselPositions(0);
        renderMobileStorefrontStack();
      }
    })();

    function openStorefrontMasterLightbox(brandKey) {
      const key = brandKey || activeSliderBrand;
      const data = sliderCampaigns[key];
      if (!data) return;
      const masterSrc = data.desktop_native || data.desktop;
      const galleryList = sliderBrandKeys.map(k => {
        const item = sliderCampaigns[k];
        return {
          src: item.desktop_native || item.desktop,
          title: `${item.title} [1920×600 DESKTOP MASTER]`,
          sub: 'OMNICHANNEL STOREFRONT MASTER',
          aspectRatio: '1920 / 600'
        };
      });
      const idx = Math.max(0, sliderBrandKeys.indexOf(key));
      openLightboxWithImage(
        masterSrc,
        `${data.title} [1920×600 DESKTOP MASTER]`,
        'OMNICHANNEL STOREFRONT MASTER',
        '1920 / 600',
        galleryList,
        idx
      );
    }

    function renderMobileStorefrontStack() {
      const container = document.getElementById('mobile-storefront-stack');
      if (!container || typeof sliderCampaigns === 'undefined') return;
      if (container.children.length === sliderBrandKeys.length) return;

      container.innerHTML = sliderBrandKeys.map((key, idx) => {
        const item = sliderCampaigns[key];
        const num = String(idx + 1).padStart(2, '0');
        const total = String(sliderBrandKeys.length).padStart(2, '0');
        return `
          <article class="mobile-storefront-card" data-brand="${key}" onclick="openStorefrontMasterLightbox('${key}')">
            <div class="mobile-storefront-card-header">
              <span class="mobile-storefront-index">${num} / ${total} // 640×427 MOBILE</span>
              <span class="mobile-storefront-master-pill">TAP FOR 1920×600 MASTER ⤢</span>
            </div>
            <div class="mobile-storefront-media-wrap">
              <img src="${item.mobile}" alt="${item.title} — 640×427 Mobile Storefront Banner" width="640" height="427" loading="lazy" decoding="async">
            </div>
            <div class="mobile-storefront-card-meta">
              <h4 class="mobile-storefront-title">${item.title}</h4>
              <p class="mobile-storefront-desc">${item.desc}</p>
            </div>
          </article>
        `;
      }).join('');
    }

    function openActiveDeviceSliderLightbox() {
      const data = sliderCampaigns[activeSliderBrand];
      if (!data) return;
      const isMobile = (window.AtelierMode && window.AtelierMode.isMobile()) || document.documentElement.dataset.mode === 'mobile';
      if (isMobile) {
        openStorefrontMasterLightbox(activeSliderBrand);
        return;
      }
      const nativeSrc = data[`${activeSliderDevice}_native`] || data[activeSliderDevice];
      const ratios = {
        desktop: '1920 / 600',
        app: '900 / 600',
        mobile: '640 / 427'
      };
      openLightboxWithImage(nativeSrc, `${data.title} [${activeSliderDevice.toUpperCase()}]`, 'OMNICHANNEL STOREFRONT ASSET', ratios[activeSliderDevice] || '3.2 / 1');
    }

// SLIDER TAB SWITCHER
let currentSliderImg = 'assets/real_works/Callaway_Quantum_Series_900x600.jpg';
let currentSliderTitle = 'Callaway Quantum Series';

function switchBannerSlider(imgSrc, title, desc, btn) {
      document.querySelectorAll('.studio-suite-card').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      playUiSound(800, 'sine', 0.06);

      currentSliderImg = imgSrc;
      currentSliderTitle = title;

      const img = document.getElementById('img-active-slider');
      const t = document.getElementById('slider-active-title');
      const d = document.getElementById('slider-active-desc');

      if (img) {
        img.style.opacity = '0';
        setTimeout(() => {
          img.src = imgSrc.replace('assets/real_works/', 'assets/optimized/');
          img.style.opacity = '1';
        }, 150);
      }
      if (t) t.innerText = title;
      if (d) d.innerText = desc;
    }

    function openLightboxFromSlider() {
      openLightboxWithImage(currentSliderImg, currentSliderTitle, 'EGOLF MEGASTORE // COMMERCIAL APP & STOREFRONT SLIDER', '900 / 600');
    }

    function scrollEcomSandbox(pos, btn) {
      const frame = document.getElementById('ecom-scroll-frame');
      if (btn) {
        document.querySelectorAll('#ecom-tabs-row .ecom-browser-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      if (!frame) return;
      const maxScroll = Math.max(0, frame.scrollHeight - frame.clientHeight);
      let target = 0;
      if (pos === 'pin1') target = maxScroll * 0.16;
      else if (pos === 'pin2') target = maxScroll * 0.42;
      else if (pos === 'bottom') target = maxScroll;
      frame.scrollTo({ top: target, behavior: 'smooth' });
      if (typeof playUiSound === 'function') playUiSound(860, 'sine', 0.03);
    }

    function upgradeAtelierInkRules() {
      const sec8 = document.getElementById('resume');
      if (!sec8) return;
      const svgs = sec8.querySelectorAll('.atelier-ink-rule-svg');
      svgs.forEach((svg, idx) => {
        if (svg.dataset.inkUpgraded === '1') return;
        svg.dataset.inkUpgraded = '1';
        const vb = (svg.getAttribute('viewBox') || '0 0 620 8').split(/\s+/).map(Number);
        const w = vb[2] || 620;
        const h = vb[3] || 8;
        const cy = h * 0.52;
        const isFull = svg.classList.contains('rule-full-masthead') || svg.classList.contains('rule-full-metrics');
        const baseSw = isFull ? 1.85 : (svg.classList.contains('rule-col-header') ? 1.55 : 1.25);
        const seed = (idx + 1) * 1.73;

        // Build organic 16-segment hand-drawn fountain pen path with micro-tremor
        const segs = isFull ? 20 : 12;
        const stepX = (w - 6) / segs;
        let dMain = `M 3,${cy.toFixed(2)}`;
        let dFeather = `M 5,${(cy + 1.25).toFixed(2)}`;
        let dSwell = '';

        for (let i = 1; i <= segs; i++) {
          const x = 3 + i * stepX;
          const prevX = 3 + (i - 1) * stepX;
          const midX = (prevX + x) * 0.5;
          const wave1 = Math.sin(i * 1.35 + seed) * (isFull ? 1.15 : 0.78);
          const wave2 = Math.cos(i * 2.1 - seed) * (isFull ? 0.65 : 0.45);
          const y = cy + wave1 + wave2;
          const ctrlY = cy - wave1 * 0.85 + Math.sin(i * 0.9 + seed) * 0.9;
          dMain += ` Q ${midX.toFixed(1)},${ctrlY.toFixed(2)} ${x.toFixed(1)},${y.toFixed(2)}`;
          dFeather += ` Q ${midX.toFixed(1)},${(ctrlY + 1.3).toFixed(2)} ${x.toFixed(1)},${(y + 1.15).toFixed(2)}`;
          if (i === 2) {
            dSwell = `M ${prevX.toFixed(1)},${y.toFixed(2)}`;
          }
          if (i >= 2 && i <= segs - 2) {
            dSwell += ` Q ${midX.toFixed(1)},${ctrlY.toFixed(2)} ${x.toFixed(1)},${y.toFixed(2)}`;
          }
        }

        const strokeCol = isFull ? '#1A1613' : '#221D19';
        svg.innerHTML = `
          <path class="ink-stroke-path" pathLength="1000" d="${dMain}" fill="none" stroke="${strokeCol}" stroke-width="${baseSw}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <path class="ink-stroke-path" pathLength="1000" d="${dSwell}" fill="none" stroke="${strokeCol}" stroke-width="${(baseSw * 1.62).toFixed(2)}" stroke-opacity="0.68" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <path class="ink-ghost-path" pathLength="1000" d="${dFeather}" fill="none" stroke="#8F2D14" stroke-width="${(baseSw * 0.52).toFixed(2)}" stroke-opacity="0.34" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        `;
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', upgradeAtelierInkRules);
    } else {
      upgradeAtelierInkRules();
    }

    function playTactilePaperTearAudio() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!window._atelierPaperAudioCtx) window._atelierPaperAudioCtx = new AudioCtx();
        const ctx = window._atelierPaperAudioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const duration = 0.32;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const envelope = Math.exp(-i / (bufferSize * 0.42));
          // Crackle/friction spikes representing individual perforation fibers snapping
          const fiberSnaps = (Math.random() < 0.08) ? (Math.random() * 1.8 - 0.9) : (Math.random() * 0.4 - 0.2);
          data[i] = fiberSnaps * envelope;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2600, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + duration);
        filter.Q.value = 2.2;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();
      } catch (e) {}
    }

    /* =====================================================================
       NOTEPAD PAGE BURN (tab switch): the outgoing sheet burns away from the
       bottom-right corner and dissolves, revealing the selected note beneath.
       - The real DOM clone of the sheet is cut by an SVG alpha-threshold filter
         (feImage burn-time map -> feComponentTransfer), so text/fonts stay native.
       - A 2D canvas overlay paints the scorch, char, glowing ember line and heat
         halo from the very same map, plus rising ember sparks. No sound, no WebGL.
       ===================================================================== */
    const NotepadBurn = (function () {
      const PAD_TOP = 150;            // headroom above the sheet for rising embers
      const DURATION = 1250;          // ms
      const T0 = -0.14, T1 = 1.20;    // burn-front travel (matches the approved demo)
      const SLOPE = 130;              // edge sharpness of the alpha cut
      let cache = null;               // { w, h, bv, uneven, pockets, mapUrl }
      let svgReady = false;
      let active = null;

      const fract = x => x - Math.floor(x);
      const smooth = (a, b, x) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
      };
      function hash(x, y) {
        let px = fract(x * 123.34), py = fract(y * 456.21);
        const d = px * (px + 45.32) + py * (py + 45.32);
        px += d; py += d;
        return fract(px * py);
      }
      function vnoise(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        let fx = x - ix, fy = y - iy;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
        const top = a + (b - a) * fx;
        return top + ((c + (d - c) * fx) - top) * fy;
      }
      function fbm(x, y) {
        let t = 0, a = 0.5;
        for (let i = 0; i < 5; i++) {
          t += a * vnoise(x, y);
          x = x * 2.03 + 17.1; y = y * 2.03 + 9.7; a *= 0.5;
        }
        return t;
      }

      // Burn-time field: distance from the bottom-right corner + ragged fibrous noise.
      function build(w, h) {
        const ax = w / h, n = w * h, diag = Math.hypot(ax, 1);
        const bv = new Float32Array(n), uneven = new Float32Array(n), pockets = new Float32Array(n);
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d');
        const img = cx.createImageData(w, h);
        for (let y = 0; y < h; y++) {
          const v = 1 - (y + 0.5) / h;
          for (let x = 0; x < w; x++) {
            const u = (x + 0.5) / w, i = y * w + x;
            const ux = u * ax;
            const d = Math.hypot((u - 1) * ax, v) / diag;
            const val = d + (fbm(ux * 3.2, v * 3.2) - 0.5) * 0.20 + (fbm(ux * 26, v * 26) - 0.5) * 0.045;
            bv[i] = val;
            uneven[i] = 0.65 + 0.7 * fbm(ux * 14, v * 14);
            pockets[i] = smooth(0.42, 0.62, fbm(ux * 38, v * 38));
            const k = i * 4;
            img.data[k] = Math.max(0, Math.min(255, Math.round((val + 0.25) / 1.6 * 255)));
            img.data[k + 3] = 255;
          }
        }
        cx.putImageData(img, 0, 0);
        // Pixels ordered by burn time, so each frame only touches the band near the front
        const order = new Uint32Array(n);
        for (let i = 0; i < n; i++) order[i] = i;
        order.sort((p, q) => bv[p] - bv[q]);
        const sbv = new Float32Array(n);
        for (let k = 0; k < n; k++) sbv[k] = bv[order[k]];
        return { w, h, bv, uneven, pockets, order, sbv, mapUrl: cv.toDataURL('image/png') };
      }
      function lowerBound(arr, x) {
        let lo = 0, hi = arr.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < x) lo = mid + 1; else hi = mid; }
        return lo;
      }

      function ensureSvg() {
        if (svgReady) return;
        const wrap = document.createElement('div');
        wrap.setAttribute('aria-hidden', 'true');
        wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
        wrap.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" focusable="false">' +
          '<filter id="notepad-burn-cut" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
          '<feImage id="notepad-burn-map" x="0" y="0" width="530" height="345" preserveAspectRatio="none" result="map"/>' +
          '<feColorMatrix in="map" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="a"/>' +
          '<feComponentTransfer in="a" result="cut"><feFuncA id="notepad-burn-fn" type="linear" slope="' + SLOPE + '" intercept="1"/></feComponentTransfer>' +
          '<feComposite in="SourceGraphic" in2="cut" operator="in"/>' +
          '</filter></svg>' +
          // decoy so the browser fetches/decodes the map image before the first burn
          '<div id="notepad-burn-decoy" style="width:1px;height:1px;filter:url(#notepad-burn-cut)"></div>';
        document.body.appendChild(wrap);
        svgReady = true;
      }
      function setMap(m) {
        const fi = document.getElementById('notepad-burn-map');
        if (fi.getAttribute('data-key') === m.w + 'x' + m.h) return;
        fi.setAttribute('data-key', m.w + 'x' + m.h);
        fi.setAttribute('width', m.w);
        fi.setAttribute('height', m.h);
        fi.setAttribute('href', m.mapUrl);
      }
      function setCut(t) {
        const rt = (t + 0.25) / 1.6;
        document.getElementById('notepad-burn-fn').setAttribute('intercept', (0.5 - SLOPE * rt).toFixed(4));
      }

      function prepare(w, h) {
        if (!cache || cache.w !== w || cache.h !== h) cache = build(w, h);
        ensureSvg();
        setMap(cache);
        return cache;
      }

      // Build the burn map during idle time so the first tab switch has no hitch.
      function prewarm() {
        const el = document.querySelector('.notepad-sheet.dossier-tab-panel.is-active');
        if (!el || !el.offsetWidth) return;
        prepare(el.offsetWidth, el.offsetHeight);
      }

      function stop() {
        if (!active) return;
        cancelAnimationFrame(active.raf);
        if (active.canvas.parentNode) active.canvas.remove();
        if (active.clone.parentNode) active.clone.remove();
        active.stack.classList.remove('is-tearing-active');
        active = null;
      }

      function play(stack, clone) {
        stop();
        const w = clone.offsetWidth, h = clone.offsetHeight;
        const m = prepare(w, h);
        const bv = m.bv, uneven = m.uneven, pockets = m.pockets, order = m.order, sbv = m.sbv;
        const ax = w / h;
        let prevLo = 0, prevHi = 0;

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h + PAD_TOP;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = 'position:absolute;left:0;top:-' + PAD_TOP + 'px;width:' + w + 'px;height:' + (h + PAD_TOP) +
          'px;z-index:10000;pointer-events:none;';
        stack.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const idata = ctx.createImageData(w, h);
        const px = idata.data;

        clone.style.setProperty('filter', 'url(#notepad-burn-cut)', 'important');
        setCut(T0);

        const sparks = [];
        const state = { stack, clone, canvas, raf: 0 };
        active = state;
        let r = 0, g = 0, b = 0, a = 0;
        function over(cr, cg, cb, ca) {
          if (ca <= 0.004) return;
          const na = ca + a * (1 - ca);
          r = (cr * ca + r * a * (1 - ca)) / na;
          g = (cg * ca + g * a * (1 - ca)) / na;
          b = (cb * ca + b * a * (1 - ca)) / na;
          a = na;
        }

        const t0 = performance.now();
        let last = t0, frame = 0, cloneGone = false;

        function tick(now) {
          const p = Math.min(1, (now - t0) / DURATION);
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          frame++;
          const t = T0 + p * (T1 - T0);

          if (p < 1) {
            setCut(t);
            for (let k = prevLo; k < prevHi; k++) px[order[k] * 4 + 3] = 0;
            const lo = lowerBound(sbv, t - 0.05), hi = lowerBound(sbv, t + 0.16);
            prevLo = lo; prevHi = hi;
            for (let k = lo; k < hi; k++) {
              const i = order[k];
              const wv = bv[i] - t;
              const flick = 0.75 + 0.25 * hash(i * 0.0137, frame * 0.731);
              r = g = b = a = 0;
              if (wv < 0) {
                const k = Math.exp(wv * 160);
                over(255, 89 + 89 * k, 13 + 38 * k, Math.exp(wv * 70) * 0.55 * flick);
                over(255, 190, 90, smooth(-0.008, 0, wv) * 0.9);
              } else {
                over(165, 112, 45, 0.38 * smooth(0.16, 0.06, wv));
                over(76, 38, 15, smooth(0.075, 0.025, wv) * Math.min(1, uneven[i]));
                over(13, 8, 5, smooth(0.034, 0.012, wv));
                const hk = smooth(0.008, 0, wv);
                const ember = smooth(0.02, 0, wv) * flick * (0.55 + 0.6 * pockets[i]);
                over(255, 82 + 153 * hk, 8 + 132 * hk, Math.min(1, ember));
                over(255, 115, 25, smooth(0.05, 0, wv) * 0.20 * flick);
              }
              const k4 = i * 4;
              px[k4] = r; px[k4 + 1] = g; px[k4 + 2] = b; px[k4 + 3] = a * 255;
            }
            // embers lifting off the live burn front (quarter arc around the corner)
            if (p > 0.02 && p < 0.97) {
              const rad = t * Math.hypot(ax, 1);
              for (let s = 0; s < 3; s++) {
                const ang = Math.random() * Math.PI / 2;
                const u = 1 - (Math.cos(ang) * rad) / ax, v = Math.sin(ang) * rad;
                if (u < 0 || u > 1 || v < 0 || v > 1) continue;
                sparks.push({
                  x: u * w, y: PAD_TOP + (1 - v) * h,
                  vx: (Math.random() - 0.5) * 36, vy: -(35 + Math.random() * 75),
                  life: 1, decay: 1.3 + Math.random() * 1.6,
                  size: 0.8 + Math.random() * 1.6, hue: 18 + Math.random() * 30, wob: Math.random() * 6.28
                });
              }
            }
          } else if (!cloneGone) {
            cloneGone = true;
            for (let k = prevLo; k < prevHi; k++) px[order[k] * 4 + 3] = 0;
            prevLo = prevHi = 0;
            if (clone.parentNode) clone.remove();
            stack.classList.remove('is-tearing-active');
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(idata, 0, PAD_TOP);
          for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.wob += 0.25;
            s.x += (s.vx + Math.sin(s.wob) * 10) * dt;
            s.y += s.vy * dt;
            s.vy *= 0.985;
            s.life -= s.decay * dt;
            if (s.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.fillStyle = 'hsla(' + s.hue + ',100%,' + (55 + 25 * s.life) + '%,' + s.life + ')';
            ctx.shadowColor = 'rgba(255,120,20,0.9)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;

          if (p < 1 || sparks.length) {
            state.raf = requestAnimationFrame(tick);
          } else {
            stop();
          }
        }
        state.raf = requestAnimationFrame(tick);
      }

      if (document.readyState === 'complete') setTimeout(prewarm, 800);
      else window.addEventListener('load', () => setTimeout(prewarm, 1200));

      return { play, stop, prewarm };
    })();

    function switchDossierTab(tabKey, btn) {
      upgradeAtelierInkRules();
      if (btn && btn.classList.contains('active')) return;
      if (btn) {
        document.querySelectorAll('.dossier-interactive-tabs .dossier-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }

      const stackEl = document.getElementById('notepad-sheets-stack') || document.getElementById('dossier-tabs-stage');
      const pArsenal = document.getElementById('dossier-panel-arsenal');
      const pDisc = document.getElementById('dossier-panel-disciplines');
      const outgoingSheet = (tabKey === 'arsenal') ? pDisc : pArsenal;
      const incomingSheet = (tabKey === 'arsenal') ? pArsenal : pDisc;

      if (!outgoingSheet || !incomingSheet || !stackEl) return;

      // Clear any previous burn if the user clicks rapidly
      NotepadBurn.stop();
      stackEl.querySelectorAll('.is-shedding-page').forEach(el => el.remove());
      stackEl.classList.remove('is-tearing-active');

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // The outgoing page stays on top as a clone that burns away
      let burnClone = null;
      if (!reduceMotion) {
        burnClone = outgoingSheet.cloneNode(true);
        burnClone.removeAttribute('id');
        burnClone.setAttribute('aria-hidden', 'true');
        burnClone.classList.add('is-shedding-page');
        stackEl.classList.add('is-tearing-active');
        stackEl.appendChild(burnClone);
      }

      // Incoming note is activated immediately underneath, flat at the same depth
      outgoingSheet.classList.remove('is-active', 'is-revealing-under');
      incomingSheet.classList.add('is-active');
      incomingSheet.classList.remove('is-revealing-under');

      if (burnClone) NotepadBurn.play(stackEl, burnClone);
    }

    function stepPortfolioStage(dir) {
      if (!window.PinnedBurnEngine) return;
      const targets = window.PinnedBurnEngine.getStageLockTargets();
      const curY = window.PinnedBurnEngine.getTargetY();
      if (!targets || !targets.length) return;
      let curIdx = 0;
      let minDist = Infinity;
      targets.forEach((t, idx) => {
        const d = Math.abs(t.y - curY);
        if (d < minDist) {
          minDist = d;
          curIdx = idx;
        }
      });
      const nextIdx = Math.max(0, Math.min(targets.length - 1, curIdx + dir));
      window.PinnedBurnEngine.setTargetY(targets[nextIdx].y);
      if (typeof playUiSound === 'function') playUiSound(dir > 0 ? 840 : 760, 'sine', 0.04);
    }

window.selectSliderCampaign = selectSliderCampaign;
window.selectSliderCampaignByIndex = selectSliderCampaignByIndex;
window.cycleSliderCampaign = cycleSliderCampaign;
window.setSliderDevice = setSliderDevice;
window.openActiveDeviceSliderLightbox = openActiveDeviceSliderLightbox;
window.openStorefrontMasterLightbox = openStorefrontMasterLightbox;
window.renderMobileStorefrontStack = renderMobileStorefrontStack;
window.switchBannerSlider = switchBannerSlider;
window.openLightboxFromSlider = openLightboxFromSlider;
window.updateDeviceSliderDisplay = updateDeviceSliderDisplay;
window.scrollEcomSandbox = scrollEcomSandbox;
window.switchDossierTab = switchDossierTab;
window.stepPortfolioStage = stepPortfolioStage;

function isMobilePortfolioMode() {
  return (window.AtelierMode && window.AtelierMode.isMobile()) ||
    document.documentElement.dataset.mode === 'mobile';
}

function handleAiConceptCardTap(e, cardEl, src, title, sub) {
  if (!isMobilePortfolioMode()) {
    openLightboxWithImage(src, title, sub);
    return;
  }
  if (!cardEl) {
    openLightboxWithImage(src, title, sub);
    return;
  }
  const alreadyRevealed = cardEl.classList.contains('is-revealed');
  if (!alreadyRevealed) {
    cardEl.classList.add('is-revealed');
    const badge = cardEl.querySelector('.ai-mobile-tap-badge');
    if (badge) badge.textContent = 'TAP AGAIN TO ENLARGE ⤢';
  } else {
    openLightboxWithImage(src, title, sub);
  }
}

function toggleMobileDossierSection(secId, headerEl) {
  if (!isMobilePortfolioMode()) return;
  const sec = document.getElementById(secId);
  if (!sec) return;
  const isCollapsed = sec.classList.contains('is-collapsed');
  if (isCollapsed) {
    sec.classList.remove('is-collapsed');
    sec.classList.add('is-expanded');
    if (headerEl) headerEl.setAttribute('aria-expanded', 'true');
  } else {
    sec.classList.remove('is-expanded');
    sec.classList.add('is-collapsed');
    if (headerEl) headerEl.setAttribute('aria-expanded', 'false');
  }
}

function initMobileDossierCollapsibles() {
  if (!isMobilePortfolioMode()) {
    ['dossier-sec-career', 'dossier-sec-capabilities', 'dossier-sec-academic'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('is-collapsed');
        el.classList.add('is-expanded');
      }
    });
    return;
  }
  // On mobile: keep Career Trajectory expanded initially, collapse Capabilities & Academic
  const cap = document.getElementById('dossier-sec-capabilities');
  const acad = document.getElementById('dossier-sec-academic');
  [cap, acad].forEach(sec => {
    if (sec && !sec.dataset.mobileInit) {
      sec.dataset.mobileInit = '1';
      sec.classList.remove('is-expanded');
      sec.classList.add('is-collapsed');
      const hdr = sec.querySelector('[onclick*="toggleMobileDossierSection"]');
      if (hdr) hdr.setAttribute('aria-expanded', 'false');
    }
  });
}

// Single-video playback coordinator on mobile (only one video playing at a time)
(function initMobileVideoCoordinator() {
  document.addEventListener('play', (e) => {
    if (!isMobilePortfolioMode()) return;
    const playingVideo = e.target;
    if (!playingVideo || playingVideo.tagName !== 'VIDEO') return;
    document.querySelectorAll('video').forEach(v => {
      if (v !== playingVideo && !v.paused) {
        try { v.pause(); } catch (_) {}
      }
    });
  }, true);

  window.addEventListener('DOMContentLoaded', () => {
    initMobileDossierCollapsibles();
    renderMobileStorefrontStack();
    if (isMobilePortfolioMode()) {
      // Ensure only the first visible video plays initially on mobile
      const videos = Array.from(document.querySelectorAll('video'));
      let keptOne = false;
      videos.forEach(v => {
        if (!v.paused) {
          if (!keptOne) {
            keptOne = true;
          } else {
            try { v.pause(); } catch (_) {}
          }
        }
      });
    }
  });

  window.addEventListener('atelier:modechange', () => {
    initMobileDossierCollapsibles();
    renderMobileStorefrontStack();
  });
})();

window.handleAiConceptCardTap = handleAiConceptCardTap;
window.toggleMobileDossierSection = toggleMobileDossierSection;

// Auto-detect mobile mode and default to mobile aspect ratio
if (typeof document !== 'undefined' && document.documentElement.dataset.mode === 'mobile') {
  window.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('slider-device-viewport');
    if (viewport) viewport.className = 'device-stage-viewport device-mobile';
    const mobileBtn = document.querySelector('#device-mode-toggle-group .device-toggle-btn[onclick*="mobile"]');
    if (mobileBtn) {
      document.querySelectorAll('#device-mode-toggle-group .device-toggle-btn').forEach(b => b.classList.remove('active'));
      mobileBtn.classList.add('active');
    }
  });
}
