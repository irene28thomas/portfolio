/* ==========================================================================
   ARCHITECTURAL PENCIL & BRUSH SKETCH SPLASH ENGINE
   Procedurally maps to live Room 01 DOM coordinates so hand-drawn graphite
   construction lines, cross-hatching, outlined typography, and terracotta
   brush washes dissolve 1:1 into the interactive portfolio via watercolor bloom.
   ========================================================================== */
(function () {
  var TOTAL_DURATION_MS = 2350;
  var BLOOM_START = 0.76;

  function clamp01(v) {
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }

  function easeOutCubic(t) {
    var inv = 1 - clamp01(t);
    return 1 - inv * inv * inv;
  }

  function easeInOutCubic(t) {
    t = clamp01(t);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function hashSeed(n) {
    var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function createPaperCanvas(w, h, dpr) {
    var tile = document.createElement('canvas');
    tile.width = 96;
    tile.height = 96;
    var tctx = tile.getContext('2d');
    tctx.fillStyle = '#F4EFE6';
    tctx.fillRect(0, 0, 96, 96);

    for (var i = 0; i < 420; i++) {
      var sx = hashSeed(i * 1.13) * 96;
      var sy = hashSeed(i * 2.71 + 17) * 96;
      var isWarm = hashSeed(i * 3.31) > 0.52;
      tctx.fillStyle = isWarm ? 'rgba(182, 162, 134, 0.085)' : 'rgba(24, 23, 22, 0.032)';
      tctx.fillRect(sx, sy, 1.2, 1.2);
    }

    tctx.strokeStyle = 'rgba(165, 145, 118, 0.045)';
    tctx.lineWidth = 0.7;
    for (var f = 0; f < 14; f++) {
      var fx = hashSeed(f * 5.9 + 3) * 96;
      var fy = hashSeed(f * 7.3 + 11) * 96;
      tctx.beginPath();
      tctx.moveTo(fx, fy);
      tctx.lineTo(fx + (hashSeed(f * 9.1) - 0.5) * 16, fy + (hashSeed(f * 4.7) - 0.5) * 10);
      tctx.stroke();
    }

    var paper = document.createElement('canvas');
    paper.width = Math.max(1, Math.round(w * dpr));
    paper.height = Math.max(1, Math.round(h * dpr));
    var pctx = paper.getContext('2d');
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var pat = pctx.createPattern(tile, 'repeat');
    pctx.fillStyle = pat || '#F4EFE6';
    pctx.fillRect(0, 0, w, h);

    // Subtle paper vignette warmth around the edges
    var vig = pctx.createRadialGradient(w * 0.5, h * 0.36, w * 0.18, w * 0.5, h * 0.45, Math.max(w, h) * 0.85);
    vig.addColorStop(0, 'rgba(255, 252, 246, 0.24)');
    vig.addColorStop(1, 'rgba(222, 209, 188, 0.28)');
    pctx.fillStyle = vig;
    pctx.fillRect(0, 0, w, h);

    return paper;
  }

  /**
   * Draws a progressive organic graphite line between two points.
   * Returns current active nib position + slope angle when drawing in progress.
   */
  function drawHandLine(ctx, x1, y1, x2, y2, seed, progress, opts) {
    progress = clamp01(progress);
    if (progress <= 0) return null;
    opts = opts || {};

    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.hypot(dx, dy);
    if (len < 0.5) return { x: x2, y: y2, angle: 0 };

    var overrun = opts.overrun || 0;
    var ux = dx / len;
    var uy = dy / len;
    var sx = x1 - ux * overrun;
    var sy = y1 - uy * overrun;
    var ex = x2 + ux * overrun;
    var ey = y2 + uy * overrun;

    var curX = sx + (ex - sx) * progress;
    var curY = sy + (ey - sy) * progress;

    // Slight orthogonal bow for natural wrist motion
    var bow = (hashSeed(seed) - 0.5) * (opts.bow !== undefined ? opts.bow : 1.6);
    var nx = -uy;
    var ny = ux;
    var mx = (sx + curX) * 0.5 + nx * bow * progress;
    var my = (sy + curY) * 0.5 + ny * bow * progress;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = opts.color || 'rgba(34, 31, 28, 0.72)';
    ctx.lineWidth = opts.width || 1.05;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(mx, my, curX, curY);
    ctx.stroke();

    // Optional faint 2H double-sketch pass
    if (opts.doublePass) {
      var off = (hashSeed(seed + 9) - 0.5) * 1.4;
      ctx.strokeStyle = opts.ghostColor || 'rgba(34, 31, 28, 0.24)';
      ctx.lineWidth = (opts.width || 1.05) * 0.65;
      ctx.beginPath();
      ctx.moveTo(sx + nx * off, sy + ny * off);
      ctx.quadraticCurveTo(mx - nx * off, my - ny * off, curX + nx * 0.5, curY + ny * 0.5);
      ctx.stroke();
    }
    ctx.restore();

    return { x: curX, y: curY, angle: Math.atan2(dy, dx) };
  }

  /**
   * Draws an organic clockwise drafted rectangle with extended corner ticks.
   */
  function drawHandRect(ctx, r, seed, progress, opts) {
    progress = clamp01(progress);
    if (progress <= 0) return null;
    opts = opts || {};

    var edges = [
      [r.left, r.top, r.right, r.top],
      [r.right, r.top, r.right, r.bottom],
      [r.right, r.bottom, r.left, r.bottom],
      [r.left, r.bottom, r.left, r.top]
    ];

    var seg = progress * 4;
    var lastPos = null;
    for (var i = 0; i < 4; i++) {
      var localP = clamp01(seg - i);
      if (localP > 0) {
        lastPos = drawHandLine(ctx, edges[i][0], edges[i][1], edges[i][2], edges[i][3], seed + i * 3.1, localP, opts);
      }
    }
    return lastPos;
  }

  /**
   * Draws an expressive multi-bristle terracotta watercolor/gouache swipe.
   */
  function drawBrushStroke(ctx, x1, y1, x2, y2, thickness, color, seed, progress) {
    progress = clamp01(progress);
    if (progress <= 0) return null;

    var curX = x1 + (x2 - x1) * progress;
    var curY = y1 + (y2 - y1) * progress;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var bristles = 6;
    for (var b = 0; b < bristles; b++) {
      var ratio = (b / (bristles - 1)) - 0.5;
      var offset = ratio * thickness * 0.72;
      var jitter = (hashSeed(seed + b * 2.3) - 0.5) * 3.2;
      var bx1 = x1 + nx * offset;
      var by1 = y1 + ny * offset;
      var bx2 = curX + nx * (offset + jitter * 0.4);
      var by2 = curY + ny * (offset + jitter * 0.4);
      var mx = (bx1 + bx2) * 0.5 + nx * jitter;
      var my = (by1 + by2) * 0.5 + ny * jitter;

      ctx.globalAlpha = 0.14 + (1 - Math.abs(ratio)) * 0.14;
      ctx.strokeStyle = color;
      ctx.lineWidth = (thickness / bristles) * (1.25 - Math.abs(ratio) * 0.45);
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.quadraticCurveTo(mx, my, bx2, by2);
      ctx.stroke();
    }
    ctx.restore();

    return { x: curX, y: curY, angle: Math.atan2(dy, dx) };
  }

  /**
   * Draws subtle gouache/ink brush splatters near the end of an expressive swipe.
   */
  function drawBrushSplatter(ctx, x, y, color, seed, progress, count) {
    progress = clamp01(progress);
    if (progress <= 0) return;
    ctx.save();
    var total = count || 5;
    for (var i = 0; i < total; i++) {
      var appear = clamp01((progress - i * 0.14) * 3.5);
      if (appear <= 0) continue;
      var ang = hashSeed(seed + i * 3.7) * Math.PI * 2;
      var dist = 4 + hashSeed(seed + i * 5.1) * 18;
      var radius = (0.7 + hashSeed(seed + i * 7.3) * 1.45) * appear;
      ctx.globalAlpha = 0.24 * appear;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draws an organic hand-sketched circle/arc (great for dials and lens buttons).
   */
  function drawHandCircle(ctx, cx, cy, r, seed, progress, opts) {
    progress = clamp01(progress);
    if (progress <= 0 || r <= 0) return;
    opts = opts || {};
    var startAngle = -Math.PI * 0.65;
    var sweep = Math.PI * 2.06 * progress;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = opts.color || 'rgba(24, 23, 22, 0.5)';
    ctx.lineWidth = opts.width || 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
    ctx.stroke();
    if (opts.doublePass && progress > 0.35) {
      ctx.strokeStyle = opts.ghostColor || 'rgba(24, 23, 22, 0.2)';
      ctx.lineWidth = (opts.width || 1.0) * 0.65;
      ctx.beginPath();
      ctx.arc(cx + 0.6, cy - 0.5, r + 0.4, startAngle + 0.12, startAngle + sweep * 0.96);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draws an organic rounded capsule border with delicate hand wobble.
   */
  function drawHandCapsule(ctx, rect, radius, progress, opts) {
    progress = clamp01(progress);
    if (progress <= 0) return;
    opts = opts || {};
    var rad = Math.min(radius, rect.width * 0.5, rect.height * 0.5);
    ctx.save();
    ctx.globalAlpha = progress * (opts.alpha !== undefined ? opts.alpha : 1);
    ctx.strokeStyle = opts.color || 'rgba(24, 23, 22, 0.36)';
    ctx.lineWidth = opts.width || 0.95;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(rect.left, rect.top, rect.width, rect.height, rad);
    } else {
      ctx.rect(rect.left, rect.top, rect.width, rect.height);
    }
    ctx.stroke();
    ctx.restore();
  }

  function getAncestorTransformScale(el) {
    var scale = 1;
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body) {
      var tr = window.getComputedStyle(cur).transform;
      if (tr && tr !== 'none' && tr.indexOf('matrix(') === 0) {
        var parts = tr.slice(7, -1).split(',');
        if (parts.length >= 2) {
          var a = parseFloat(parts[0]);
          var b = parseFloat(parts[1]);
          var s = Math.hypot(a, b);
          if (isFinite(s) && s > 0.1) scale *= s;
        }
      }
      cur = cur.parentElement;
    }
    return scale;
  }

  function measureWordBaseline(wordEl, ctx) {
    if (!wordEl) return null;
    var rawText = wordEl.textContent || '';
    var text = rawText.trim();
    if (!text) return null;

    var textNode = null;
    for (var n = 0; n < wordEl.childNodes.length; n++) {
      if (wordEl.childNodes[n].nodeType === 3 && wordEl.childNodes[n].nodeValue.trim().length > 0) {
        textNode = wordEl.childNodes[n];
        break;
      }
    }

    var glyphRect = wordEl.getBoundingClientRect();
    try {
      if (textNode) {
        var wholeRange = document.createRange();
        wholeRange.selectNodeContents(textNode);
        var wRect = wholeRange.getBoundingClientRect();
        if (wRect && wRect.width > 0 && wRect.height > 0) glyphRect = wRect;
      }
    } catch (e) {}

    var cs = window.getComputedStyle(wordEl);
    var scale = getAncestorTransformScale(wordEl);
    var fontSizePx = (parseFloat(cs.fontSize) || 32) * scale;
    var fontSpec = (cs.fontStyle || 'normal') + ' ' + (cs.fontWeight || '700') + ' ' + fontSizePx.toFixed(2) + 'px ' + (cs.fontFamily || 'sans-serif');

    ctx.save();
    ctx.font = fontSpec;
    var metrics = ctx.measureText(text);
    var asc = metrics.actualBoundingBoxAscent !== undefined ? metrics.actualBoundingBoxAscent : glyphRect.height * 0.76;
    var desc = metrics.actualBoundingBoxDescent !== undefined ? metrics.actualBoundingBoxDescent : glyphRect.height * 0.18;
    var baselineY = glyphRect.top + glyphRect.height * 0.5 + (asc - desc) * 0.5;

    var chars = [];
    if (textNode) {
      var nodeStr = textNode.nodeValue || '';
      for (var ci = 0; ci < nodeStr.length; ci++) {
        var ch = nodeStr[ci];
        if (!ch || ch === '\n' || ch === '\r') continue;
        try {
          var cr = document.createRange();
          cr.setStart(textNode, ci);
          cr.setEnd(textNode, ci + 1);
          var cRect = cr.getBoundingClientRect();
          if (cRect && cRect.width > 0) {
            var cm = ctx.measureText(ch);
            var lb = cm.actualBoundingBoxLeft !== undefined ? cm.actualBoundingBoxLeft : 0;
            chars.push({
              ch: ch,
              left: cRect.left,
              right: cRect.right,
              width: cRect.width,
              drawX: cRect.left + lb
            });
          }
        } catch (e) {}
      }
    }
    ctx.restore();

    var leftBearing = metrics.actualBoundingBoxLeft !== undefined ? metrics.actualBoundingBoxLeft : 0;

    return {
      text: text,
      rect: glyphRect,
      fontSpec: fontSpec,
      drawX: glyphRect.left + leftBearing,
      baselineY: baselineY,
      chars: chars
    };
  }

  function measureTargets(ctx) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var hud = document.getElementById('p-hud');
    var hudBrandIcon = document.querySelector('.p-hud-mark');
    var hudMark = document.querySelector('.p-hud-wordmark');
    var hudCounter = document.querySelector('.p-hud-viewfinder-badge');
    var hudRecDot = document.querySelector('.p-hud-rec-dot');
    var hudIndex = document.getElementById('p-hud-atlas-btn');
    var ticks = document.getElementById('p-chapter-ticks');
    var tickEls = [];
    document.querySelectorAll('#p-chapter-ticks .p-tick').forEach(function (tk) {
      var tr = tk.getBoundingClientRect();
      if (tr.width > 1) tickEls.push(tr);
    });

    var folio = document.querySelector('.p-cover-folio');
    var folioTitle = document.querySelector('.p-cover-folio > span');
    var folioWorks = document.querySelector('.p-cover-folio-works');
    var win = document.getElementById('p-cover-window');
    var dock = document.getElementById('p-thumb-dock');
    var dockPrev = document.getElementById('p-dock-prev');
    var dockNext = document.getElementById('p-dock-next');

    var wordSelectors = [
      { sel: '.p-cover-word-visual', accent: false },
      { sel: '.p-cover-word-systems', accent: true },
      { sel: '.p-cover-word-that', accent: false },
      { sel: '.p-cover-word-move', accent: true },
      { sel: '.p-cover-line.is-commerce-row em', accent: true }
    ];

    var words = [];
    wordSelectors.forEach(function (entry) {
      var el = document.querySelector(entry.sel);
      var m = measureWordBaseline(el, ctx);
      if (m) {
        m.accent = entry.accent;
        words.push(m);
      }
    });

    var bioLines = [];
    document.querySelectorAll('.p-cover-bio-line').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width > 4 && r.height > 2) {
        bioLines.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
      }
    });

    var guideRows = [];
    document.querySelectorAll('.p-cover-guide-row').forEach(function (row) {
      var r = row.getBoundingClientRect();
      if (r.top < vh - 26 && r.bottom > 0) {
        var thumb = row.querySelector('.p-guide-thumb');
        var num = row.querySelector('.p-guide-num');
        var name = row.querySelector('.p-guide-name');
        var dots = row.querySelector('.p-guide-dots');
        var count = row.querySelector('.p-guide-count');
        guideRows.push({
          rect: r,
          thumb: thumb ? thumb.getBoundingClientRect() : null,
          num: num ? num.getBoundingClientRect() : null,
          name: name ? name.getBoundingClientRect() : null,
          dots: dots ? dots.getBoundingClientRect() : null,
          count: count ? count.getBoundingClientRect() : null
        });
      }
    });

    var padX = Math.max(16, Math.round(vw * 0.05));
    if (folio) {
      var fr = folio.getBoundingClientRect();
      if (fr.width > 100) padX = fr.left;
    }

    return {
      vw: vw,
      vh: vh,
      padX: padX,
      hud: hud ? hud.getBoundingClientRect() : null,
      hudBrandIcon: hudBrandIcon ? hudBrandIcon.getBoundingClientRect() : null,
      hudMark: hudMark ? hudMark.getBoundingClientRect() : null,
      hudCounter: hudCounter ? hudCounter.getBoundingClientRect() : null,
      hudRecDot: hudRecDot ? hudRecDot.getBoundingClientRect() : null,
      hudIndex: hudIndex ? hudIndex.getBoundingClientRect() : null,
      ticks: ticks ? ticks.getBoundingClientRect() : null,
      tickEls: tickEls,
      folio: folio ? folio.getBoundingClientRect() : null,
      folioTitle: folioTitle ? folioTitle.getBoundingClientRect() : null,
      folioWorks: folioWorks ? folioWorks.getBoundingClientRect() : null,
      words: words,
      win: win ? win.getBoundingClientRect() : {
        left: vw * 0.49,
        top: 168,
        right: vw - padX,
        bottom: 262,
        width: vw * 0.46,
        height: 94
      },
      bioLines: bioLines,
      guideRows: guideRows,
      dock: dock ? dock.getBoundingClientRect() : null,
      dockPrev: dockPrev ? dockPrev.getBoundingClientRect() : null,
      dockNext: dockNext ? dockNext.getBoundingClientRect() : null
    };
  }

  function drawSketchTextWord(ctx, wordSpec, progress, seed) {
    progress = clamp01(progress);
    if (progress <= 0) return null;

    var r = wordSpec.rect;
    var clipW = r.width * progress;

    ctx.save();
    ctx.beginPath();
    ctx.rect(r.left - 8, r.top - 10, clipW + 12, r.height + 20);
    ctx.clip();

    ctx.font = wordSpec.fontSpec;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    var fillCol = wordSpec.accent ? 'rgba(216, 78, 41, 0.14)' : 'rgba(24, 23, 22, 0.10)';
    var primaryStroke = wordSpec.accent ? 'rgba(155, 52, 24, 0.85)' : 'rgba(24, 23, 22, 0.84)';
    var secondaryStroke = wordSpec.accent ? 'rgba(216, 78, 41, 0.35)' : 'rgba(24, 23, 22, 0.28)';

    if (wordSpec.chars && wordSpec.chars.length > 0) {
      for (var ci = 0; ci < wordSpec.chars.length; ci++) {
        var c = wordSpec.chars[ci];
        ctx.fillStyle = fillCol;
        ctx.fillText(c.ch, c.drawX, wordSpec.baselineY);
        ctx.strokeStyle = primaryStroke;
        ctx.lineWidth = 1.05;
        ctx.strokeText(c.ch, c.drawX, wordSpec.baselineY);
        ctx.strokeStyle = secondaryStroke;
        ctx.lineWidth = 0.65;
        ctx.strokeText(c.ch, c.drawX + 0.65, wordSpec.baselineY - 0.45);
      }
    } else {
      ctx.fillStyle = fillCol;
      ctx.fillText(wordSpec.text, wordSpec.drawX, wordSpec.baselineY);
      ctx.strokeStyle = primaryStroke;
      ctx.lineWidth = 1.05;
      ctx.strokeText(wordSpec.text, wordSpec.drawX, wordSpec.baselineY);
      ctx.strokeStyle = secondaryStroke;
      ctx.lineWidth = 0.65;
      ctx.strokeText(wordSpec.text, wordSpec.drawX + 0.65, wordSpec.baselineY - 0.45);
    }

    ctx.restore();

    // Up-and-down nib motion mimicking calligraphy letter tracing
    var charWaves = Math.max(3, wordSpec.text.length * 0.9);
    var nibX = r.left + clipW;
    var nibY = r.top + r.height * 0.56 + Math.sin(progress * Math.PI * charWaves) * (r.height * 0.24);
    return { x: nibX, y: nibY, angle: Math.cos(progress * Math.PI * charWaves) * 0.18 };
  }

  function renderSketchScene(ctx, paperCanvas, targets, t) {
    var vw = targets.vw;
    var vh = targets.vh;
    ctx.clearRect(0, 0, vw, vh);
    ctx.drawImage(paperCanvas, 0, 0, vw, vh);

    var toolState = {
      visible: true,
      isBrush: false,
      x: targets.padX,
      y: 90,
      angle: 0
    };

    // ------------------------------------------------------------------
    // PHASE 1 (0.00 -> 0.14): Architectural Margins, Crop Marks & Folio Rule
    // ------------------------------------------------------------------
    var p1 = easeOutCubic(t / 0.14);
    if (p1 > 0) {
      var mLeft = targets.padX;
      var mRight = vw - targets.padX;
      var pos1;

      // Vertical drafting margin guides
      pos1 = drawHandLine(ctx, mLeft, 18, mLeft, vh - 24, 1.1, p1, {
        color: 'rgba(24, 23, 22, 0.13)',
        width: 0.75,
        bow: 0.4
      });
      drawHandLine(ctx, mRight, 18, mRight, vh - 24, 2.2, p1, {
        color: 'rgba(24, 23, 22, 0.13)',
        width: 0.75,
        bow: 0.4
      });

      // 4 corner camera crop marks (clear of mobile safe edges)
      var cm = 14;
      var by = vh - 22;
      drawHandLine(ctx, 14, 20, 14 + cm, 20, 3.1, p1, { color: 'rgba(24,23,22,0.54)', width: 1.1 });
      drawHandLine(ctx, 14, 20, 14, 20 + cm, 3.2, p1, { color: 'rgba(24,23,22,0.54)', width: 1.1 });
      drawHandLine(ctx, vw - 14, 20, vw - 14 - cm, 20, 3.3, p1, { color: 'rgba(24,23,22,0.54)', width: 1.1 });
      drawHandLine(ctx, vw - 14, 20, vw - 14, 20 + cm, 3.4, p1, { color: 'rgba(24,23,22,0.54)', width: 1.1 });
      drawHandLine(ctx, 14, by, 14 + cm, by, 3.5, p1, { color: 'rgba(24,23,22,0.42)', width: 1.0 });
      drawHandLine(ctx, 14, by, 14, by - cm, 3.6, p1, { color: 'rgba(24,23,22,0.42)', width: 1.0 });
      drawHandLine(ctx, vw - 14, by, vw - 14 - cm, by, 3.7, p1, { color: 'rgba(24,23,22,0.42)', width: 1.0 });
      drawHandLine(ctx, vw - 14, by, vw - 14, by - cm, 3.8, p1, { color: 'rgba(24,23,22,0.42)', width: 1.0 });

      // Viewfinder 12-tick exposure ruler dashes across header
      if (targets.tickEls && targets.tickEls.length > 0 && p1 > 0.25) {
        var tickP = clamp01((p1 - 0.25) / 0.75);
        for (var ti = 0; ti < targets.tickEls.length; ti++) {
          var tr = targets.tickEls[ti];
          var ltp = clamp01(tickP * targets.tickEls.length - ti);
          if (ltp > 0) {
            var ty = tr.top + tr.height * 0.5;
            drawHandLine(ctx, tr.left, ty, tr.right, ty, 5 + ti * 0.6, ltp, {
              color: ti === 0 ? 'rgba(216, 78, 41, 0.72)' : 'rgba(24, 23, 22, 0.24)',
              width: ti === 0 ? 1.5 : 0.9,
              bow: 0.2
            });
          }
        }
      }

      // Folio horizontal rule + sketchy label bars
      if (targets.folio) {
        pos1 = drawHandLine(ctx, targets.folio.left, targets.folio.bottom, targets.folio.right, targets.folio.bottom, 4.1, p1, {
          color: 'rgba(24, 23, 22, 0.42)',
          width: 0.9,
          overrun: 6
        });
        if (targets.folioTitle && p1 > 0.45) {
          var ft = targets.folioTitle;
          drawHandLine(ctx, ft.left, ft.top + ft.height * 0.52, ft.right, ft.top + ft.height * 0.52, 4.4, clamp01((p1 - 0.45) * 2), {
            color: 'rgba(24, 23, 22, 0.34)',
            width: 1.2,
            bow: 0.5
          });
        }
        if (targets.folioWorks && p1 > 0.6) {
          var fw = targets.folioWorks;
          drawHandLine(ctx, fw.left, fw.top + fw.height * 0.52, fw.right, fw.top + fw.height * 0.52, 4.7, clamp01((p1 - 0.6) * 2.5), {
            color: 'rgba(216, 78, 41, 0.62)',
            width: 1.25,
            bow: 0.4
          });
        }
      }

      if (t <= 0.14 && pos1) {
        toolState.x = pos1.x;
        toolState.y = pos1.y;
      }
    }

    // ------------------------------------------------------------------
    // PHASE 2 (0.14 -> 0.36): Center 2:1 Window Box & Diagonal Cross-Hatching
    // ------------------------------------------------------------------
    var p2Raw = (t - 0.14) / 0.22;
    if (p2Raw > 0) {
      var p2Box = clamp01(p2Raw / 0.56);
      var p2Hatch = clamp01((p2Raw - 0.52) / 0.48);
      var win = targets.win;

      // Subtle 2H architectural corner extension rays
      if (p2Box > 0.15) {
        var rayP = clamp01((p2Box - 0.15) * 2);
        drawHandLine(ctx, win.left - 16, win.top - 16, win.left, win.top, 10.1, rayP, {
          color: 'rgba(24, 23, 22, 0.16)',
          width: 0.65,
          bow: 0.2
        });
        drawHandLine(ctx, win.right, win.bottom, win.right + 14, win.bottom + 14, 10.2, rayP, {
          color: 'rgba(24, 23, 22, 0.16)',
          width: 0.65,
          bow: 0.2
        });
      }

      var posBox = drawHandRect(ctx, win, 11.4, p2Box, {
        color: 'rgba(24, 23, 22, 0.78)',
        width: 1.35,
        overrun: 8,
        doublePass: true
      });

      // Diagonal tonal cross-hatching inside window aperture
      if (p2Hatch > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(win.left + 2, win.top + 2, win.width - 4, win.height - 4);
        ctx.clip();

        var hatchCount = 11;
        var posHatch = null;
        for (var h = 0; h < hatchCount; h++) {
          var hp = clamp01(p2Hatch * (hatchCount + 4) - h);
          if (hp <= 0) continue;
          var frac = (h + 0.5) / hatchCount;
          var hx1 = win.left - 12 + frac * (win.width + win.height * 0.65);
          var hy1 = win.top + 3;
          var hx2 = hx1 - win.height * 0.68;
          var hy2 = win.bottom - 3;
          var even = h % 2 === 0;
          posHatch = drawHandLine(
            ctx,
            even ? hx1 : hx2,
            even ? hy1 : hy2,
            even ? hx2 : hx1,
            even ? hy2 : hy1,
            21 + h * 1.7,
            hp,
            { color: 'rgba(34, 31, 28, 0.28)', width: 0.95, bow: 0.9 }
          );
        }
        // Quick lighter counter-hatch pass for tonal depth
        for (var ch = 0; ch < 5; ch++) {
          var chp = clamp01(p2Hatch * (hatchCount + 4) - (hatchCount - 1 + ch));
          if (chp <= 0) continue;
          var cfrac = (ch + 0.5) / 5;
          var chx1 = win.left + cfrac * win.width * 0.72;
          var chy1 = win.top + 4;
          var chx2 = chx1 + win.height * 0.55;
          var chy2 = win.bottom - 4;
          posHatch = drawHandLine(ctx, chx1, chy1, chx2, chy2, 51 + ch * 2.1, chp, {
            color: 'rgba(34, 31, 28, 0.16)',
            width: 0.75,
            bow: 0.7
          });
        }
        ctx.restore();

        if (t > 0.14 && t <= 0.36 && posHatch) {
          toolState.x = posHatch.x;
          toolState.y = posHatch.y;
        }
      } else if (t > 0.14 && t <= 0.36 && posBox) {
        toolState.x = posBox.x;
        toolState.y = posBox.y;
      }

      // Handwritten drafting callout (right-aligned clear of "Systems" descenders)
      if (p2Hatch > 0.35) {
        ctx.save();
        ctx.globalAlpha = clamp01((p2Hatch - 0.35) / 0.5) * 0.68;
        ctx.font = '600 13px "Caveat", cursive, serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#5a534a';
        ctx.fillText('2:1 showcase ↵', win.right - 4, Math.max(20, win.top - 6));
        ctx.restore();
      }
    }

    // ------------------------------------------------------------------
    // PHASE 3 (0.36 -> 0.62): Typographic Outline Sketch + Terracotta Brush Wash
    // ------------------------------------------------------------------
    var p3Raw = (t - 0.36) / 0.26;
    if (p3Raw > 0) {
      var words = targets.words;
      var p3Type = clamp01(p3Raw / 0.68);
      var p3Brush = clamp01((p3Raw - 0.64) / 0.36);

      // Faint typographic construction lines behind first headline baseline
      if (words.length > 0) {
        var guideP = clamp01(p3Raw * 3.2);
        var w0 = words[0];
        drawHandLine(ctx, targets.padX - 4, w0.rect.bottom + 2, vw - targets.padX + 4, w0.rect.bottom + 2, 31.1, guideP, {
          color: 'rgba(216, 78, 41, 0.22)',
          width: 0.7,
          bow: 0.3
        });
      }

      // Sweep each hero word left-to-right
      var activeNib = null;
      var totalWords = words.length || 1;
      for (var wi = 0; wi < words.length; wi++) {
        var wp = clamp01(p3Type * totalWords - wi);
        if (wp > 0) {
          var wPos = drawSketchTextWord(ctx, words[wi], wp, 40 + wi * 3.3);
          if (wp < 1 || wi === words.length - 1) {
            activeNib = wPos;
          }
        }
      }

      if (t > 0.36 && t <= 0.62 && p3Brush === 0 && activeNib) {
        toolState.isBrush = false;
        toolState.x = activeNib.x;
        toolState.y = activeNib.y;
        toolState.angle = activeNib.angle;
      }

      // Artist Terracotta Brush Highlights ("Systems", "move", "commerce." + window wash)
      if (p3Brush > 0) {
        var accentWords = words.filter(function (w) { return w.accent; });
        var brushSteps = accentWords.length + 1;
        var activeBrushPos = null;

        for (var ai = 0; ai < accentWords.length; ai++) {
          var abp = clamp01(p3Brush * brushSteps - ai);
          if (abp > 0) {
            var wr = accentWords[ai].rect;
            activeBrushPos = drawBrushStroke(
              ctx,
              wr.left - 3,
              wr.top + wr.height * 0.58,
              wr.right + 4,
              wr.top + wr.height * 0.52,
              wr.height * 0.44,
              '#D84E29',
              60 + ai * 4.1,
              abp
            );
            if (abp > 0.68) {
              drawBrushSplatter(ctx, wr.right + 3, wr.top + wr.height * 0.5, '#D84E29', 64 + ai * 9.3, (abp - 0.68) / 0.32, 4);
            }
          }
        }

        // Final brush sweep washes warm gouache tone across the central 2:1 showcase box
        var winBrushP = clamp01(p3Brush * brushSteps - accentWords.length);
        if (winBrushP > 0) {
          var wRect = targets.win;
          activeBrushPos = drawBrushStroke(
            ctx,
            wRect.left + 8,
            wRect.top + wRect.height * 0.48,
            wRect.right - 8,
            wRect.top + wRect.height * 0.56,
            wRect.height * 0.58,
            '#D84E29',
            74.2,
            winBrushP
          );
          if (winBrushP > 0.72) {
            drawBrushSplatter(ctx, wRect.right - 10, wRect.top + wRect.height * 0.55, '#D84E29', 79.1, (winBrushP - 0.72) / 0.28, 5);
          }
        }

        if (t > 0.36 && t <= 0.62 && activeBrushPos) {
          toolState.isBrush = true;
          toolState.x = activeBrushPos.x;
          toolState.y = activeBrushPos.y;
          toolState.angle = -0.14;
        }
      }
    }

    // ------------------------------------------------------------------
    // PHASE 4 (0.62 -> 0.76): Editorial Bio Pretext Rules + 11-Row Index + HUD
    // ------------------------------------------------------------------
    var p4Raw = (t - 0.62) / (BLOOM_START - 0.62);
    if (p4Raw > 0) {
      var p4Bio = clamp01(p4Raw / 0.45);
      var p4Rows = clamp01((p4Raw - 0.3) / 0.7);
      var activeNib4 = null;

      // Bio Pretext stepped lines (preserving exact flow around the window!)
      var bioCount = targets.bioLines.length || 1;
      for (var bi = 0; bi < targets.bioLines.length; bi++) {
        var bp = clamp01(p4Bio * bioCount - bi);
        if (bp > 0) {
          var bl = targets.bioLines[bi];
          var midY = bl.top + bl.height * 0.55;
          activeNib4 = drawHandLine(ctx, bl.left, midY, bl.right, midY, 80 + bi * 2.1, bp, {
            color: 'rgba(24, 23, 22, 0.36)',
            width: 1.35,
            bow: 1.05
          });
        }
      }

      // Guide rows (mini storyboard thumb + terracotta index + name + dotted leader + count)
      if (p4Rows > 0 && targets.guideRows.length > 0) {
        var rCount = targets.guideRows.length;
        for (var gi = 0; gi < rCount; gi++) {
          var gp = clamp01(p4Rows * rCount - gi);
          if (gp <= 0) continue;
          var gr = targets.guideRows[gi];
          if (gr.thumb) {
            drawHandRect(ctx, gr.thumb, 100 + gi * 3, clamp01(gp * 1.4), {
              color: 'rgba(24, 23, 22, 0.54)',
              width: 0.9,
              overrun: 2
            });
            // Subtle diagonal frame placeholder stroke inside each thumb square
            if (gp > 0.35) {
              drawHandLine(
                ctx,
                gr.thumb.left + 3,
                gr.thumb.bottom - 3,
                gr.thumb.right - 3,
                gr.thumb.top + 3,
                108 + gi * 2.3,
                clamp01((gp - 0.35) * 1.6),
                { color: 'rgba(24, 23, 22, 0.24)', width: 0.75, bow: 0.3 }
              );
            }
          }
          if (gr.num) {
            var numY = gr.num.top + gr.num.height * 0.54;
            drawHandLine(ctx, gr.num.left, numY, gr.num.right, numY, 115 + gi * 1.7, clamp01(gp * 1.5), {
              color: 'rgba(216, 78, 41, 0.62)',
              width: 1.15,
              bow: 0.2
            });
          }
          if (gr.name) {
            var ny = gr.name.top + gr.name.height * 0.55;
            activeNib4 = drawHandLine(ctx, gr.name.left, ny, gr.name.right, ny, 120 + gi * 1.9, gp, {
              color: 'rgba(24, 23, 22, 0.50)',
              width: 1.15,
              bow: 0.75
            });
          }
          if (gr.dots && gp > 0.45 && gr.dots.width > 12) {
            var dy = gr.dots.top + gr.dots.height * 0.52;
            var dProg = clamp01((gp - 0.45) / 0.55);
            ctx.save();
            ctx.setLineDash([1.4, 4.4]);
            drawHandLine(ctx, gr.dots.left + 2, dy, gr.dots.right - 2, dy, 132 + gi * 1.3, dProg, {
              color: 'rgba(24, 23, 22, 0.28)',
              width: 0.9,
              bow: 0.2
            });
            ctx.restore();
          }
          if (gr.count) {
            var cy = gr.count.top + gr.count.height * 0.55;
            drawHandLine(ctx, gr.count.left, cy, gr.count.right, cy, 140 + gi * 1.4, gp, {
              color: 'rgba(216, 78, 41, 0.48)',
              width: 0.9,
              bow: 0.4
            });
          }
        }
      }

      // Detailed Viewfinder Top HUD (Brand monogram + wordmark + pill with rec dot + # index grid)
      if (targets.hudBrandIcon && p4Bio > 0.15) {
        var hbi = targets.hudBrandIcon;
        drawHandRect(ctx, hbi, 158, clamp01(p4Raw * 2.4), {
          color: 'rgba(24, 23, 22, 0.58)',
          width: 0.9,
          overrun: 2
        });
      }
      if (targets.hudMark && p4Bio > 0.2) {
        var hm = targets.hudMark;
        var hmP = clamp01(p4Raw * 2.1);
        drawHandLine(ctx, hm.left, hm.top + hm.height * 0.42, hm.right, hm.top + hm.height * 0.42, 160, hmP, {
          color: 'rgba(24, 23, 22, 0.46)',
          width: 1.15
        });
        drawHandLine(ctx, hm.left, hm.bottom - 2, hm.right, hm.bottom - 2, 161, hmP, {
          color: 'rgba(24, 23, 22, 0.28)',
          width: 0.85
        });
      }
      if (targets.hudCounter && p4Bio > 0.35) {
        var hc = targets.hudCounter;
        var hcP = clamp01(p4Raw * 1.7);
        drawHandCapsule(ctx, hc, 999, hcP, {
          color: 'rgba(24, 23, 22, 0.44)',
          width: 0.9
        });
        if (targets.hudRecDot && hcP > 0.5) {
          var rd = targets.hudRecDot;
          ctx.save();
          ctx.globalAlpha = clamp01((hcP - 0.5) * 2) * 0.78;
          ctx.fillStyle = '#D84E29';
          ctx.beginPath();
          ctx.arc(rd.left + rd.width * 0.5, rd.top + rd.height * 0.5, Math.max(2.2, rd.width * 0.5), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (targets.hudIndex && p4Bio > 0.45) {
        var hi = targets.hudIndex;
        var hiP = clamp01(p4Raw * 1.8);
        var cxH = hi.left + hi.width * 0.5;
        var cyH = hi.top + hi.height * 0.5;
        drawHandLine(ctx, cxH - 4, cyH - 7, cxH - 4, cyH + 7, 170, hiP, { color: 'rgba(24,23,22,0.52)', width: 0.9 });
        drawHandLine(ctx, cxH + 4, cyH - 7, cxH + 4, cyH + 7, 171, hiP, { color: 'rgba(24,23,22,0.52)', width: 0.9 });
        drawHandLine(ctx, cxH - 7, cyH - 3.5, cxH + 7, cyH - 3.5, 172, hiP, { color: 'rgba(24,23,22,0.52)', width: 0.9 });
        drawHandLine(ctx, cxH - 7, cyH + 3.5, cxH + 7, cyH + 3.5, 173, hiP, { color: 'rgba(24,23,22,0.52)', width: 0.9 });
      }

      // Bottom Thumb Dock: subtle rounded capsule + circular '<' & '>' navigator dial rings
      if (targets.dock && p4Rows > 0.35) {
        var dkP = clamp01((p4Rows - 0.35) / 0.65);
        drawHandCapsule(ctx, targets.dock, 999, dkP, {
          color: 'rgba(24, 23, 22, 0.24)',
          width: 0.95,
          alpha: 0.85
        });
        if (targets.dockPrev) {
          var dp = targets.dockPrev;
          drawHandCircle(ctx, dp.left + dp.width * 0.5, dp.top + dp.height * 0.5, dp.width * 0.46, 180, dkP, {
            color: 'rgba(24, 23, 22, 0.38)',
            width: 0.95
          });
        }
        if (targets.dockNext) {
          var dn = targets.dockNext;
          drawHandCircle(ctx, dn.left + dn.width * 0.5, dn.top + dn.height * 0.5, dn.width * 0.46, 182, dkP, {
            color: 'rgba(216, 78, 41, 0.62)',
            width: 1.15,
            doublePass: true
          });
        }
      }

      if (t > 0.62 && t < BLOOM_START && activeNib4) {
        toolState.isBrush = false;
        toolState.x = activeNib4.x;
        toolState.y = activeNib4.y;
        toolState.angle = 0.05;
      }
    }

    if (t >= BLOOM_START) {
      toolState.visible = false;
    }

    return toolState;
  }

  function applyWatercolorBloomErase(ctx, targets, bloomP) {
    var vw = targets.vw;
    var vh = targets.vh;
    var win = targets.win;
    var cx = win.left + win.width * 0.5;
    var cy = win.top + win.height * 0.5;
    var maxDist = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 90;

    var baseR = easeInOutCubic(bloomP) * maxDist;
    if (baseR <= 1) return;

    // Two-tone warm wet pigment halo (terracotta + subtle golden wash) ahead of the bloom
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - bloomP * 1.02) * 0.28;
    var ringGrad = ctx.createRadialGradient(cx, cy, Math.max(0, baseR - 26), cx, cy, baseR + 22);
    ringGrad.addColorStop(0, 'rgba(243, 164, 39, 0)');
    ringGrad.addColorStop(0.45, 'rgba(243, 164, 39, 0.32)');
    ringGrad.addColorStop(0.68, 'rgba(216, 78, 41, 0.52)');
    ringGrad.addColorStop(1, 'rgba(216, 78, 41, 0)');
    ctx.fillStyle = ringGrad;
    ctx.fillRect(0, 0, vw, vh);
    ctx.restore();

    // Organic 7-lobe watercolor destination-out cutout expanding from the showcase aperture
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    var lobes = [
      { ox: 0, oy: 0, scale: 1.02, feather: 0.72 },
      { ox: -30, oy: -20, scale: 0.93, feather: 0.67 },
      { ox: 34, oy: 16, scale: 0.96, feather: 0.69 },
      { ox: -18, oy: 38, scale: 0.90, feather: 0.65 },
      { ox: 20, oy: -32, scale: 0.88, feather: 0.64 },
      { ox: -42, oy: 8, scale: 0.84, feather: 0.62 },
      { ox: 12, oy: 44, scale: 0.86, feather: 0.63 }
    ];

    for (var i = 0; i < lobes.length; i++) {
      var l = lobes[i];
      var lx = cx + l.ox * (1 - bloomP * 0.35);
      var ly = cy + l.oy * (1 - bloomP * 0.35);
      var lr = baseR * l.scale;
      var inner = lr * l.feather;

      var grad = ctx.createRadialGradient(lx, ly, inner, lx, ly, lr);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.76, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  window.initPortraitSketchSplash = function (onDone) {
    var splash = document.getElementById('p-splash');
    var canvas = document.getElementById('p-sketch-canvas');
    var toolEl = document.getElementById('p-sketch-tool');
    var phaseEl = document.getElementById('p-sketch-phase');

    if (!splash || !canvas || !canvas.getContext) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    var finished = false;
    var rafId = null;
    var safetyTimer = null;
    var paperCanvasRef = null;
    var frozenSketchCanvasRef = null;

    function finishNow() {
      if (finished) return;
      finished = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (safetyTimer) {
        window.clearTimeout(safetyTimer);
        safetyTimer = null;
      }
      if (toolEl) toolEl.classList.remove('is-visible');
      if (typeof onDone === 'function') onDone();

      // Release offscreen sketch buffers cleanly once fade completes
      window.setTimeout(function () {
        if (paperCanvasRef) {
          paperCanvasRef.width = 0;
          paperCanvasRef.height = 0;
          paperCanvasRef = null;
        }
        if (frozenSketchCanvasRef) {
          frozenSketchCanvasRef.width = 0;
          frozenSketchCanvasRef.height = 0;
          frozenSketchCanvasRef = null;
        }
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }
      }, 320);
    }

    splash.addEventListener('pointerdown', finishNow, { passive: true });
    splash.addEventListener('click', finishNow, { passive: true });

    // Hard safety cap so splash can never hang
    safetyTimer = window.setTimeout(finishNow, TOTAL_DURATION_MS + 1100);

    var fontReadyPromise = (document.fonts && document.fonts.ready)
      ? Promise.race([
          document.fonts.ready,
          new Promise(function (resolve) { window.setTimeout(resolve, 220); })
        ])
      : Promise.resolve();

    fontReadyPromise.then(function () {
      if (finished) return;

      window.requestAnimationFrame(function () {
        if (finished) return;

        var ctx = canvas.getContext('2d');
        var vw = window.innerWidth || 390;
        var vh = window.innerHeight || 844;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.max(1, Math.round(vw * dpr));
        canvas.height = Math.max(1, Math.round(vh * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var targets = measureTargets(ctx);
        var paperCanvas = createPaperCanvas(vw, vh, dpr);
        paperCanvasRef = paperCanvas;
        var frozenSketchCanvas = null;

        // Draw frame 0 synchronously onto canvas before turning CSS background transparent
        ctx.drawImage(paperCanvas, 0, 0, vw, vh);
        splash.classList.add('is-canvas-ready');

        var startTime = performance.now();
        var lastPhaseText = '';
        var nibSmooth = null;

        function updatePhaseText(t) {
          if (!phaseEl) return;
          var nextText = '01 // ARCHITECTURAL GRID';
          if (t >= BLOOM_START) nextText = 'EXHIBITION READY';
          else if (t >= 0.62) nextText = '04 // GALLERY INDEX';
          else if (t >= 0.36) nextText = '03 // TYPE & BRUSH WASH';
          else if (t >= 0.14) nextText = '02 // APERTURE & HATCHING';

          if (nextText !== lastPhaseText) {
            lastPhaseText = nextText;
            phaseEl.textContent = nextText;
          }
        }

        function drawFrameAt(t, instantTool) {
          updatePhaseText(t);

          if (t < BLOOM_START) {
            var toolState = renderSketchScene(ctx, paperCanvas, targets, t);
            if (toolEl && toolState) {
              toolEl.classList.toggle('is-visible', Boolean(toolState.visible));
              toolEl.classList.toggle('is-brush', Boolean(toolState.isBrush));

              var tx = toolState.x;
              var ty = toolState.y;
              var ta = toolState.angle || 0;
              if (!instantTool && nibSmooth) {
                tx = nibSmooth.x + (tx - nibSmooth.x) * 0.48;
                ty = nibSmooth.y + (ty - nibSmooth.y) * 0.48;
                ta = nibSmooth.a + (ta - nibSmooth.a) * 0.35;
              }
              nibSmooth = { x: tx, y: ty, a: ta };

              var deg = (ta * 180 / Math.PI) * 0.25 + (toolState.isBrush ? 6 : 0);
              var lift = toolState.isBrush ? ' scale(1.04)' : '';
              toolEl.style.transform =
                'translate3d(' + (tx - 4.2).toFixed(1) + 'px,' +
                (ty - 49.8).toFixed(1) + 'px,0) rotate(' + deg.toFixed(1) + 'deg)' + lift;
            }
          } else {
            if (!frozenSketchCanvas) {
              frozenSketchCanvas = document.createElement('canvas');
              frozenSketchCanvas.width = canvas.width;
              frozenSketchCanvas.height = canvas.height;
              frozenSketchCanvasRef = frozenSketchCanvas;
              var fctx = frozenSketchCanvas.getContext('2d');
              fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
              renderSketchScene(fctx, paperCanvas, targets, BLOOM_START);
              splash.classList.add('is-blooming');
              if (toolEl) toolEl.classList.remove('is-visible');
            }

            var bloomP = clamp01((t - BLOOM_START) / (1 - BLOOM_START));
            var tailAlpha = bloomP > 0.72 ? (1 - easeInOutCubic((bloomP - 0.72) / 0.28)) : 1;

            ctx.clearRect(0, 0, vw, vh);
            ctx.save();
            ctx.globalAlpha = tailAlpha;
            ctx.drawImage(frozenSketchCanvas, 0, 0, vw, vh);
            ctx.restore();
            applyWatercolorBloomErase(ctx, targets, bloomP);
          }
        }

        var params = new URLSearchParams(window.location.search);
        var frozenTParam = params.get('sketchT');
        if (frozenTParam !== null && !isNaN(parseFloat(frozenTParam))) {
          if (safetyTimer) {
            window.clearTimeout(safetyTimer);
            safetyTimer = null;
          }
          drawFrameAt(clamp01(parseFloat(frozenTParam)), true);
          return;
        }

        function step(now) {
          if (finished) return;
          var elapsed = now - startTime;
          var t = clamp01(elapsed / TOTAL_DURATION_MS);

          drawFrameAt(t, false);

          if (t >= 1) {
            finishNow();
            return;
          }

          rafId = window.requestAnimationFrame(step);
        }

        rafId = window.requestAnimationFrame(step);
      });
    });
  };
})();
