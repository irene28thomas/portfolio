# Portrait v43 — "Gallery Wall" Checkpoint Reference & Engineering Notes

**Created:** 2026-11-14 (`?v=20261114v43`)  
**Backup Location:** [`backups/backup_20261114_v43_gallery_wall`](../backups/backup_20261114_v43_gallery_wall)

---

## 1. Checkpoint Backup & Restore

Full snapshot of HTML entry points, favicons/marks, stylesheets, and JavaScript modules at the end of the verified `v43` Gallery Wall pass:

- Root files: `index.html` (`251,247 B`), `portrait.html` (`861 B`), `favicon.svg` (`46,355 B`), `IT.svg` (`1,233 B`)
- Directories: `css\` (recursive), `js\` (recursive), `assets\brand\` (`favicon-32.png`, `favicon-48.png`, `apple-touch-icon-180.png`, `icon-512.png`, `it_mark_mask.png`)

### One-Line PowerShell Restore

```powershell
$src = 'backups\backup_20261114_v43_gallery_wall'; Copy-Item "$src\index.html","$src\portrait.html","$src\favicon.svg","$src\IT.svg" . -Force; Copy-Item "$src\css","$src\js" . -Recurse -Force; Copy-Item "$src\assets\brand\*" "assets\brand" -Recurse -Force
```

---

## 2. Architecture & File Map (`v43`)

### Desktop Isolation Guardrail
- Portrait mobile markup lives inside an inert `<template id="atelier-portrait-tpl">` and Desktop markup inside `<template id="atelier-landscape-tpl">` in `index.html`.
- At boot (`index.html`), `window.__ATELIER_VIEW__ === 'portrait'` clones only `#atelier-portrait-tpl`, adds `.portrait-body`, and leaves Desktop (`1440×900`) completely unmounted and unaffected (`document.getElementById('p-hud') === null`).
- Never alter Desktop CSS files (`css/layout/*`, `css/sectors/*`, `css/bundle.css`, `css/main.css`) or the shared Google Fonts `<link>` when tweaking Portrait mode.

### Global Chrome & Framing
| Element / File | Responsibility |
| --- | --- |
| [`favicon.svg`](../favicon.svg), [`assets/brand/`](../assets/brand) | Self-contained `512×512` dark `#141210` squircle SVG + PNG favicons (`32`, `48`, `180`) + `it_mark_mask.png` monochrome alpha mask |
| [`portrait-base.css`](../css/portrait/portrait-base.css) | `--p-hud-h: 44px`, `--p-dock-h: 64px`, `--p-pad-x: 20px`, `--wl-*` typography scale, act tokens (`daylight`, `noir`, `paper`) |
| [`portrait-chrome.css`](../css/portrait/portrait-chrome.css) | `#p-frame` corner hairlines + `#p-frame-act` act stamp; frameless `#p-hud` with `#p-chapter-ticks`, `.p-hud-mark`, `#p-hud-counter`, `#p-hud-atlas-btn`; unboxed `#p-thumb-dock` with `#p-dock-prev`, `#p-dock-dots`, `#p-dock-next` SVG `#p-ring-arc`, and `#p-ring-picker` |
| [`portrait-nav.js`](../js/portrait/portrait-nav.js) | `updateChromeIndicators`, `initThumbRingGestures` (`±28px` horizontal swipe, `450ms` long-press radial `#p-ring-picker`, wrap to Room `01` on last room) |

