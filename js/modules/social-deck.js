// =========================================================================
// 3-RATIO SOCIAL AD SIMULATOR & MOTION REEL CONTROLLER
// =========================================================================
let activeSocialKey = 'taylormade';

function selectSocialCampaign(key, btn) {
  activeSocialKey = key;
  document.querySelectorAll('#social-campaign-nav .brand-tab-btn, #social-campaign-nav .console-brand-tab, #social-campaign-nav .brand-switch-pill').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`#social-campaign-nav button[onclick*="'${key}'"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }

  const data = socialCampaigns[key];
  if (!data) return;

  const img169 = document.getElementById('img-social-16-9');
  const img11 = document.getElementById('img-social-1-1');
  const img916 = document.getElementById('img-social-9-16');

  if (img169) smoothImageCrossfade(img169, data.ratio_16_9);
  if (img11) smoothImageCrossfade(img11, data.ratio_1_1);
  if (img916) smoothImageCrossfade(img916, data.ratio_9_16);

  const titleEl = document.getElementById('panel-social-title');
  const descEl = document.getElementById('panel-social-desc');
  if (titleEl && descEl) {
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(3px)';
    descEl.style.opacity = '0';
    descEl.style.transform = 'translateY(3px)';
    setTimeout(() => {
      titleEl.textContent = data.title;
      descEl.textContent = data.statement;
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'translateY(0)';
      descEl.style.opacity = '1';
      descEl.style.transform = 'translateY(0)';
    }, 120);
  } else if (titleEl) {
    titleEl.textContent = data.title;
  } else if (descEl) {
    descEl.textContent = data.statement;
  }

  playUiSound(820, 'sine', 0.04);
}

// Planar Deck Focus & Non-Clipping Hover Persistence for Floating Social Cards
(function initSocial3DParallax() {
  const stage = document.getElementById('social-stage-viewport');
  if (!stage) return;

  const cards = stage.querySelectorAll('.floating-card');
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      cards.forEach((c) => c.classList.remove('is-last-hovered'));
      card.classList.add('is-last-hovered');
    });
  });
})();

// Mobile Scroll Expansion Controller: Dynamically blooms & scales cards as user scrolls towards it
(function initSocialScrollExpansion() {
  const stage = document.getElementById('social-stage-viewport');
  if (!stage) return;

  let ticking = false;
  function updateScrollBloom() {
    if (window.innerWidth > 960) {
      stage.style.removeProperty('--scroll-scale');
      stage.style.removeProperty('--scroll-progress');
      stage.classList.remove('stage-expanded');
      ticking = false;
      return;
    }

    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    
    // When the top of stage enters viewport from bottom (rect.top <= vh * 0.95)
    // to when it is well-centered in view (rect.top <= vh * 0.35)
    const enter = vh * 0.95;
    const peak = vh * 0.35;
    const progress = Math.max(0, Math.min(1, (enter - rect.top) / (enter - peak)));

    // Scale dynamically expands from 0.88 to 1.02
    const scale = 0.88 + (progress * 0.14);
    stage.style.setProperty('--scroll-progress', progress.toFixed(3));
    stage.style.setProperty('--scroll-scale', scale.toFixed(3));

    if (progress > 0.35) {
      stage.classList.add('stage-expanded');
    } else {
      stage.classList.remove('stage-expanded');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollBloom);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateScrollBloom, { passive: true });
  updateScrollBloom();
})();

    function openLightboxFromSocial(ratio) {
      const data = socialCampaigns[activeSocialKey];
      if (!data) return;

      let src = data.ratio_1_1_native;
      let label = `${data.title} [1:1 FEED POST]`;
      let aspect = '1 / 1';
      if (ratio === '16-9') {
        src = data.ratio_16_9_native;
        label = `${data.title} [16:9 LANDSCAPE BANNER]`;
        aspect = '16 / 9';
      } else if (ratio === '9-16') {
        src = data.ratio_9_16_native;
        label = `${data.title} [9:16 VERTICAL STORY]`;
        aspect = '9 / 16';
      }

      openLightboxWithImage(src, label, 'OMNICHANNEL SOCIAL ASSET', aspect);
    }

    // VERTICAL REEL CONTROLS
    function toggleReelPlayback() {
      const video = document.getElementById('apparel-story-video');
      const icon = document.getElementById('reel-play-icon');
      if (!video) return;

      if (video.paused) {
        video.play();
        if (icon) icon.innerText = '⏸ PAUSE';
      } else {
        video.pause();
        if (icon) icon.innerText = '▶ PLAY';
      }
    }

    function toggleReelAudio() {
      const video = document.getElementById('apparel-story-video');
      const icon = document.getElementById('reel-audio-icon');
      if (!video) return;

      video.muted = !video.muted;
      if (icon) {
        icon.innerText = video.muted ? '🔇 UNMUTE' : '🔊 MUTED';
      }
    }

window.selectSocialCampaign = selectSocialCampaign;
window.openLightboxFromSocial = openLightboxFromSocial;
window.toggleReelPlayback = toggleReelPlayback;
window.toggleReelAudio = toggleReelAudio;
