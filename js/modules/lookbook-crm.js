// =========================================================================
// SECTOR 07: TRI-SET LOOKBOOK & CRM DRAWER CONTROLLERS
// =========================================================================
let activeTriSetKey = 'gfore';

function switchBrandTriSet(key, btn) {
      activeTriSetKey = key;
      document.querySelectorAll('#tri-set-brand-nav .console-brand-tab, #tri-set-brand-nav .brand-switch-pill').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');

      const items = triSets[key];
      if (!items) return;

      for (let i = 0; i < 3; i++) {
        const item = items[i];
        const img = document.getElementById(`tri-img-${i}`);
        const cap = document.getElementById(`tri-caption-${i}`);
        if (img && item) smoothImageCrossfade(img, item.file);
        if (cap && item) cap.innerText = item.label;
      }

      playUiSound(840, 'sine', 0.04);
    }

    function openLightboxFromTriSet(index) {
      const items = triSets[activeTriSetKey];
      if (!items || !items[index]) return;
      const item = items[index];
      // Index 0 is Landscape A4 (1.414:1); Index 1 & 2 are Portrait A4/A5 (1:1.414)
      const aspect = (index === 0) ? '3508 / 2480' : '2480 / 3508';
      openLightboxWithImage(item.native || item.file, item.label, 'A4 MASTER PRINT LOOKBOOK', aspect);
    }

let activeCrmKey = 'emailer1';

function switchCrmEmail(key, btn) {
      const frame = document.getElementById('crm-scroll-frame');

      // If clicking the currently active tab, smoothly return to top
      if (activeCrmKey === key && btn && btn.classList.contains('active')) {
        if (frame) frame.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      activeCrmKey = key;
      document.querySelectorAll('#crm-tabs-row .crm-browser-tab-btn, #crm-tabs-row .brand-switch-pill').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');

      const data = crmEmails[key];
      if (!data) return;

      const img = document.getElementById('crm-active-img');
      const subj = document.getElementById('crm-subject-line');

      if (subj) subj.innerText = data.subject;

      // Prevent scroll crossbleed: immediately reset scroll frame to top for the new campaign tab
      if (frame) {
        frame.scrollTop = 0;
      }

      if (img) {
        smoothImageCrossfade(img, data.file, () => {
          if (frame) frame.scrollTop = 0;
        });
      }

      playUiSound(860, 'sine', 0.04);
    }

    function openActiveCrmLightbox() {
      const data = crmEmails[activeCrmKey];
      if (!data) return;
      openLightboxWithImage(data.native || data.file, data.title, '5,000PX DIRECT-MAIL ARCHITECTURE', '750 / 5098');
    }

    function scrollCrmFrameTo(target) {
      const frame = document.getElementById('crm-scroll-frame');
      if (!frame) return;
      const maxScroll = Math.max(0, frame.scrollHeight - frame.clientHeight);
      let top = 0;
      if (target === 'mid') top = maxScroll * 0.5;
      else if (target === 'bottom') top = maxScroll;
      frame.scrollTo({ top, behavior: 'smooth' });
      playUiSound(880, 'sine', 0.03);
    }

window.switchBrandTriSet = switchBrandTriSet;
window.openLightboxFromTriSet = openLightboxFromTriSet;
window.switchCrmEmail = switchCrmEmail;
window.openActiveCrmLightbox = openActiveCrmLightbox;
window.scrollCrmFrameTo = scrollCrmFrameTo;
