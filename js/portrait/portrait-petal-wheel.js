/* ==========================================================================
   REUSABLE CIRCULAR CARD PETAL WHEEL ENGINE
   Powers both:
   1) 04D // Omnichannel Campaign Petal Wheel (12 cards: 1:1 / 9:16 / 16:9)
   2) 07C // Luxury Print Tri-Set Folio Wheel (15 cards: A4 Spread + 2 Folios x 5 brands)
   ========================================================================== */
(function () {
  function wrap180(deg) {
    return ((deg + 180) % 360 + 360) % 360 - 180;
  }

  function getCircleRadius() {
    var w = window.innerWidth || 390;
    if (w >= 900) return 320;
    if (w >= 600) return 265;
    if (w <= 375) return 162;
    return 184;
  }

  function getHeroRadius(smallR) {
    var vw = window.innerWidth || 390;
    if (vw >= 600) {
      return Math.round(smallR * 2.66);
    }
    return Math.max(Math.round(smallR * 2.66), Math.round(vw * 1.26));
  }

  var HERO_ASPECT_RATIOS = {
    '1:1': 1,
    '9:16': 9 / 16,
    '16:9': 16 / 9,
    'SPREAD': Math.SQRT2,
    'FOLIO 1': Math.SQRT1_2,
    'FOLIO 2': Math.SQRT1_2
  };

  function getFocusedCardBox(ratioTag, vw, zoneH) {
    var aspect = HERO_ASPECT_RATIOS[ratioTag] || 1;
    var sidePad = vw >= 600 ? 72 : 28;
    var maxW = Math.min(vw - sidePad, 540);
    var maxH = zoneH > 140 ? Math.max(200, zoneH - 22) : Math.round((window.innerHeight || 844) * 0.56);
    var w = maxW;
    var h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    return {
      w: Math.round(w),
      h: Math.round(h)
    };
  }

  var petalDecodedCache = {};
  function cacheDecodedPetalSrc(src) {
    if (!src) return null;
    if (!petalDecodedCache[src]) {
      var img = new Image();
      img.src = src;
      petalDecodedCache[src] = {
        img: img,
        ready: typeof img.decode === 'function' ? img.decode().catch(function () {}) : Promise.resolve()
      };
    }
    return petalDecodedCache[src];
  }

  function createPetalWheel(cfg) {
    var stepDeg = cfg.stepDeg || 30;
    var maxArc = cfg.maxArc || 88;
    var heroStepDeg = cfg.heroStepDeg || 32;
    var deck = cfg.buildDeck() || [];
    var wheelTheta = 0;
    var angularVel = 0;
    var snapTargetTheta = null;
    var activeIdx = 0;
    var activeRatioFilter = 'all';
    var plateToggle = false;
    var rafId = null;
    var lastTime = 0;
    var isDragging = false;
    var dragMovedPx = 0;
    var wheelSettleTimer = null;
    var hasActivatedOnce = false;
    var captionTimer = null;
    var ambientTimer = null;
    var ambientReqId = 0;
    var ambientRaf = null;
    var lastAmbientSrc = '';
    var cachedBoxVw = 0;
    var cachedBoxZoneH = 0;

    // Preload & pre-decode all ambient images for silk-smooth transitions
    (deck || []).forEach(function (c) {
      if (c && c.src) cacheDecodedPetalSrc(c.src);
    });
    var cachedR = 0;
    var cachedRHero = 0;

    function getEl(id) {
      return id ? document.getElementById(id) : null;
    }

    function renderDom() {
      var ring = getEl(cfg.ringId);
      if (ring && deck.length) {
        // Req #1: Mini petal cards contain pure artwork without distracting title tags
        ring.innerHTML = deck.map(function (card, i) {
          return '<button type="button" class="p-petal-card ' + card.ratioClass + (i === 0 ? ' is-center' : '') + '"' +
            ' data-petal-idx="' + i + '" aria-label="' + card.brandName + ' ' + card.ratioTag + '">' +
            '<img src="' + card.src + '" alt="' + card.brandName + ' ' + card.ratioTag + '" decoding="async">' +
            '</button>';
        }).join('');

        ring.querySelectorAll('.p-petal-card').forEach(function (el) {
          el.addEventListener('click', function () {
            if (dragMovedPx > 8 || Math.abs(angularVel) > 0.6) return;
            spinToIndex(Number(el.getAttribute('data-petal-idx')));
          });
        });
      }

      var heroOrbit = getEl(cfg.heroOrbitId);
      if (heroOrbit && deck.length) {
        // Req #1: Persistent orbiting Hero Card ring along the large tangent circle
        heroOrbit.innerHTML = deck.map(function (card, i) {
          return '<button type="button" class="p-petal-hero-card ' + card.ratioClass + (i === 0 ? ' is-center' : '') + '"' +
            ' data-hero-idx="' + i + '" aria-label="Inspect ' + card.title + ' (' + card.ratioTag + ')">' +
            '<img src="' + card.src + '" alt="' + card.title + ' (' + card.ratioTag + ')" decoding="async">' +
            '<span class="p-petal-hero-zoom" aria-hidden="true">⛶</span>' +
            '</button>';
        }).join('');

        heroOrbit.querySelectorAll('.p-petal-hero-card').forEach(function (el) {
          el.addEventListener('click', function () {
            if (dragMovedPx > 8 || Math.abs(angularVel) > 0.6) return;
            var idx = Number(el.getAttribute('data-hero-idx'));
            if (idx === activeIdx) {
              if (typeof window.openLightboxWithImage === 'function') {
                var item = deck[idx];
                window.openLightboxWithImage(item.nativeSrc, item.title + ' (' + item.ratioTag + ')', cfg.lightboxSub || 'COLLECTION ARCHIVE');
              }
            } else {
              spinToIndex(idx);
            }
          });
        });
      }
    }

    function applyAmbientBackdrop(src) {
      if (!src || src === lastAmbientSrc) return;
      var bgA = getEl(cfg.bgAId);
      var bgB = getEl(cfg.bgBId);
      if (!bgA || !bgB) return;

      lastAmbientSrc = src;
      var reqId = ++ambientReqId;
      if (ambientRaf) {
        window.cancelAnimationFrame(ambientRaf);
        ambientRaf = null;
      }

      var cached = cacheDecodedPetalSrc(src);
      var ready = cached ? cached.ready : Promise.resolve();
      ready.then(function () {
        if (reqId !== ambientReqId) return;
        plateToggle = !plateToggle;
        var incoming = plateToggle ? bgB : bgA;
        var outgoing = plateToggle ? bgA : bgB;

        incoming.style.backgroundImage = "url('" + src.replace(/'/g, "\\'") + "')";
        ambientRaf = window.requestAnimationFrame(function () {
          ambientRaf = window.requestAnimationFrame(function () {
            if (reqId !== ambientReqId) return;
            incoming.classList.add('is-active');
            outgoing.classList.remove('is-active');
            ambientRaf = null;
          });
        });
      });
    }

    function activateCard(idx) {
      if (idx < 0 || idx >= deck.length) return;
      activeIdx = idx;
      var item = deck[idx];

      var pillEl = cfg.metaPillId ? getEl(cfg.metaPillId) : null;
      var ratioEl = getEl(cfg.metaRatioId);
      var titleEl = getEl(cfg.metaTitleId);

      if (!hasActivatedOnce) {
        hasActivatedOnce = true;
        if (ratioEl) ratioEl.textContent = item.ratioBadge;
        if (titleEl) titleEl.textContent = item.title;
        applyAmbientBackdrop(item.src);
      } else {
        var ratioChanged = ratioEl && ratioEl.textContent !== item.ratioBadge;
        var titleChanged = titleEl && titleEl.textContent !== item.title;

        if (ratioChanged || titleChanged) {
          if (captionTimer) {
            window.clearTimeout(captionTimer);
            captionTimer = null;
          }
          if (pillEl) {
            pillEl.classList.add('is-switching');
            captionTimer = window.setTimeout(function () {
              captionTimer = null;
              var curItem = deck[activeIdx] || item;
              if (ratioEl && ratioEl.textContent !== curItem.ratioBadge) {
                ratioEl.textContent = curItem.ratioBadge;
              }
              if (titleEl && titleEl.textContent !== curItem.title) {
                titleEl.textContent = curItem.title;
              }
              pillEl.classList.remove('is-switching');
            }, 95);
          } else {
            if (ratioChanged) ratioEl.textContent = item.ratioBadge;
            if (titleChanged) titleEl.textContent = item.title;
          }
        }

        if (ambientTimer) {
          window.clearTimeout(ambientTimer);
        }
        ambientTimer = window.setTimeout(function () {
          ambientTimer = null;
          var settled = deck[activeIdx];
          if (settled) applyAmbientBackdrop(settled.src);
        }, isDragging ? 160 : 75);
      }

      if (cfg.brandScopeSelector) {
        document.querySelectorAll(cfg.brandScopeSelector).forEach(function (btn) {
          btn.classList.toggle('is-active', btn.getAttribute('data-brand') === item.brandKey);
        });
      }
    }

    function layoutPetals() {
      var ring = getEl(cfg.ringId);
      if (!ring || !deck.length) return;
      var cards = ring.children;
      var heroOrbit = getEl(cfg.heroOrbitId);
      var heroCards = heroOrbit ? heroOrbit.children : null;

      var R = getCircleRadius();
      var R_HERO = getHeroRadius(R);

      var heroZone = getEl(cfg.heroZoneId);
      var boxVw = window.innerWidth || 390;
      var boxZoneH = heroZone ? heroZone.clientHeight : 0;

      if (R !== cachedR) {
        cachedR = R;
        var arcGuide = cfg.arcGuideSelector ? document.querySelector(cfg.arcGuideSelector) : null;
        if (arcGuide) {
          arcGuide.style.width = (R * 2) + 'px';
          arcGuide.style.height = (R * 2) + 'px';
        }
      }

      if (R_HERO !== cachedRHero) {
        cachedRHero = R_HERO;
        var heroArcGuide = heroZone ? heroZone.querySelector('.p-petal-hero-arc-guide') : null;
        if (heroArcGuide) {
          heroArcGuide.style.width = (R_HERO * 2) + 'px';
          heroArcGuide.style.height = (R_HERO * 2) + 'px';
        }
      }

      if (heroCards && heroCards.length && boxZoneH > 0 && (boxVw !== cachedBoxVw || boxZoneH !== cachedBoxZoneH)) {
        cachedBoxVw = boxVw;
        cachedBoxZoneH = boxZoneH;
        for (var b = 0; b < heroCards.length; b++) {
          var box = getFocusedCardBox(deck[b].ratioTag, boxVw, boxZoneH);
          heroCards[b].style.width = box.w + 'px';
          heroCards[b].style.height = box.h + 'px';
        }
      }

      var closestIdx = 0;
      var minAbs = 999;

      for (var i = 0; i < cards.length; i++) {
        var card = deck[i];
        var el = cards[i];
        var angleDeg = wrap180(i * stepDeg + wheelTheta);
        var absA = Math.abs(angleDeg);

        if (absA < minAbs) {
          minAbs = absA;
          closestIdx = i;
        }

        var filterDim = activeRatioFilter !== 'all' && card.ratioTag !== activeRatioFilter;

        // 1) Small Circle Mini Petal Card positioning
        if (absA > maxArc) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          var rad = (angleDeg * Math.PI) / 180;
          var x = R * Math.sin(rad);
          var y = R * (1 - Math.cos(rad));
          var ratioNorm = absA / maxArc;
          var isCenter = absA < (stepDeg * 0.35);
          var scale = isCenter ? 1.18 : (1.0 - ratioNorm * 0.24);
          var opacity = filterDim ? 0.26 : (1.0 - ratioNorm * 0.34);

          el.style.opacity = String(opacity.toFixed(3));
          el.style.pointerEvents = 'auto';
          el.style.zIndex = String(100 - Math.round(absA));
          el.style.transform =
            'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) ' +
            'translate(-50%,-50%) ' +
            'rotate(' + angleDeg.toFixed(2) + 'deg) ' +
            'scale(' + scale.toFixed(3) + ')';

          el.classList.toggle('is-center', isCenter && i === closestIdx);
          el.classList.toggle('is-dimmed', filterDim);
        }

        // 2) Big Circle Hero Card Orbit (tangent above the Small Circle zenith)
        if (heroCards && heroCards[i]) {
          var hEl = heroCards[i];
          var cardSteps = angleDeg / stepDeg; // fractional slots from apex
          var absSteps = Math.abs(cardSteps);

          if (absSteps > 2.15) {
            hEl.style.visibility = 'hidden';
            hEl.style.opacity = '0';
            hEl.style.pointerEvents = 'none';
          } else {
            var heroAngle = cardSteps * heroStepDeg;
            var hRad = (heroAngle * Math.PI) / 180;
            var hx = R_HERO * Math.sin(hRad);
            var hy = R_HERO * (1 - Math.cos(hRad));

            var focusRaw = Math.min(1, Math.max(0, (absSteps - 0.08) / 0.62));
            var offT = focusRaw * focusRaw * (3 - 2 * focusRaw);
            var hScale = 1.0 - offT * 0.35;
            var hOpacity = 1.0 - offT * 0.46;
            if (absSteps > 1.28) {
              hOpacity *= Math.max(0, 1 - (absSteps - 1.28) / 0.85);
            }
            if (filterDim && absSteps > 0.35) hOpacity *= 0.45;
            var isHeroCenter = absSteps < 0.28;

            hEl.style.visibility = 'visible';
            hEl.style.opacity = String(hOpacity.toFixed(3));
            hEl.style.pointerEvents = 'auto';
            hEl.style.zIndex = String(80 - Math.round(absSteps * 20));
            // Anchor card center along Big Circle circumference centered in hero stage
            hEl.style.transform =
              'translate3d(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px,0) ' +
              'translate(-50%, -50%) ' +
              'rotate(' + heroAngle.toFixed(2) + 'deg) ' +
              'scale(' + hScale.toFixed(3) + ')';
            hEl.classList.toggle('is-center', isHeroCenter && i === closestIdx);
            hEl.classList.toggle('is-offcenter', !isHeroCenter);
            hEl.classList.toggle('is-dimmed', filterDim);
          }
        }
      }

      if (closestIdx !== activeIdx) {
        activateCard(closestIdx);
      }
    }

    function computeNearestSnapTarget() {
      var nearestIdx = Math.round(-wheelTheta / stepDeg);
      return nearestIdx * -stepDeg;
    }

    function startAnimationLoop() {
      if (rafId) return;
      lastTime = performance.now();

      function step(now) {
        var dt = Math.min(32, Math.max(8, now - lastTime)) / 16.667;
        lastTime = now;
        var keepGoing = false;

        if (!isDragging) {
          if (Math.abs(angularVel) > 0.14) {
            var damping = Math.abs(angularVel) > 2.2 ? 0.89 : 0.84;
            wheelTheta += angularVel * dt;
            angularVel *= Math.pow(damping, dt);
            snapTargetTheta = null;
            keepGoing = true;
          } else if (snapTargetTheta !== null || Math.abs(wrap180(wheelTheta - computeNearestSnapTarget())) > 0.08) {
            if (snapTargetTheta === null) snapTargetTheta = computeNearestSnapTarget();
            var diff = snapTargetTheta - wheelTheta;
            if (Math.abs(diff) < 0.08) {
              wheelTheta = snapTargetTheta;
              snapTargetTheta = null;
              angularVel = 0;
            } else {
              wheelTheta += diff * Math.min(0.45, 0.22 * dt);
              keepGoing = true;
            }
          }
        }

        layoutPetals();

        if (keepGoing || isDragging) {
          rafId = window.requestAnimationFrame(step);
        } else {
          rafId = null;
        }
      }

      rafId = window.requestAnimationFrame(step);
    }

    function spinToIndex(targetIdx) {
      if (!deck.length) return;
      var currentModIdx = ((activeIdx % deck.length) + deck.length) % deck.length;
      var diffSteps = targetIdx - currentModIdx;
      if (diffSteps > deck.length / 2) diffSteps -= deck.length;
      if (diffSteps < -deck.length / 2) diffSteps += deck.length;

      var snappedNow = computeNearestSnapTarget();
      snapTargetTheta = snappedNow - diffSteps * stepDeg;
      angularVel = 0;
      startAnimationLoop();
    }

    function attachGestures() {
      var wheelDock = getEl(cfg.dockId);
      var heroZone = getEl(cfg.heroZoneId);

      function bindDrag(el) {
        if (!el) return;
        var sx = 0;
        var sy = 0;
        var lastX = 0;
        var lastTs = 0;
        var smoothedSpeed = 0;
        var locked = false;
        var rejected = false;
        var pointerActive = false;

        el.addEventListener('pointerdown', function (e) {
          pointerActive = true;
          dragMovedPx = 0;
          locked = false;
          rejected = false;
          sx = lastX = e.clientX;
          sy = e.clientY;
          lastTs = performance.now();
          smoothedSpeed = 0;
          angularVel = 0;
          snapTargetTheta = null;
        });

        el.addEventListener('pointermove', function (e) {
          if (!pointerActive || rejected) return;
          var dx = e.clientX - lastX;
          var totalDx = e.clientX - sx;
          var totalDy = e.clientY - sy;
          dragMovedPx = Math.max(dragMovedPx, Math.abs(totalDx));

          if (!locked) {
            if (Math.abs(totalDx) < 8 && Math.abs(totalDy) < 8) return;
            if (Math.abs(totalDx) >= Math.abs(totalDy)) {
              locked = true;
              isDragging = true;
              lastX = e.clientX;
              lastTs = performance.now();
              startAnimationLoop();
              return;
            } else {
              // Vertical drag -> yield cleanly to chapter vertical navigation
              rejected = true;
              pointerActive = false;
              return;
            }
          }

          if (isDragging) {
            var now = performance.now();
            var dt = Math.max(4, now - lastTs);
            var instSpeed = Math.abs(dx) / dt;
            smoothedSpeed = smoothedSpeed * 0.65 + instSpeed * 0.35;
            // Velocity-reactive lower sensitivity: calm precision at slow drags, responsive glide on fast flicks
            var speedRatio = Math.min(1, smoothedSpeed / 1.85);
            var dynamicGain = 0.085 + speedRatio * 0.13;
            var degDelta = dx * dynamicGain;
            wheelTheta += degDelta;
            var rawVel = (degDelta / dt) * 16.667;
            angularVel = Math.max(-6.5, Math.min(6.5, angularVel * 0.4 + rawVel * 0.6));
            lastX = e.clientX;
            lastTs = now;
          }
        });

        function endDrag() {
          pointerActive = false;
          sx = 0;
          smoothedSpeed = 0;
          if (isDragging) {
            isDragging = false;
            if (Math.abs(angularVel) < 0.38) {
              angularVel = 0;
              snapTargetTheta = computeNearestSnapTarget();
            }
            startAnimationLoop();
          }
          window.setTimeout(function () { dragMovedPx = 0; }, 40);
        }

        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);
      }

      bindDrag(wheelDock);
      bindDrag(heroZone);

      if (wheelDock) {
        wheelDock.addEventListener('wheel', function (e) {
          // Vertical wheel turns chapters per Req #3; horizontal trackpad spins the petal wheel
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
          e.preventDefault();
          wheelTheta -= e.deltaX * 0.11;
          snapTargetTheta = null;
          startAnimationLoop();
          window.clearTimeout(wheelSettleTimer);
          wheelSettleTimer = window.setTimeout(function () {
            snapTargetTheta = computeNearestSnapTarget();
            startAnimationLoop();
          }, 120);
        }, { passive: false });
      }
    }

    function init() {
      renderDom();
      layoutPetals();
      activateCard(0);
      attachGestures();
    }

    return {
      init: init,
      refreshLayout: layoutPetals,
      filterRatio: function (ratioTag, btn) {
        activeRatioFilter = ratioTag;
        if (cfg.filterScopeSelector) {
          document.querySelectorAll(cfg.filterScopeSelector).forEach(function (b) {
            b.classList.toggle('is-active', b === btn || b.getAttribute('data-ratio') === ratioTag);
          });
        }
        if (ratioTag !== 'all' && deck[activeIdx] && deck[activeIdx].ratioTag !== ratioTag) {
          var currentBrand = deck[activeIdx].brandKey;
          var twin = deck.find(function (c) { return c.brandKey === currentBrand && c.ratioTag === ratioTag; });
          if (twin) spinToIndex(twin.idx);
        }
        layoutPetals();
      },
      jumpBrand: function (brandKey) {
        if (!deck.length) return;
        var current = deck[activeIdx];
        var targetRatio = activeRatioFilter !== 'all' ? activeRatioFilter : (current ? current.ratioTag : 'all');
        var match = deck.find(function (c) { return c.brandKey === brandKey && c.ratioTag === targetRatio; }) ||
          deck.find(function (c) { return c.brandKey === brandKey; });
        if (match) spinToIndex(match.idx);
      },
      openLightbox: function () {
        var item = deck[activeIdx];
        if (!item || typeof window.openLightboxWithImage !== 'function') return;
        window.openLightboxWithImage(item.nativeSrc, item.title + ' (' + item.ratioTag + ')', cfg.lightboxSub || 'COLLECTION ARCHIVE');
      }
    };
  }

  function bootstrapWheels() {
    // 1. Sector 04D: Omnichannel Campaign Petal Wheel (12 Cards)
    var omniWheel = createPetalWheel({
      stepDeg: 30,
      heroStepDeg: 41.5,
      maxArc: 88,
      dockId: 'p-petal-wheel-dock',
      ringId: 'p-petal-ring',
      heroZoneId: 'p-petal-hero-zone',
      heroOrbitId: 'p-petal-hero-orbit',
      metaPillId: 'p-petal-meta-pill',
      metaRatioId: 'p-petal-meta-ratio',
      metaTitleId: 'p-petal-meta-brand',
      bgAId: 'p-petal-bg-a',
      bgBId: 'p-petal-bg-b',
      arcGuideSelector: '#p-petal-wheel-dock .p-petal-arc-guide',
      filterScopeSelector: '#ecommerce-petals .p-filter-pill, #p-ecom-petal .p-filter-pill',
      brandScopeSelector: '#ecommerce-petals .p-brand-dot, #p-ecom-petal .p-brand-dot',
      lightboxSub: 'OMNICHANNEL DEPLOYMENT',
      buildDeck: function () {
        var campaigns = window.socialCampaigns || {};
        var brands = [
          { key: 'taylormade', label: 'TaylorMade' },
          { key: 'mclaren', label: 'McLaren' },
          { key: 'puma', label: 'PUMA' },
          { key: 'flash', label: 'Flash Deals' }
        ];
        var ratios = [
          { key: 'ratio_1_1', nativeKey: 'ratio_1_1_native', tag: '1:1', cssClass: 'is-1-1', badge: '1:1 FEED' },
          { key: 'ratio_9_16', nativeKey: 'ratio_9_16_native', tag: '9:16', cssClass: 'is-9-16', badge: '9:16 STORY' },
          { key: 'ratio_16_9', nativeKey: 'ratio_16_9_native', tag: '16:9', cssClass: 'is-16-9', badge: '16:9 WIDE' }
        ];
        var list = [];
        brands.forEach(function (b) {
          var d = campaigns[b.key];
          if (!d) return;
          ratios.forEach(function (r) {
            list.push({
              idx: list.length,
              brandKey: b.key,
              brandName: b.label,
              title: d.title,
              ratioTag: r.tag,
              ratioClass: r.cssClass,
              ratioBadge: r.badge,
              src: d[r.key],
              nativeSrc: d[r.nativeKey] || d[r.key]
            });
          });
        });
        return list;
      }
    });

    // 2. Sector 07C: Luxury Print Tri-Set Folio Petal Wheel (15 Cards across 5 Brands)
    var trisetWheel = createPetalWheel({
      stepDeg: 24,
      heroStepDeg: 44,
      maxArc: 88,
      dockId: 'p-triset-wheel-dock',
      ringId: 'p-triset-ring',
      heroZoneId: 'p-triset-hero-zone',
      heroOrbitId: 'p-triset-hero-orbit',
      metaPillId: 'p-triset-meta-pill',
      metaRatioId: 'p-triset-meta-ratio',
      metaTitleId: 'p-triset-meta-brand',
      bgAId: 'p-triset-bg-a',
      bgBId: 'p-triset-bg-b',
      arcGuideSelector: '#p-triset-wheel-dock .p-petal-arc-guide',
      filterScopeSelector: '#section-trisets .p-filter-pill, #p-promo-trisets .p-filter-pill',
      brandScopeSelector: '#section-trisets .p-brand-dot, #p-promo-trisets .p-brand-dot',
      lightboxSub: 'LUXURY PRINT FOLIO',
      buildDeck: function () {
        var sets = window.triSets || {};
        var brands = [
          { key: 'gfore', label: 'G/FORE' },
          { key: 'greyson', label: 'Greyson' },
          { key: 'nike', label: 'Nike Golf' },
          { key: 'galvingreen', label: 'Galvin Green' },
          { key: 'jlindeberg', label: 'J.Lindeberg' }
        ];
        var forms = [
          { idx: 0, tag: 'SPREAD', cssClass: 'is-a4-land', badge: 'A4 SPREAD' },
          { idx: 1, tag: 'FOLIO 1', cssClass: 'is-a4-port', badge: 'FOLIO 01' },
          { idx: 2, tag: 'FOLIO 2', cssClass: 'is-a4-port', badge: 'FOLIO 02' }
        ];
        var list = [];
        brands.forEach(function (b) {
          var arr = sets[b.key];
          if (!arr) return;
          forms.forEach(function (f) {
            var item = arr[f.idx];
            if (!item) return;
            list.push({
              idx: list.length,
              brandKey: b.key,
              brandName: b.label,
              title: item.label,
              ratioTag: f.tag,
              ratioClass: f.cssClass,
              ratioBadge: f.badge,
              src: item.file,
              nativeSrc: item.native || item.file
            });
          });
        });
        return list;
      }
    });

    omniWheel.init();
    trisetWheel.init();

    window.petalWheelFilter = omniWheel.filterRatio;
    window.petalWheelJumpBrand = omniWheel.jumpBrand;
    window.petalWheelOpenLightbox = omniWheel.openLightbox;
    window.petalWheelRefreshLayout = omniWheel.refreshLayout;

    window.trisetWheelFilter = trisetWheel.filterRatio;
    window.trisetWheelJumpBrand = trisetWheel.jumpBrand;
    window.trisetWheelOpenLightbox = trisetWheel.openLightbox;
    window.trisetWheelRefreshLayout = trisetWheel.refreshLayout;

    window.addEventListener('resize', function () {
      omniWheel.refreshLayout();
      trisetWheel.refreshLayout();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapWheels);
  } else {
    bootstrapWheels();
  }
})();
