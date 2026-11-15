// =========================================================
// STORYBOARD INSPECTION & MINIMALIST IMMERSIVE LIGHTBOX
// =========================================================
// =========================================================
    function handleStoryboardBoxClick(e) {
      openLightboxWithImage('assets/real_works/Barney_Dale__The_Cloud_story_arc.jpg', 'Barney Dale: The Cloud // Master Storyboard Arc', 'SAE INSTITUTE DUBAI // 2D PRODUCTION SHORT', '4118 / 1885');
    }

// =========================================================
    function openLightboxWithImage(src, title, sub = 'EDITORIAL ARCHIVE', aspectRatio = null) {
      const box = document.getElementById('storyboard-lightbox');
      const container = document.getElementById('lightbox-media-container');
      const skeleton = document.getElementById('lightbox-skeleton');
      const titleEl = document.getElementById('lightbox-title-text');
      const subEl = document.getElementById('lightbox-sub-text');

      if (titleEl) titleEl.innerText = title;
      if (subEl) subEl.innerText = sub;

      // Remove any active video from container
      if (container) {
        const v = container.querySelector('video');
        if (v) { v.pause(); v.remove(); }
        // Set aspect ratio immediately on frame 1 so skeleton loader is perfectly proportional
        if (aspectRatio) {
          container.style.aspectRatio = aspectRatio;
        } else {
          container.style.aspectRatio = '16 / 9';
        }
      }

      // Show luxury skeleton loader
      if (skeleton) skeleton.classList.remove('is-hidden');

      let img = document.getElementById('lightbox-full-img');
      if (!img && container) {
        img = document.createElement('img');
        img.id = 'lightbox-full-img';
        img.decoding = 'async';
        container.appendChild(img);
      }

      if (img) {
        img.style.display = 'block';
        img.style.opacity = '0';
        img.alt = title;

        const temp = new Image();
        temp.onload = () => {
          if (container && temp.naturalWidth && temp.naturalHeight) {
            container.style.aspectRatio = `${temp.naturalWidth} / ${temp.naturalHeight}`;
          }
          img.src = src;
          img.style.opacity = '1';
          if (skeleton) skeleton.classList.add('is-hidden');
        };
        temp.onerror = () => {
          img.src = src;
          img.style.opacity = '1';
          if (skeleton) skeleton.classList.add('is-hidden');
        };
        temp.src = src;
      }

      if (box) box.classList.add('is-open');
      document.body.classList.add('has-lightbox-open');
      playUiSound(1000, 'triangle', 0.08);
    }

    function openLightboxWithVideo(src, title, sub = 'EXPANDED 2D ANIMATION') {
      const box = document.getElementById('storyboard-lightbox');
      const container = document.getElementById('lightbox-media-container');
      const skeleton = document.getElementById('lightbox-skeleton');
      const titleEl = document.getElementById('lightbox-title-text');
      const subEl = document.getElementById('lightbox-sub-text');

      if (titleEl) titleEl.innerText = title;
      if (subEl) subEl.innerText = sub;

      const img = document.getElementById('lightbox-full-img');
      if (img) img.style.display = 'none';

      let video = container ? container.querySelector('video') : null;
      if (!video && container) {
        video = document.createElement('video');
        video.autoplay = true;
        video.controls = true;
        video.playsInline = true;
        container.appendChild(video);
      }
      if (video) {
        video.style.display = 'block';
        video.src = src;
        video.onloadeddata = () => {
          if (skeleton) skeleton.classList.add('is-hidden');
        };
      }
      if (skeleton) skeleton.classList.remove('is-hidden');

      if (box) box.classList.add('is-open');
      document.body.classList.add('has-lightbox-open');
      playUiSound(1000, 'triangle', 0.08);
    }

    function closeStoryboardLightbox() {
      const box = document.getElementById('storyboard-lightbox');
      if (box) box.classList.remove('is-open');
      document.body.classList.remove('has-lightbox-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const container = document.getElementById('lightbox-media-container');
      if (container) {
        const v = container.querySelector('video');
        if (v) { v.pause(); v.remove(); }
        const img = document.getElementById('lightbox-full-img');
        if (img) img.style.opacity = '0';
      }
      playUiSound(600, 'sine', 0.05);
    }

    // Escape Key Listener for Lightbox
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeStoryboardLightbox();
    });

window.handleStoryboardBoxClick = handleStoryboardBoxClick;
window.openLightboxWithImage = openLightboxWithImage;
window.openLightboxWithVideo = openLightboxWithVideo;
window.closeStoryboardLightbox = closeStoryboardLightbox;
