/* ==========================================================================
   SPATIAL PORTRAIT NAVIGATION CONTROLLER (V3.1 ARCHITECTURE)
   Owns independent Portrait Room registry (decoupled from Desktop sectors),
   conflict-free Bottom Thumb Dock (+ horizontal scrubber), 2-Tab Atlas &
   Full-Screen All-36-Artworks Grand Salon Gallery, Act-Curtain transitions,
   gesture-isolated vertical navigation, and active video sync.
   ========================================================================== */
(function () {
  var PORTRAIT_ROOM_META = {
    'hero': {
      name: 'ENTRANCE',
      title: 'Cover Collage',
      spec: '36 WORKS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1080x1080.jpg'
    },
    'branding': {
      name: 'NIVARA BOOK',
      title: 'NIVARA Book',
      spec: '13 SLIDES',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-01.jpg'
    },
    'ecommerce': {
      name: 'DIGITAL COMMERCE',
      title: 'Digital Commerce',
      spec: '12 CARDS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1920.jpg'
    },
    'ecommerce-petals': {
      name: 'PETAL WHEEL',
      title: 'Petal Wheel',
      spec: '12 CARDS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1920.jpg'
    },
    'ecommerce-conveyor': {
      name: 'STORE MATRIX',
      title: 'Store Matrix',
      spec: '18 BANNERS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/new_additions/Adidas New Collection _ Slider App 900x600.jpg'
    },
    'ecommerce-hardware': {
      name: 'HARDWARE 3×',
      title: 'Hardware Trilogy',
      spec: '3 SYSTEMS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg'
    },
    'ecommerce-reels': {
      name: '9:16 REELS',
      title: 'Reel Cinema',
      spec: '3 REELS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/new_additions/PART_SALE_2026_Apparel_Story_poster.jpg'
    },
    'dispatch-browser': {
      name: 'DISPATCHES',
      title: 'Dispatches',
      spec: '4 EMAILS',
      act: 'daylight',
      atlasAct: 'DAYLIGHT',
      thumb: 'assets/optimized/new_additions/crm_vip_launch_750w.webp'
    },
    'section-barney': {
      name: '9:16 CINEMA',
      title: '9:16 Cinema',
      spec: '12 POSES',
      act: 'noir',
      atlasAct: 'NOIR',
      thumb: 'assets/optimized/Barney_Dale__The_Cloud_story_arc_poster.jpg'
    },
    'section-posters': {
      name: 'POSTER EDITIONS',
      title: 'Poster Deck',
      spec: '10 POSTERS',
      act: 'noir',
      atlasAct: 'NOIR',
      thumb: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-01.jpg'
    },
    'section-promos': {
      name: 'RETAIL SYSTEMS',
      title: 'Retail & Tri-Sets',
      spec: '15 PRINTS',
      act: 'noir',
      atlasAct: 'NOIR',
      thumb: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens Landscape.jpg'
    },
    'section-totems': {
      name: 'TOTEMS & AI LAB',
      title: 'Totems & AI',
      spec: '10 WORKS',
      act: 'noir',
      atlasAct: 'NOIR',
      thumb: 'assets/optimized/promosheet_banners/PUMA x PTC New Collection.jpg'
    },
    'section-trisets': {
      name: 'PRINT TRI-SETS',
      title: 'Print Tri-Sets',
      spec: '15 PRINTS',
      act: 'noir',
      atlasAct: 'NOIR',
      thumb: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens Landscape.jpg'
    },
    'resume': {
      name: 'EDITORIAL CV',
      title: 'Executive CV',
      spec: 'DOSSIER',
      act: 'paper',
      atlasAct: 'PAPER',
      thumb: 'assets/optimized/new_additions/PP.jpg'
    }
  };

  /* All 36 Verified Signature Works displayed in the 3-Column Ratio-Balanced Salon Gallery */
  var PORTRAIT_ALL_36_WORKS = [
    // COMMERCE & SOCIAL (9)
    { cat: 'commerce', tag: 'SOCIAL 1:1', ratio: '1 / 1', aspect: 1, title: 'TaylorMade Hi-Toe 5', sub: 'Omnichannel Launch Square', src: 'assets/optimized/new_additions/TaylorMade Hi-Toe 5 Wedges Ad 1080x1080.jpg' },
    { cat: 'commerce', tag: 'SOCIAL 9:16', ratio: '9 / 16', aspect: 0.5625, title: 'McLaren Series 3 Irons', sub: 'Vertical Performance Story', src: 'assets/optimized/new_additions/McLaren Series 3 Irons Sponsored Ads V2 1080x1920.jpg' },
    { cat: 'commerce', tag: 'BRAND OF MONTH', ratio: '1 / 1', aspect: 1, title: 'PUMA Sponsored Feature', sub: 'High-Contrast Social Tile', src: 'assets/optimized/new_additions/Sponsored Ads - Featured Brand of the Month PUMA 1080x1080 1.jpg' },
    { cat: 'commerce', tag: 'FLASH DEALS', ratio: '9 / 16', aspect: 0.5625, title: 'GG × PXG × JKN Flash', sub: '9:16 Promotion Grid', src: 'assets/optimized/new_additions/GG PXG L&S JKN Flash Deals Sponsored Ads 1080x1920 1.jpg' },
    { cat: 'commerce', tag: 'APP SLIDER', ratio: '3 / 2', aspect: 1.5, title: 'Adidas New Season', sub: '900×600 E-Commerce Banner', src: 'assets/optimized/new_additions/Adidas New Collection _ Slider App 900x600.jpg' },
    { cat: 'commerce', tag: 'APP SLIDER', ratio: '3 / 2', aspect: 1.5, title: 'J.Lindeberg 30Y Capsule', sub: '900×600 Editorial Slider', src: 'assets/optimized/new_additions/JLindeberg 30Y Collection Slider App 900x600.jpg' },
    { cat: 'commerce', tag: 'APP SLIDER', ratio: '3 / 2', aspect: 1.5, title: 'Vessel Golf Bag Series', sub: 'Luxury Hardware Storefront', src: 'assets/optimized/new_additions/Vessel New Collection Golf Bags Slider App 900x600.jpg' },
    { cat: 'commerce', tag: 'HARDWARE 3×', ratio: '3 / 2', aspect: 1.5, title: 'Callaway Quantum Series', sub: 'Flagship Club Feature', src: 'assets/optimized/Callaway_Quantum_Series_900x600.jpg' },
    { cat: 'commerce', tag: 'HARDWARE 3×', ratio: '3 / 2', aspect: 1.5, title: 'TaylorMade Qi4D Series', sub: 'Carbonwood Driver Suite', src: 'assets/optimized/TaylorMade_Qi4D_Series_900x600.jpg' },

    // RETAIL & CRM DISPATCHES (7)
    { cat: 'retail', tag: 'MONOLITH 750×1669', ratio: '1 / 2', aspect: 0.5, title: 'PUMA × PTC Collection', sub: 'Palm Tree Crew Retail Totem', src: 'assets/optimized/promosheet_banners/PUMA x PTC New Collection.jpg' },
    { cat: 'retail', tag: 'MONOLITH', ratio: '1 / 2', aspect: 0.5, title: 'Callaway Chrome Tour', sub: '2026 Performance Ball Edit', src: 'assets/optimized/promosheet_banners/Callaway 2026 Chrome Tour Golf Balls.jpg' },
    { cat: 'retail', tag: 'MONOLITH', ratio: '1 / 2', aspect: 0.5, title: 'Bettinardi Antidote', sub: 'Precision Milled Putter Edit', src: 'assets/optimized/promosheet_banners/Bettinardi the Antidote Putter Series.jpg' },
    { cat: 'retail', tag: 'MONOLITH', ratio: '2 / 3', aspect: 0.667, title: 'Vessel Nightfire Edit', sub: 'Dark Luxury Gear Banner', src: 'assets/optimized/promosheet_banners/Vessel Nightfire Collection.jpg' },
    { cat: 'retail', tag: 'SPATIAL RIG', ratio: '4 / 3', aspect: 1.333, title: 'The Open Hanging Rig', sub: '2026 Storefront Display Mockup', src: 'assets/optimized/new_additions/The Open Major Offers 2026 Hanging Banner mockup.jpg' },
    { cat: 'retail', tag: 'CRM DISPATCH', ratio: '1 / 2', aspect: 0.5, title: 'VIP Arrivals Mailer', sub: '5,000px Long-Form Dispatch', src: 'assets/optimized/new_additions/crm_vip_launch_750w.webp', native: 'assets/optimized/new_additions/crm_vip_launch_1500w.webp' },
    { cat: 'retail', tag: 'CRM DISPATCH', ratio: '1 / 2', aspect: 0.5, title: 'Vessel Luxury Dispatch', sub: 'Curated E-Mail Experience', src: 'assets/optimized/new_additions/crm_vessel_luxury_750w.webp', native: 'assets/optimized/new_additions/crm_vessel_luxury_1500w.webp' },

    // POSTERS, FOLIOS & EDITORIAL PRINT (11)
    { cat: 'print', tag: 'EXHIBITION PRINT', ratio: '3 / 4', aspect: 0.75, title: 'The Cognitive Maze', sub: 'Mental Health Series IV · 01', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-01.jpg' },
    { cat: 'print', tag: 'EXHIBITION PRINT', ratio: '3 / 4', aspect: 0.75, title: 'Inner Labyrinth II', sub: 'Mental Health Series IV · 02', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 4-02.jpg' },
    { cat: 'print', tag: 'EXHIBITION PRINT', ratio: '3 / 4', aspect: 0.75, title: 'Dualities Within', sub: 'Mental Health Series III · 04', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-04.jpg' },
    { cat: 'print', tag: 'EXHIBITION PRINT', ratio: '3 / 4', aspect: 0.75, title: 'Silent Frequencies', sub: 'Mental Health Series III · 01', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 3-01.jpg' },
    { cat: 'print', tag: 'EXHIBITION PRINT', ratio: '3 / 4', aspect: 0.75, title: 'Cognitive Fractures I', sub: 'Mental Health Series V · 01', src: 'assets/optimized/posters/Mental Health Awareness Poster Set 5-01.jpg' },
    { cat: 'print', tag: 'EDITORIAL PRINT', ratio: '3 / 4', aspect: 0.75, title: 'CTRL+ALT Magazine Cover', sub: 'Print Issue Typography', src: 'assets/optimized/magazine_edit/CTRL+ALT_Layout.jpg' },
    { cat: 'print', tag: 'EDITORIAL PRINT', ratio: '3 / 4', aspect: 0.75, title: 'CTRL+ALT Feature Spread', sub: 'Editorial Grid Composition', src: 'assets/optimized/magazine_edit/CTRL+ALT_Layout2.jpg' },
    { cat: 'print', tag: 'TRI-SET FOLIO', ratio: '4 / 3', aspect: 1.333, title: 'G/FORE A4 Landscape', sub: 'Luxury Store Print Trio', src: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/GFORE/GFORE_A4 Mens Landscape.jpg' },
    { cat: 'print', tag: 'TRI-SET FOLIO', ratio: '3 / 4', aspect: 0.75, title: 'Nike Golf A4 Portrait', sub: 'Performance Apparel Poster', src: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/Nike/NIKE 19 02 26 A4 M.jpg' },
    { cat: 'print', tag: 'TRI-SET FOLIO', ratio: '3 / 4', aspect: 0.75, title: 'Galvin Green A4 Print', sub: 'Clean Technical Apparel Sheet', src: 'assets/optimized/new_additions/A4 Posters - New Arrivals (2)/Galvin Green/Galvin Green 19 02 26A4.jpg' },
    { cat: 'print', tag: 'CAPSULE A4', ratio: '3 / 4', aspect: 0.75, title: 'Honma Sakura Edition', sub: 'Limited Botanical Golf Folio', src: 'assets/optimized/new_additions/Honma Sakura Complete Sets_A4.jpg' },

    // MOTION & 3D AI DIRECTION (5)
    { cat: 'motion', type: 'video', tag: '9:16 SHORT', ratio: '9 / 16', aspect: 0.5625, title: 'Barney Dale: The Cloud', sub: 'After Effects 2D Character Rig', src: 'assets/optimized/Barney_Dale__The_Cloud_story_arc_poster.jpg', native: 'assets/optimized/Barney_Dale__The_Cloud_story_arc.mp4' },
    { cat: 'motion', type: 'video', tag: '9:16 REEL', ratio: '9 / 16', aspect: 0.5625, title: 'Part Sale 2026 Story', sub: '60FPS Apparel Motion Reel', src: 'assets/optimized/new_additions/PART_SALE_2026_Apparel_Story_poster.jpg', native: 'assets/optimized/new_additions/PART SALE 2026 Apparel Story.mp4' },
    { cat: 'motion', tag: 'MOTION DISPLAY', ratio: '9 / 16', aspect: 0.5625, title: 'Galvin Green Kinetics', sub: 'Animated Display Ad Loop', src: 'assets/optimized/Galvin_Green_New_Collection.gif' },
    { cat: 'motion', tag: 'MOTION DISPLAY', ratio: '9 / 16', aspect: 0.5625, title: 'L.A.B. Golf DF3 Loop', sub: 'Dynamic Restock Animation', src: 'assets/optimized/LAB_Golf_DF3__Back_in_stock.gif' },
    { cat: 'motion', tag: 'AI CAMPAIGN', ratio: '1 / 1', aspect: 1, title: 'Synthetic Studio Edit', sub: 'Gen-AI Visual Direction', src: 'assets/optimized/new_additions/689352046_18580395709020262_5220540874800235796_n.jpg' },

    // BRAND IDENTITY (4)
    { cat: 'brand', tag: 'BRAND MANUAL', ratio: '4 / 3', aspect: 1.333, title: 'NIVARA Title Spread', sub: 'Slide 01 // Brand Philosophy', src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-01.jpg' },
    { cat: 'brand', tag: 'BRAND SYSTEM', ratio: '4 / 3', aspect: 1.333, title: 'NIVARA Botanical Pack', sub: 'Slide 05 // Color & Packaging', src: 'assets/optimized/brand_identity/Brand Identity_NIVARA_Version Irene-05.jpg' },
    { cat: 'brand', tag: 'PACKAGING', ratio: '4 / 3', aspect: 1.333, title: 'Embossed Paper & Bag', sub: 'Luxury Tactile Seal Mockup', src: 'assets/optimized/Logo_Mock.jpg' },
    { cat: 'brand', tag: 'MARK GEOMETRY', ratio: '4 / 3', aspect: 1.333, title: 'Symmetric Mark Trials', sub: 'Proportion & Grid Study', src: 'assets/optimized/Nivara_Logo_Trials_05.jpg' }
  ];

  var activeIdx = 0;
  var prevIdx = -1;
  var hasInitializedChapter = false;
  var transitionTimer = null;
  var curtainTimer = null;
  var activeAtlasTab = 'rooms';
  var activeSalonFilter = 'all';
  var filteredSalonCache = PORTRAIT_ALL_36_WORKS.slice();
  var wheelLockUntil = 0;

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getRooms() {
    var nodes = document.querySelectorAll('#portrait-viewport > .p-chapter');
    var list = [];
    nodes.forEach(function (el, i) {
      var id = el.id || ('room-' + i);
      el.setAttribute('data-chapter-idx', String(i));
      var meta = PORTRAIT_ROOM_META[id] || {
        name: id.toUpperCase(),
        title: id,
        spec: '',
        act: el.getAttribute('data-act') || 'daylight',
        atlasAct: (el.getAttribute('data-act') || 'DAYLIGHT').toUpperCase(),
        thumb: 'assets/optimized/new_additions/PP.jpg'
      };
      list.push({
        id: id,
        idx: i,
        el: el,
        code: pad2(i + 1),
        name: meta.name,
        title: meta.title,
        spec: meta.spec || '',
        act: meta.act,
        atlasAct: meta.atlasAct,
        thumb: meta.thumb
      });
    });
    return list;
  }

  function resolveRoomId(idxOrId) {
    if (typeof idxOrId === 'number') return idxOrId;
    var mapAlias = {
      'ecommerce': document.getElementById('ecommerce') ? 'ecommerce' : 'ecommerce-petals',
      'section-promos': document.getElementById('section-promos') ? 'section-promos' : 'section-totems'
    };
    return mapAlias[idxOrId] || idxOrId;
  }

  function syncActiveVideos(roomIdOrIdx) {
    var targetId = typeof roomIdOrIdx === 'string' ? roomIdOrIdx : null;
    if (!targetId) {
      var rooms = getRooms();
      var idx = typeof roomIdOrIdx === 'number' ? roomIdOrIdx : activeIdx;
      targetId = rooms[idx] ? rooms[idx].id : '';
    }
    var allVideos = document.querySelectorAll('#portrait-viewport video');
    allVideos.forEach(function (v) {
      var hostChapter = v.closest('.p-chapter');
      var hostSubpanel = v.closest('.p-subpanel');
      var isChapterActive = Boolean(hostChapter && hostChapter.id === targetId);
      var isSubpanelActive = !hostSubpanel || hostSubpanel.classList.contains('is-active');

      if (isChapterActive && isSubpanelActive && v.dataset.userPaused !== 'true') {
        v.play().catch(function () {});
      } else {
        v.pause();
      }
    });
  }

  function bindMediaSkeleton(box) {
    var img = box.querySelector('img');
    if (!img) return;
    if (!img.dataset.baseSrc) {
      img.dataset.baseSrc = img.getAttribute('src') || '';
    }

    function nextToken() {
      var n = Number(img.dataset.skelToken || 0) + 1;
      img.dataset.skelToken = String(n);
      return n;
    }

    function showSkeleton() {
      box.classList.add('is-loading');
      box.classList.remove('is-loaded');
    }

    function markLoaded(token) {
      if (token !== Number(img.dataset.skelToken || 0)) return;
      if (!img.complete || img.naturalWidth === 0) {
        showSkeleton();
        return;
      }
      img.dataset.retryCount = '0';
      box.classList.remove('is-loading');
      box.classList.add('is-loaded');
    }

    function settleWhenDecoded(token) {
      if (token !== Number(img.dataset.skelToken || 0)) return;
      if (!img.complete || img.naturalWidth === 0) {
        showSkeleton();
        return;
      }
      if (typeof img.decode === 'function') {
        img.decode().then(function () {
          markLoaded(token);
        }, function () {
          markLoaded(token);
        });
      } else {
        markLoaded(token);
      }
    }

    function scheduleRetry() {
      showSkeleton();
      var count = Number(img.dataset.retryCount || 0);
      if (count >= 4 || !img.isConnected) return;
      count += 1;
      img.dataset.retryCount = String(count);
      var baseSrc = img.dataset.baseSrc || img.getAttribute('src') || '';
      if (!baseSrc) return;
      var delay = Math.min(6000, 850 * Math.pow(2, count - 1));
      window.clearTimeout(Number(img.dataset.retryTimer || 0));
      img.dataset.retryTimer = String(window.setTimeout(function () {
        if (!img.isConnected) return;
        showSkeleton();
        var cleanBase = baseSrc.split('?')[0];
        img.src = cleanBase + '?skretry=' + count;
      }, delay));
    }

    var token = nextToken();

    if (!img.dataset.skelBound) {
      img.dataset.skelBound = '1';
      img.addEventListener('loadstart', function () {
        nextToken();
        showSkeleton();
      });
      img.addEventListener('load', function () {
        var currentTok = Number(img.dataset.skelToken || 0);
        settleWhenDecoded(currentTok);
      });
      img.addEventListener('error', function () {
        nextToken();
        scheduleRetry();
      });
      if (typeof MutationObserver === 'function') {
        var obs = new MutationObserver(function (muts) {
          for (var i = 0; i < muts.length; i++) {
            if (muts[i].attributeName === 'src') {
              var newAttr = img.getAttribute('src') || '';
              if (newAttr && newAttr.indexOf('skretry=') === -1) {
                img.dataset.baseSrc = newAttr;
                img.dataset.retryCount = '0';
              }
              var tok = nextToken();
              if (!img.complete || img.naturalWidth === 0) {
                showSkeleton();
              } else {
                settleWhenDecoded(tok);
              }
            }
          }
        });
        obs.observe(img, { attributes: true, attributeFilter: ['src'] });
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      settleWhenDecoded(token);
    } else {
      showSkeleton();
    }
  }

  function hydrateMediaSkeletons(rootEl, boxSelector) {
    if (!rootEl) return;
    rootEl.querySelectorAll(boxSelector).forEach(bindMediaSkeleton);
  }
  window.hydratePortraitSkeletons = hydrateMediaSkeletons;

  function setActiveAtlasActPill(act) {
    document.querySelectorAll('#p-atlas-act-bar [data-act-jump]').forEach(function (pill) {
      pill.classList.toggle('is-active', pill.getAttribute('data-act-jump') === act);
    });
  }

  function buildAtlasGrid() {
    var gridEl = document.getElementById('p-atlas-grid');
    if (!gridEl) return;
    var rooms = getRooms();

    var actGroups = [
      { act: 'daylight', label: 'ACT I // DAYLIGHT COMMERCE', range: '01 — 07' },
      { act: 'noir', label: 'ACT II // NOIR CINEMA & SPATIAL', range: '08 — 11' },
      { act: 'paper', label: 'ACT III // CURATORIAL DOSSIER', range: '12' }
    ];

    gridEl.innerHTML = actGroups.map(function (group) {
      var groupRooms = rooms.filter(function (r) { return (r.act || 'daylight') === group.act; });
      if (!groupRooms.length) return '';
      var firstCode = groupRooms[0].code;
      var lastCode = groupRooms[groupRooms.length - 1].code;
      var rangeLabel = groupRooms.length === 1 ? firstCode : (firstCode + ' — ' + lastCode);

      var cardsHtml = groupRooms.map(function (room) {
        var loadingMode = room.idx < 6 ? 'eager' : 'lazy';
        return '<button type="button" class="p-atlas-tile' + (room.idx === activeIdx ? ' is-active' : '') +
          '" data-atlas-idx="' + room.idx + '" onclick="closePortraitAtlas(); goToPortraitChapter(\'' + room.id + '\');">' +
          '<div class="p-atlas-thumb is-loading">' +
            '<span class="p-salon-skeleton" aria-hidden="true"></span>' +
            '<img loading="' + loadingMode + '" src="' + room.thumb + '" alt="' + room.title + '" decoding="async">' +
            '<span class="p-atlas-num">' + room.code + '</span>' +
          '</div>' +
          '<div class="p-atlas-tile-meta">' +
            '<strong class="p-atlas-tile-name">' + room.title + '</strong>' +
            '<span class="p-atlas-tile-spec">' + (room.spec || room.atlasAct) + '</span>' +
          '</div>' +
        '</button>';
      }).join('');

      return '<section class="p-atlas-act-group" data-atlas-act="' + group.act + '">' +
        '<div class="p-atlas-act-header"><span>' + group.label + '</span><b>' + rangeLabel + '</b></div>' +
        '<div class="p-atlas-act-grid">' + cardsHtml + '</div>' +
      '</section>';
    }).join('');

    hydrateMediaSkeletons(gridEl, '.p-atlas-thumb');
    var currentRoom = rooms[activeIdx];
    if (currentRoom) setActiveAtlasActPill(currentRoom.act || 'daylight');
  }

  function scrollAtlasToAct(act) {
    setActiveAtlasActPill(act);
    var gridEl = document.getElementById('p-atlas-grid');
    if (!gridEl) return;
    var target = gridEl.querySelector('[data-atlas-act="' + act + '"]');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderSalonGallery(filterCat) {
    var masonry = document.getElementById('p-salon-masonry');
    if (!masonry) return;
    var targetCat = filterCat || activeSalonFilter || 'all';
    activeSalonFilter = targetCat;

    filteredSalonCache = PORTRAIT_ALL_36_WORKS.filter(function (w) {
      return targetCat === 'all' || w.cat === targetCat;
    });

    var cols = [[], [], []];
    var colHeights = [0, 0, 0];

    filteredSalonCache.forEach(function (work, idx) {
      var minCol = 0;
      if (colHeights[1] < colHeights[minCol]) minCol = 1;
      if (colHeights[2] < colHeights[minCol]) minCol = 2;
      var aspect = work.aspect || 1;
      var ratio = work.ratio || '1 / 1';
      var eager = idx < 9 ? 'eager' : 'lazy';
      var fetchPrio = idx < 6 ? ' fetchpriority="high"' : '';

      cols[minCol].push(
        '<button type="button" class="p-salon-card" data-salon-idx="' + idx + '" onclick="openPortraitSalonWork(' + idx + ')">' +
          '<div class="p-salon-media is-loading" style="aspect-ratio:' + ratio + ';">' +
            '<span class="p-salon-skeleton" aria-hidden="true"></span>' +
            '<img class="p-salon-img" loading="' + eager + '"' + fetchPrio + ' src="' + work.src + '" alt="' + work.title + '" decoding="async">' +
            '<span class="p-salon-badge">' + work.tag + '</span>' +
          '</div>' +
          '<div class="p-salon-meta">' +
            '<strong>' + work.title + '</strong>' +
          '</div>' +
        '</button>'
      );
      colHeights[minCol] += (1 / aspect) + 0.24;
    });

    masonry.innerHTML = cols.map(function (c, i) {
      return '<div class="p-salon-col" data-salon-col="' + i + '">' + c.join('') + '</div>';
    }).join('');

    hydrateMediaSkeletons(masonry, '.p-salon-media');
  }

  function filterSalonGallery(cat, btn) {
    document.querySelectorAll('#p-salon-filters .p-salon-filter-pill').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-salon-cat') === cat);
    });
    if (btn) btn.classList.add('is-active');
    renderSalonGallery(cat);
    var scrollEl = document.getElementById('p-salon-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
    window.requestAnimationFrame(syncAtlasEdgeProgress);
  }

  function openPortraitSalonWork(filteredIdx) {
    var work = filteredSalonCache[filteredIdx];
    if (!work) return;
    if (work.type === 'video' && typeof window.openLightboxWithVideo === 'function') {
      window.openLightboxWithVideo(work.native || work.src, work.title, work.sub);
    } else if (typeof window.openLightboxWithImage === 'function') {
      window.openLightboxWithImage(work.native || work.src, work.title, work.sub);
    }
  }

  function triggerActCurtain(nextAct) {
    var curtain = document.getElementById('p-act-curtain');
    if (!curtain) return;
    window.clearTimeout(curtainTimer);
    curtain.className = 'p-act-curtain is-' + nextAct;
    void curtain.offsetWidth;
    curtain.classList.add('is-pulsing');
    curtainTimer = window.setTimeout(function () {
      curtain.classList.remove('is-pulsing');
    }, 460);
  }

  function updateChromeIndicators(sec, total) {
    var hudKicker = document.getElementById('p-hud-kicker');
    var hudSector = document.getElementById('p-hud-sector');
    var hudCounter = document.getElementById('p-hud-counter');
    var frameAct = document.getElementById('p-frame-act');
    var progressFill = document.getElementById('p-chapter-progress');
    var scrubLabel = document.getElementById('p-dock-scrub-label');
    var scrubFill = document.getElementById('p-dock-scrub-fill');
    var prevBtn = document.getElementById('p-dock-prev');
    var nextBtn = document.getElementById('p-dock-next');
    var ringArc = document.getElementById('p-ring-arc');
    var ringGlyph = document.getElementById('p-ring-glyph');
    var atlasKicker = document.getElementById('p-atlas-kicker');
    var pctNum = (sec.idx + 1) / Math.max(1, total);
    var pct = (pctNum * 100) + '%';
    var isLast = sec.idx >= total - 1;

    if (hudKicker) hudKicker.textContent = sec.code + ' / ' + pad2(total) + ' · ' + sec.atlasAct;
    if (hudSector) hudSector.textContent = sec.title || sec.name;
    if (hudCounter) {
      hudCounter.textContent = sec.code + ' / ' + pad2(total);
    }
    if (frameAct) frameAct.textContent = sec.atlasAct || (sec.act || 'DAYLIGHT').toUpperCase();
    if (progressFill) progressFill.style.width = pct;
    if (scrubLabel) scrubLabel.textContent = sec.code + ' / ' + pad2(total) + ' · ' + (sec.title || sec.name);
    if (scrubFill) scrubFill.style.width = pct;

    document.querySelectorAll('#p-chapter-ticks .p-tick').forEach(function (tick, i) {
      tick.classList.toggle('is-active', i === sec.idx);
      tick.classList.toggle('is-past', i < sec.idx);
    });
    document.querySelectorAll('#p-dock-dots .p-dock-dot').forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === sec.idx);
    });
    document.querySelectorAll('#p-ring-picker .p-ring-node').forEach(function (node, i) {
      node.classList.toggle('is-active', i === sec.idx);
    });

    if (ringArc) {
      var circumference = 150.8;
      ringArc.style.strokeDashoffset = (circumference * (1 - pctNum)).toFixed(2);
    }
    if (ringGlyph) {
      ringGlyph.innerHTML = isLast
        ? '<svg class="p-btn-chevron" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 12.5V3.5M4 7.5L8 3.5L12 7.5"/></svg>'
        : '<svg class="p-btn-chevron" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5L10.5 8L6 12.5"/></svg>';
    }
    if (prevBtn) prevBtn.disabled = (sec.idx <= 0);
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.toggle('is-end', isLast);
      nextBtn.setAttribute('aria-label', isLast ? 'Return to Room 01' : 'Next Room — Swipe or hold for room picker');
    }
    if (atlasKicker) atlasKicker.textContent = 'EXHIBITION INDEX · ' + pad2(total) + ' ROOMS';
  }

  function goToPortraitChapter(idxOrId) {
    var rooms = getRooms();
    if (!rooms.length) return;

    var resolved = resolveRoomId(idxOrId);
    var nextIdx = typeof resolved === 'number'
      ? resolved
      : rooms.findIndex(function (r) { return r.id === resolved; });

    if (nextIdx < 0 || nextIdx >= rooms.length) return;

    var sec = rooms[nextIdx];
    var nextAct = sec.act || 'daylight';
    var atlasEl = document.getElementById('p-atlas');

    if (hasInitializedChapter && nextIdx === activeIdx) {
      document.body.setAttribute('data-act', nextAct);
      document.body.setAttribute('data-chapter', String(nextIdx));
      if (atlasEl) atlasEl.setAttribute('data-act', nextAct);
      setActiveAtlasActPill(nextAct);
      updateChromeIndicators(sec, rooms.length);
      return;
    }

    var leavingIdx = hasInitializedChapter ? activeIdx : -1;
    var dirFwd = leavingIdx < 0 ? true : nextIdx >= leavingIdx;

    window.clearTimeout(transitionTimer);
    rooms.forEach(function (room) {
      var ch = room.el;
      ch.classList.remove('is-entering-fwd', 'is-entering-bwd', 'is-exiting-fwd', 'is-exiting-bwd');
      if (room.idx === nextIdx) {
        ch.classList.add('is-active');
        if (leavingIdx >= 0 && leavingIdx !== nextIdx) {
          ch.classList.add(dirFwd ? 'is-entering-fwd' : 'is-entering-bwd');
        }
      } else if (room.idx === leavingIdx && leavingIdx !== nextIdx) {
        ch.classList.remove('is-active');
        ch.classList.add(dirFwd ? 'is-exiting-fwd' : 'is-exiting-bwd');
      } else {
        ch.classList.remove('is-active');
      }
    });

    if (leavingIdx >= 0 && leavingIdx !== nextIdx && rooms[leavingIdx]) {
      var exitingEl = rooms[leavingIdx].el;
      var enteringEl = sec.el;
      transitionTimer = window.setTimeout(function () {
        if (exitingEl) exitingEl.classList.remove('is-exiting-fwd', 'is-exiting-bwd');
        if (enteringEl) enteringEl.classList.remove('is-entering-fwd', 'is-entering-bwd');
      }, 480);
    }

    prevIdx = leavingIdx;
    activeIdx = nextIdx;
    hasInitializedChapter = true;

    var handoffScroller = sec.el.hasAttribute('data-scroll-handoff')
      ? sec.el
      : sec.el.querySelector('[data-scroll-handoff="true"]');
    if (handoffScroller) {
      handoffScroller.scrollTop = 0;
    }

    document.body.setAttribute('data-act', nextAct);
    document.body.setAttribute('data-chapter', String(nextIdx));
    if (atlasEl) atlasEl.setAttribute('data-act', nextAct);
    setActiveAtlasActPill(nextAct);

    updateChromeIndicators(sec, rooms.length);

    document.querySelectorAll('#p-atlas-grid .p-atlas-tile').forEach(function (tile, i) {
      tile.classList.toggle('is-active', i === nextIdx);
    });

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.search + '#' + sec.id);
    }

    syncActiveVideos(sec.id);

    if ((sec.id === 'ecommerce' || sec.id === 'ecommerce-petals') && typeof window.petalWheelRefreshLayout === 'function') {
      window.requestAnimationFrame(window.petalWheelRefreshLayout);
    }
    if ((sec.id === 'section-promos' || sec.id === 'section-trisets') && typeof window.trisetWheelRefreshLayout === 'function') {
      window.requestAnimationFrame(window.trisetWheelRefreshLayout);
    }
    if (sec.id === 'ecommerce-conveyor' && typeof window.refreshConveyorLanes === 'function') {
      window.requestAnimationFrame(window.refreshConveyorLanes);
    }
    if (sec.id === 'ecommerce-reels' && typeof window.refreshReelTransposeScale === 'function') {
      window.requestAnimationFrame(window.refreshReelTransposeScale);
    }
    window.playUiSound && window.playUiSound(760, 'sine', 0.04);
  }

  function stepPortraitChapter(delta) {
    goToPortraitChapter(activeIdx + delta);
  }

  function jumpToCommerceModule(subKey) {
    var directMap = {
      'petal': 'ecommerce-petals',
      'storefront': 'ecommerce-conveyor',
      'hardware': 'ecommerce-hardware',
      'reels': 'ecommerce-reels',
      'landing': 'dispatch-browser'
    };
    var targetId = directMap[subKey];
    if (targetId && document.getElementById(targetId)) {
      goToPortraitChapter(targetId);
      if (subKey === 'landing' && typeof window.switchDispatchDoc === 'function') {
        var landBtn = document.querySelector('[data-dispatch-doc="landing"]');
        window.switchDispatchDoc('landing', landBtn);
      }
      return;
    }
    goToPortraitChapter('ecommerce');
    if (typeof window.switchEcomSub === 'function') {
      var btn = document.querySelector('[data-ecom-sub="' + subKey + '"]');
      window.switchEcomSub(subKey, btn);
    }
  }

  function jumpToPromoModule(subKey) {
    var directMap = {
      'monoliths': 'section-totems',
      'ailab': 'section-totems',
      'trisets': 'section-trisets',
      'crm': 'dispatch-browser'
    };
    var targetId = directMap[subKey];
    if (targetId && document.getElementById(targetId)) {
      goToPortraitChapter(targetId);
      if ((subKey === 'monoliths' || subKey === 'ailab') && typeof window.switchTotemTab === 'function') {
        var tabBtn = document.querySelector('[data-totem-tab="' + subKey + '"]');
        window.switchTotemTab(subKey, tabBtn);
      }
      if (subKey === 'crm' && typeof window.switchDispatchDoc === 'function') {
        var crmBtn = document.querySelector('[data-dispatch-doc="emailer1"]');
        window.switchDispatchDoc('emailer1', crmBtn);
      }
      return;
    }
    goToPortraitChapter('section-promos');
    if (typeof window.switchPromoSub === 'function') {
      var btn = document.querySelector('[data-promo-sub="' + subKey + '"]');
      window.switchPromoSub(subKey, btn);
    }
  }

  function syncAtlasEdgeProgress() {
    var track = document.getElementById('p-atlas-edge-progress');
    var fill = document.getElementById('p-atlas-edge-fill');
    if (!track || !fill) return;
    var isGallery = activeAtlasTab === 'gallery';
    track.classList.toggle('is-gallery-mode', isGallery);
    var scroller = isGallery
      ? document.getElementById('p-salon-scroll')
      : document.getElementById('p-atlas-grid');
    if (!scroller) return;
    var maxScroll = scroller.scrollHeight - scroller.clientHeight;
    if (maxScroll <= 4) {
      track.classList.add('is-hidden');
      fill.style.transform = 'scaleY(1)';
      return;
    }
    track.classList.remove('is-hidden');
    var minThumb = Math.max(0.14, scroller.clientHeight / Math.max(scroller.clientHeight, scroller.scrollHeight));
    var ratio = Math.max(0, Math.min(1, scroller.scrollTop / maxScroll));
    var scale = minThumb + (1 - minThumb) * ratio;
    fill.style.transform = 'scaleY(' + scale.toFixed(4) + ')';
  }

  function initAtlasEdgeProgress() {
    ['p-atlas-grid', 'p-salon-scroll'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.dataset.edgeBound) {
        el.dataset.edgeBound = '1';
        el.addEventListener('scroll', syncAtlasEdgeProgress, { passive: true });
      }
    });
  }

  function setAtlasTab(tabName) {
    activeAtlasTab = tabName === 'gallery' ? 'gallery' : 'rooms';
    var isGallery = activeAtlasTab === 'gallery';
    var roomsBtn = document.getElementById('p-atlas-tab-rooms');
    var galBtn = document.getElementById('p-atlas-tab-gallery');
    var roomsView = document.getElementById('p-atlas-rooms-view');
    var galView = document.getElementById('p-atlas-gallery-view');
    var titleEl = document.getElementById('p-atlas-title');

    if (roomsBtn) {
      roomsBtn.classList.toggle('is-active', !isGallery);
      roomsBtn.setAttribute('aria-selected', String(!isGallery));
    }
    if (galBtn) {
      galBtn.classList.toggle('is-active', isGallery);
      galBtn.setAttribute('aria-selected', String(isGallery));
    }
    if (roomsView) roomsView.classList.toggle('is-active', !isGallery);
    if (galView) galView.classList.toggle('is-active', isGallery);
    if (titleEl) titleEl.textContent = isGallery ? 'All 36 Signature Works' : 'Jump To Any Gallery';

    if (isGallery) {
      var masonry = document.getElementById('p-salon-masonry');
      if (masonry && !masonry.children.length) {
        renderSalonGallery(activeSalonFilter);
      } else if (masonry) {
        hydrateMediaSkeletons(masonry, '.p-salon-media');
      }
    } else {
      buildAtlasGrid();
    }
    window.requestAnimationFrame(syncAtlasEdgeProgress);
  }

  function openPortraitAtlas(tabName) {
    var atlas = document.getElementById('p-atlas');
    if (!atlas) return;
    var rooms = getRooms();
    var curAct = (rooms[activeIdx] && rooms[activeIdx].act) || document.body.getAttribute('data-act') || 'daylight';
    atlas.setAttribute('data-act', curAct);
    setAtlasTab(tabName || 'rooms');
    setActiveAtlasActPill(curAct);
    atlas.classList.add('is-open');
    atlas.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-atlas-open');
    window.requestAnimationFrame(syncAtlasEdgeProgress);
  }

  function openPortraitGallery() {
    openPortraitAtlas('gallery');
  }

  function closePortraitAtlas() {
    var atlas = document.getElementById('p-atlas');
    if (!atlas) return;
    atlas.classList.remove('is-open');
    atlas.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-atlas-open');
  }

  function togglePortraitAtlas() {
    var atlas = document.getElementById('p-atlas');
    if (!atlas) return;
    if (atlas.classList.contains('is-open')) closePortraitAtlas();
    else openPortraitAtlas('rooms');
  }

  function toggleHeroBioDrawer(openState) {
    var drawer = document.getElementById('p-bio-drawer');
    if (!drawer) return;
    var shouldOpen = typeof openState === 'boolean' ? openState : !drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', shouldOpen);
    drawer.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
  }

  function initThumbDockScrub() {
    var scrub = document.getElementById('p-dock-scrub');
    if (!scrub) return;
    var pointerId = null;
    var downX = 0;
    var isDragging = false;
    var lastPreviewIdx = -1;

    function idxFromClientX(clientX) {
      var rect = scrub.getBoundingClientRect();
      var rooms = getRooms();
      if (!rooms.length || rect.width <= 0) return activeIdx;
      var norm = Math.max(0, Math.min(0.9999, (clientX - rect.left) / rect.width));
      return Math.floor(norm * rooms.length);
    }

    scrub.addEventListener('pointerdown', function (e) {
      pointerId = e.pointerId;
      downX = e.clientX;
      isDragging = false;
      lastPreviewIdx = activeIdx;
      if (scrub.setPointerCapture) {
        try { scrub.setPointerCapture(pointerId); } catch (err) {}
      }
    });

    scrub.addEventListener('pointermove', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      if (!isDragging && Math.abs(e.clientX - downX) > 8) {
        isDragging = true;
        scrub.classList.add('is-scrubbing');
      }
      if (!isDragging) return;
      var targetIdx = idxFromClientX(e.clientX);
      if (targetIdx !== lastPreviewIdx) {
        lastPreviewIdx = targetIdx;
        goToPortraitChapter(targetIdx);
      }
    });

    function finishScrub(e) {
      if (pointerId === null) return;
      var wasDrag = isDragging;
      if (scrub.releasePointerCapture) {
        try { scrub.releasePointerCapture(pointerId); } catch (err) {}
      }
      pointerId = null;
      isDragging = false;
      scrub.classList.remove('is-scrubbing');
      if (!wasDrag && e.type === 'pointerup') {
        openPortraitAtlas('rooms');
      }
    }

    scrub.addEventListener('pointerup', finishScrub);
    scrub.addEventListener('pointercancel', finishScrub);
  }

  function initThumbRingGestures() {
    var nextBtn = document.getElementById('p-dock-next');
    var picker = document.getElementById('p-ring-picker');
    if (!nextBtn) return;

    var rooms = getRooms();
    if (picker && !picker.children.length) {
      picker.innerHTML = rooms.map(function (r) {
        return '<button type="button" class="p-ring-node" data-room="' + r.idx + '" title="' + r.title + '">' + r.code + '</button>';
      }).join('');
      picker.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.p-ring-node') : null;
        if (!btn) return;
        var targetIdx = parseInt(btn.getAttribute('data-room'), 10);
        if (!isNaN(targetIdx)) goToPortraitChapter(targetIdx);
        picker.classList.remove('is-open');
        picker.setAttribute('aria-hidden', 'true');
      });
    }

    var pointerId = null;
    var downX = 0;
    var holdTimer = 0;
    var pickerOpened = false;
    var suppressClick = false;

    function closePicker() {
      if (!picker) return;
      picker.classList.remove('is-open');
      picker.setAttribute('aria-hidden', 'true');
    }

    function openPicker() {
      if (!picker) return;
      pickerOpened = true;
      suppressClick = true;
      picker.classList.add('is-open');
      picker.setAttribute('aria-hidden', 'false');
    }

    nextBtn.addEventListener('pointerdown', function (e) {
      pointerId = e.pointerId;
      downX = e.clientX;
      pickerOpened = false;
      suppressClick = false;
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(openPicker, 450);
    });

    nextBtn.addEventListener('pointermove', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      if (Math.abs(e.clientX - downX) > 14) {
        window.clearTimeout(holdTimer);
      }
    });

    nextBtn.addEventListener('pointerup', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      window.clearTimeout(holdTimer);
      var dx = e.clientX - downX;
      pointerId = null;
      if (pickerOpened) return;
      if (Math.abs(dx) >= 28) {
        suppressClick = true;
        stepPortraitChapter(dx < 0 ? 1 : -1);
      }
    });

    nextBtn.addEventListener('pointercancel', function () {
      window.clearTimeout(holdTimer);
      pointerId = null;
    });

    nextBtn.addEventListener('click', function (e) {
      if (suppressClick) {
        suppressClick = false;
        e.preventDefault();
        return;
      }
      if (picker && picker.classList.contains('is-open')) {
        closePicker();
        return;
      }
      var curRooms = getRooms();
      if (activeIdx >= curRooms.length - 1) {
        goToPortraitChapter(0);
      } else {
        stepPortraitChapter(1);
      }
    });

    document.addEventListener('pointerdown', function (e) {
      if (picker && picker.classList.contains('is-open')) {
        if (!e.target.closest || !e.target.closest('#p-ring-wrap')) {
          closePicker();
        }
      }
    });
  }

  function isOverlayOpen() {
    if (document.body.classList.contains('is-atlas-open') || document.body.classList.contains('has-lightbox-open')) {
      return true;
    }
    var bio = document.getElementById('p-bio-drawer');
    if (bio && bio.classList.contains('is-open')) return true;
    var crm = document.getElementById('p-crm-reader-modal');
    if (crm && crm.classList.contains('is-open')) return true;
    return false;
  }

  function initChapterGestures() {
    var viewport = document.getElementById('portrait-viewport');
    if (!viewport) return;

    var startX = 0;
    var startY = 0;
    var startTime = 0;
    var blockedByWidget = false;
    var handoffEl = null;
    var startScrollTop = 0;

    viewport.addEventListener('touchstart', function (e) {
      blockedByWidget = false;
      handoffEl = null;
      startY = 0;

      if (isOverlayOpen() || !e.touches || e.touches.length !== 1) {
        blockedByWidget = true;
        return;
      }

      var target = e.target;
      // Req #3: CRM / Long-form Browser container owns vertical scroll strictly;
      // use Next/Prev dock buttons or scroll outside .p-landing-browser to turn rooms.
      if (target && target.closest && target.closest('[data-crm-scroll-lock="true"]')) {
        blockedByWidget = true;
        return;
      }
      handoffEl = target && target.closest ? target.closest('[data-scroll-handoff="true"]') : null;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      startScrollTop = handoffEl ? handoffEl.scrollTop : 0;
    }, { passive: true });

    viewport.addEventListener('touchend', function (e) {
      if (blockedByWidget || !startY || !e.changedTouches || e.changedTouches.length !== 1 || isOverlayOpen()) {
        startY = 0;
        return;
      }

      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var dx = endX - startX;
      var dy = endY - startY;
      var dt = Date.now() - startTime;
      startY = 0;

      if (dt > 850 || Math.abs(dy) < 52 || Math.abs(dy) < Math.abs(dx) * 1.25) {
        return;
      }

      if (handoffEl && handoffEl.scrollHeight > handoffEl.clientHeight + 4) {
        var maxScroll = handoffEl.scrollHeight - handoffEl.clientHeight;
        if (dy > 76 && startScrollTop <= 4 && handoffEl.scrollTop <= 4) {
          stepPortraitChapter(-1);
        } else if (dy < -76 && startScrollTop >= maxScroll - 6 && handoffEl.scrollTop >= maxScroll - 6) {
          stepPortraitChapter(1);
        }
        return;
      }

      stepPortraitChapter(dy < 0 ? 1 : -1);
    }, { passive: true });

    viewport.addEventListener('wheel', function (e) {
      if (isOverlayOpen()) return;
      var now = Date.now();
      if (now < wheelLockUntil) return;
      var target = e.target;
      if (target && target.closest && target.closest('[data-crm-scroll-lock="true"]')) {
        return;
      }
      var handoff = target && target.closest ? target.closest('[data-scroll-handoff="true"]') : null;
      if (handoff && handoff.scrollHeight > handoff.clientHeight + 4) {
        var maxS = handoff.scrollHeight - handoff.clientHeight;
        if (e.deltaY < 0 && handoff.scrollTop > 2) return;
        if (e.deltaY > 0 && handoff.scrollTop < maxS - 4) return;
      }
      if (Math.abs(e.deltaY) < 26 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      wheelLockUntil = now + 520;
      stepPortraitChapter(e.deltaY > 0 ? 1 : -1);
    }, { passive: true });
  }

  function initDrawerDismissGestures() {
    var atlasCard = document.getElementById('p-atlas-card');
    var bioPanel = document.getElementById('p-bio-panel');

    function attachSwipeDown(panel, onClose) {
      if (!panel) return;
      var sy = 0;
      var startScroll = 0;
      panel.addEventListener('touchstart', function (e) {
        sy = (e.touches && e.touches.length === 1) ? e.touches[0].clientY : 0;
        var sc = e.target && e.target.closest ? e.target.closest('.p-atlas-grid, .p-salon-scroll') : null;
        startScroll = sc ? sc.scrollTop : 0;
      }, { passive: true });
      panel.addEventListener('touchend', function (e) {
        if (!sy || !e.changedTouches || !e.changedTouches.length) return;
        if (startScroll <= 2 && e.changedTouches[0].clientY - sy > 70) onClose();
        sy = 0;
      }, { passive: true });
    }

    attachSwipeDown(atlasCard, closePortraitAtlas);
    attachSwipeDown(bioPanel, function () { toggleHeroBioDrawer(false); });
  }

  function resolveInitialHash() {
    var hash = (window.location.hash || '').replace('#', '');
    var rooms = getRooms();
    if (!rooms.length) return;
    if (!hash) {
      goToPortraitChapter(rooms[0].id);
      return;
    }
    if (hash === 'contact') {
      goToPortraitChapter('resume');
      return;
    }
    var resolved = resolveRoomId(hash);
    var found = rooms.findIndex(function (r) { return r.id === resolved; });
    goToPortraitChapter(found !== -1 ? rooms[found].id : rooms[0].id);
  }

  window.goToPortraitChapter = goToPortraitChapter;
  window.scrollToPortraitSector = goToPortraitChapter;
  window.stepPortraitChapter = stepPortraitChapter;
  window.jumpToCommerceModule = jumpToCommerceModule;
  window.jumpToPromoModule = jumpToPromoModule;
  window.openPortraitAtlas = openPortraitAtlas;
  window.openPortraitGallery = openPortraitGallery;
  window.setAtlasTab = setAtlasTab;
  window.scrollAtlasToAct = scrollAtlasToAct;
  window.filterSalonGallery = filterSalonGallery;
  window.openPortraitSalonWork = openPortraitSalonWork;
  window.closePortraitAtlas = closePortraitAtlas;
  window.togglePortraitAtlas = togglePortraitAtlas;
  window.togglePortraitSheet = togglePortraitAtlas;
  window.closePortraitSheet = closePortraitAtlas;
  window.toggleHeroBioDrawer = toggleHeroBioDrawer;
  window.getActivePortraitChapter = function () { return activeIdx; };
  window.syncPortraitActiveVideos = syncActiveVideos;
  window.refreshPortraitNav = function () {
    buildAtlasGrid();
    var rooms = getRooms();
    if (rooms[activeIdx]) updateChromeIndicators(rooms[activeIdx], rooms.length);
  };

  onReady(function () {
    buildAtlasGrid();
    initAtlasEdgeProgress();
    initThumbDockScrub();
    initThumbRingGestures();
    initChapterGestures();
    initDrawerDismissGestures();
    resolveInitialHash();
  });
})();
