// =========================================================================
// SECTOR 04: OMNICHANNEL RESPONSIVE DEVICE SWITCHER & CAROUSEL CONTROLLER
// =========================================================================
let activeSliderBrand = 'adidas';
let activeSliderDevice = (typeof window !== 'undefined' && window.innerWidth <= 768) ? 'mobile' : 'desktop';

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
          if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
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
        });
      } else {
        attachGestures();
        updateCarouselPositions(0);
      }
    })();

    function openActiveDeviceSliderLightbox() {
      const data = sliderCampaigns[activeSliderBrand];
      if (!data) return;
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

    function switchDossierTab(tabKey, btn) {
      if (btn) {
        document.querySelectorAll('.dossier-interactive-tabs .dossier-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      const pArsenal = document.getElementById('dossier-panel-arsenal');
      const pDisc = document.getElementById('dossier-panel-disciplines');
      if (pArsenal && pDisc) {
        pArsenal.classList.toggle('is-active', tabKey === 'arsenal');
        pDisc.classList.toggle('is-active', tabKey === 'disciplines');
      }
      if (typeof playUiSound === 'function') playUiSound(900, 'sine', 0.03);
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
window.switchBannerSlider = switchBannerSlider;
window.openLightboxFromSlider = openLightboxFromSlider;
window.updateDeviceSliderDisplay = updateDeviceSliderDisplay;
window.scrollEcomSandbox = scrollEcomSandbox;
window.switchDossierTab = switchDossierTab;
window.stepPortfolioStage = stepPortfolioStage;

// Auto-detect mobile screen and default to mobile aspect ratio
if (typeof window !== 'undefined' && window.innerWidth <= 768) {
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
