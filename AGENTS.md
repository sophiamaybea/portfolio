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

## Verify
```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/   # expect 200
curl -s http://localhost:3000/ | grep -o "<title>.*</title>"      # expect <title>HoVinhThanh7893</title>
```
