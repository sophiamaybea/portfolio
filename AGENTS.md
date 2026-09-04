# Base44 Dev Environment

## Overview
Pure static portfolio site (HTML/CSS/JS, no framework, no build step). Uses Three.js and open-simplex-noise loaded via ESM from `esm.sh`. Contact form posts to EmailJS using keys hardcoded in `index.js` (no external secrets needed from the user).

## Run
```
docker compose -f docker-compose.base44.yml up -d
```
Served by nginx:alpine on host port 3000. Source is bind-mounted read-only into the container.

## Notes
- The repo root directory has restrictive permissions (700), so nginx runs as `root` via a custom `nginx.base44.conf` mounted at `/etc/nginx/nginx.conf`. Without this, the worker process (user `nginx`) gets 403 Forbidden.
- No live-reload dev server (static files). Edits to HTML/CSS/JS are picked up on browser refresh; call `reload_preview` to force the preview iframe to refresh.
- EmailJS `user_id`/`service_id`/`template_id` are embedded in `index.js`; the contact form depends on the author's EmailJS account being valid.

## Paper theatre
`theatre.js` (imported by `index.js`) builds an interactive 3D paper shadow box with Three.js: the 6 artworks in `images/theatre/` are placed as textured planes at distinct Z-depths (real 3D, not stacked PNGs). The `#sectionTheatre` is a tall (260vh), non-snapping, full-bleed section with a sticky `.theatreStage` canvas. Pointer = look-between-layers parallax; scroll = camera flies through the box; "Exploded view" button = debug depth toggle; `prefers-reduced-motion` disables motion. Layer Z-depths, floor tilt, camera Z range and parallax are constants at the top of `theatre.js` for easy tuning.

## Verify
```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/   # expect 200
curl -s http://localhost:3000/ | grep -o "<title>.*</title>"      # expect <title>HoVinhThanh7893</title>
```
