// =========================================================
// AUDIO ENGINE (Disabled per user specification)
// =========================================================
function playUiSound() {
  // Audio removed per specification
}
window.playUiSound = playUiSound;

// =========================================================================
// UNIVERSAL IMAGE CROSS-FADE ANIMATION HELPER
// =========================================================================
function smoothImageCrossfade(imgEl, newSrc, onComplete) {
      if (!imgEl) {
        if (onComplete) onComplete();
        return;
      }
      if (imgEl.getAttribute('src') === newSrc) {
        if (onComplete) onComplete();
        return;
      }
      imgEl.classList.add('image-is-crossfading');
      const temp = new Image();
      temp.onload = temp.onerror = () => {
        setTimeout(() => {
          imgEl.src = newSrc;
          void imgEl.offsetWidth; // Force repaint
          imgEl.classList.remove('image-is-crossfading');
          if (onComplete) onComplete();
        }, 120);
      };
      temp.src = newSrc;
    }

window.smoothImageCrossfade = smoothImageCrossfade;