### Typography & Room Modules
| Room | Selector / Root | Implementation Notes |
| --- | --- | --- |
| **01 Cover** | `#hero` ([`portrait-hero.css`](../css/portrait/portrait-hero.css), [`portrait-widgets.js`](../js/portrait/portrait-widgets.js)) | Exhibition statement (`Visual Systems / that [window] move / commerce.`), `#p-cover-window` 6s cycling thumbnail (`initCoverWindow`), 10-row `.p-cover-guide-row` index, `#p-hero-bio-btn` -> `#p-bio-drawer` |
| **02 Brand Manual** | `#branding` | `.p-wall-label.is-bottom-left` (`NIVARA Brand Manual`), `#p-manual-title` status in kicker, `.p-text-tabs`, 13-slide reader + `2×` loupe (`toggleManualLoupe`) |
| **03 Social Matrix** | `#ecommerce-petals` ([`portrait-petal-wheel.js`](../js/portrait/portrait-petal-wheel.js)) | `.p-petal-filters.p-text-tabs` + `.p-petal-brands.p-text-tabs` unboxed underlined tabs, `.p-petal-meta-pill.p-wheel-caption` borderless mono line below orbit |
| **04 Store Matrix** | `#ecommerce-conveyor` | `#p-spec-sheet`: 6-brand switcher (`adidas`, `jlindeberg`, `vessel`, `nicklaus`, `palms`, `sailors`) showing Desktop Web `1920×600` (`3.2:1`), App `900×600` (`3:2`), Mobile `640×427` (`3:2`) simultaneously with `object-fit: contain` + `HARDWARE 3×` toggle (`#p-conveyor-hw-view`) |
| **05 Reels Cinema** | `#ecommerce-reels` | `90°` rotated `.p-reels-transpose-stage` (`refreshReelTransposeScale`) |
| **06 Dispatches** | `#section-crm` | `#p-landing-browser` isolated `5,200px` LAND / VIP CRM / MAJORS / VESSEL reader + `.p-dispatch-tabs.p-text-tabs` |
| **07 Barney Cinema** | `#section-barney` | `9:16` cinema + `#p-sprocket-rail` 12-pose expression sheet |
| **08 Poster Archive** | `#section-posters` | Exhibition poster deck + mini grid toggle |
| **09 Totems & AI Lab** | `#section-totems` | **09A:** `#p-totem-showroom` 5-column uncropped vertical plinths (`openTotemElevator(0..4)` -> `#p-totem-elevator` pan viewport + `#p-elevator-minimap`). **09B:** `#p-ailab-carousel` 5 single-view `.p-specimen-plate` slides with blurred neighbors and direct prompts/specs |
| **10 Print Tri-Sets** | `#section-trisets` | Noir act dual-circle rim wheel (`15` A4/A5 spreads & folios) |
| **11 Executive Dossier** | `#resume` | Paper act (`#p-frame-act: PAPER`), KPI grid, chronology, CV PDF / `.vcf` / email / tel actions, wrap-to-start `↑` ring |

### Preserved Global `window.*` Entry Points
Inline `onclick` handlers in `index.html` rely on:
- Navigation/HUD/Drawers (`portrait-nav.js`): `goToPortraitChapter`, `scrollToPortraitSector`, `stepPortraitChapter`, `jumpToCommerceModule`, `jumpToPromoModule`, `openPortraitAtlas`, `openPortraitGallery`, `setAtlasTab`, `filterSalonGallery`, `openPortraitSalonWork`, `closePortraitAtlas`, `togglePortraitAtlas`, `togglePortraitSheet`, `closePortraitSheet`, `toggleHeroBioDrawer`, `getActivePortraitChapter`, `syncPortraitActiveVideos`, `refreshPortraitNav`
- Petal & Tri-Set Wheels (`portrait-petal-wheel.js`): `petalWheelFilter`, `petalWheelJumpBrand`, `petalWheelOpenLightbox`, `petalWheelRefreshLayout`, `trisetWheelFilter`, `trisetWheelJumpBrand`, `trisetWheelOpenLightbox`, `trisetWheelRefreshLayout`
- Room Widgets (`portrait-widgets.js`): `switchBrandView`, `toggleManualLoupe`, `openPortraitManualLightbox`, `selectPortraitSpread`, `stepPortraitManual`, `switchConveyorView`, `openPortraitConveyorItem`, `selectConveyorBrand`, `stepConveyorBrand`, `refreshConveyorLanes`, `switchDispatchDoc`, `openActiveDispatchLightbox`, `selectPortraitCrm`, `scrollPortraitCrm`, `openIsolatedCrmReader`, `closeIsolatedCrmReader`, `refreshReelTransposeScale`, `togglePortraitReelPlay`, `togglePortraitReelMute`, `selectStoryboardBeat`, `stepStoryboardBeat`, `switchStoryboardView`, `togglePortraitCinemaPlay`, `togglePortraitCinemaMute`, `stepPosterDeck`, `openActivePosterLightbox`, `filterPortraitPosters`, `togglePosterGridView`, `jumpToPosterInDeck`, `switchTotemTab`, `switchPromoSub`, `openTotemElevator`, `closeTotemElevator`, `stepTotemElevator`, `openActiveTotemHd`, `selectAiSpecimen`, `toggleFlipSpecimen`, `selectCareerRole`, `stepCareerRole`, `flipStudioPass`, `downloadIreneVCard`, `copyIreneEmail`

