# Architecture Specification: Omnichannel Card Petal Dial Cycle
**Status:** Archived & Preserved for Future Mobile Redesign  
**Document:** `docs/CARD_PETAL_CYCLE_CONCEPT.md`

## 1. Executive Summary & Design Vision
The **Card Petal Cycle** is an orbital physical interaction pattern designed to showcase diverse multi-format campaign artworks (1:1 feed masters, 9:16 vertical stories, and 16:9 display banners) across major brands (TaylorMade Golf, PUMA Golf, McLaren Golf, Galvin Green).

### User Vision & Next-Generation Enhancement
> *"We need to use better ideas like that flower petal card cycle (but improve that as currently the main card only appears as a part in card. It should use the whole available screen, and the flower petal acts as an overlay. Giving it a full screen [like how we auto lock to section in pc] so that the whole page is being used for it and it's properly visible)."*

In the upcoming section-by-section redesign:
- **Full-Screen Stage:** The active campaign hero media takes up `100dvh` (the complete mobile viewport), locked edge-to-edge.
- **Floating Petal HUD Overlay:** The circular petal dial, apex needle, and ratio pills float gracefully over the lower portion of the image with a subtle frosted glass scrim (`backdrop-filter: blur(16px)`), allowing maximum visual impact for the artwork while preserving quick thumb-scrubbing.

---

## 2. Mathematical Model & Trigonometry
- `PETAL_TOTAL = 12`
- `PETAL_STEP = 360 / PETAL_TOTAL = 30°`
- `PETAL_RADIUS = 215px`
- `MAX_VISIBLE_ARC = 80°`

For each card `idx` and rotation `currentAngle`:
```javascript
let angleDeg = (idx * PETAL_STEP + currentAngle) % 360;
if (angleDeg > 180) angleDeg -= 360;
if (angleDeg < -180) angleDeg += 360;

if (Math.abs(angleDeg) <= 80) {
  const normDist = Math.abs(angleDeg) / 80;
  const scale = 1.05 - (normDist * 0.22);
  let opacity = 1.0 - (normDist * 0.40);
  if (!isMatchingRatio) opacity *= 0.22;
  card.style.transform = `rotate(${angleDeg}deg) translateY(-215px) scale(${scale})`;
  card.style.opacity = opacity;
  card.style.display = 'block';
} else {
  card.style.display = 'none';
}
```

---

## 3. Data Taxonomy: 12 Campaign Petal Cards
1. `tm-1-1`: TaylorMade Golf · Hi-Toe 5 Wedges (1:1 Feed Master, 1080×1080)
2. `tm-9-16`: TaylorMade Golf · Hi-Toe 5 Wedges (9:16 Vertical Story, 1080×1920)
3. `tm-16-9`: TaylorMade Golf · Hi-Toe 5 Wedges (16:9 Display Network, 1920×1080)
4. `puma-1-1`: PUMA Golf · Featured Brand of the Month (1:1 Feed Master, 1080×1080)
5. `puma-9-16`: PUMA Golf · Featured Brand of the Month (9:16 Vertical Story, 1080×1920)
6. `puma-16-9`: PUMA Golf · Featured Brand of the Month (16:9 Display Network, 1920×1080)
7. `mcl-1-1`: McLaren Golf · Series 3 Irons Launch (1:1 Feed Master, 1080×1080)
8. `mcl-9-16`: McLaren Golf · Series 3 Irons Launch (9:16 Vertical Story, 1080×1920)
9. `mcl-16-9`: McLaren Golf · Series 3 Irons Launch (16:9 Display Network, 1920×1080)
10. `gg-1-1`: Galvin Green / PXG · Flash Deals Sponsored (1:1 Feed Master, 1080×1080)
11. `gg-9-16`: Galvin Green / PXG · Flash Deals Sponsored (9:16 Vertical Story, 1080×1920)
12. `gg-16-9`: Galvin Green / PXG · Flash Deals Sponsored (16:9 Display Network, 1920×1080)

---

## 4. Key Lessons for Re-implementing
- Always use `flex-wrap: nowrap`, `gap: 4px`, `min-width: 44px; min-height: 44px;` on ratio filter buttons.
- Do not let the dial push the hero artwork off-screen; keep the hero artwork full-viewport and dial floating as an overlay.
- Keep pointer events smooth: check `Math.abs(dx) > Math.abs(dy)` before capturing pointer drag so vertical scroll is never intercepted.