---

## 3. What We Learned (Engineering Guardrails for Tweaks)

1. **Always enforce the Single-Title Rule:**
   Room titles live inside `.p-wall-label` on the wall ground—do not mirror room names into `#p-hud` or `#p-thumb-dock`. Keep kickers concise on narrow viewports (e.g., Room 11 `11 / CURRICULUM VITAE` before `PDF ↗ CONTACT ↗`) so right-edge links do not clip on `360px` screens.

2. **Watch CSS Cascade Order in `portrait-sectors.css`:**
   Generic `.p-text-tab` and `.p-wheel-caption` live near the top (`lines 175–234`). Room-specific rules further down (`.p-dispatch-tab`, `.p-filter-pill`, `.p-brand-dot`, `.p-petal-meta-pill`, and `.is-noir` variants) had higher/later precedence—any new filter/tab selector placed later in the file must explicitly keep `background: transparent; border: 0;` if meant to stay unboxed.

3. **Clip Virtual Circular Orbit Containers to the Stage:**
   Both `.p-petal-experience` (Room 03) and `.p-triset-petal-room` (Room 10) render a large rotated ring. Without `overflow: hidden` and negative side margins (`calc(var(--p-pad-x) * -1)`) on the wrapper, the virtual circle inflates `.p-stage-inner.scrollHeight` beyond `100dvh` (`1378px` vs `844px` on Room 10 before the fix).

4. **Balance Multi-Ratio Specimens Vertically With Auto Margins / Centering:**
   - Avoid `justify-content: flex-end` on tall narrow plinth stages (`.p-totem-showroom`), which pushes assets to the bottom leaving empty dead space above. Centering with `justify-content: center` plus subtle floor spotlighting keeps all 5 full-ratio plinths visually anchored.
   - In `#p-spec-sheet` (Room 04), anchoring the header/brand-tabs at top while using `margin-top: auto` on `.p-spec-block.is-web` and `margin-bottom: auto` on `.p-spec-pair-row` centers the `1920×600`, `900×600`, and `640×427` plates vertically without dead gaps or distortion.
   - Avoid `-webkit-line-clamp` on `.p-specimen-prompt` when space permits; full AI prompts read better unclipped (`max-height: min(38dvh, 300px)` on `.p-specimen-frame` keeps controls visible above the dock on `360×800`).

5. **Handling `IT.svg` Across CSS Masks & Favicons:**
   The source `IT.svg` embeds a `5463×7450` raster PNG with a baked dark background (`#000000` interior) and white outer margin.
   - `.p-hud-mark` uses `mask-image: url("../../assets/brand/it_mark_mask.png")` generated via luminance extraction (`L > 85`) so its ink color switches automatically across `daylight`, `noir`, and `paper` acts.
   - `favicon.svg` and PNG icons crop the outer artboard margin `(152, 151, 5313, 7297)` into a `512×512` dark `#141210` squircle for tab legibility.

6. **Tunnel Origin Backlog & Cache Busting:**
   - Every stylesheet/script edit in `css/portrait/` or `js/portrait/` should increment the `?v=20261114vXX` query parameter in both `index.html` (8 tags: 4 CSS + 4 JS) and `portrait.html` favicon links so mobile browsers do not serve stale cached assets.
   - Playwright's uncached cold `networkidle` burst through `cloudflared` triggered 8 transient `502` drops when testing `https://elegant-bond-upon-derek.trycloudflare.com` because `scratch/start_mobile_tunnel.py` inherits Python `HTTPServer`'s default `request_queue_size = 5`. Individual asset fetches over the tunnel and full localhost sweeps (`127.0.0.1:62451`) returned HTTP `200` with `0` errors.
