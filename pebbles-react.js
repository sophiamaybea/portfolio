import React, { useEffect, useMemo, useRef } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const h = React.createElement;

const GLASS_THEMES = [
  { id: "amber", shape: "capsule", base1: "#ffe46b", base2: "#f4a000", accent: "#111111", accent2: "#687016" },
  { id: "red", shape: "capsule", base1: "#ff8d68", base2: "#e81818", accent: "#fff7f0", accent2: "#667319" },
  { id: "lattice", shape: "round", base1: "#ff9d35", base2: "#e51b18", accent: "#c9a914", accent2: "#c9a914" },
  { id: "pink", shape: "tall", base1: "#ffc1d4", base2: "#ef4e8d", accent: "#121212", accent2: "#f2a300" },
  { id: "face-amber", shape: "face", base1: "#e96726", base2: "#45261f", accent: "#111111", accent2: "#f13d21" },
  { id: "sunburst", shape: "round", base1: "#ffb2ca", base2: "#ef557f", accent: "#121212", accent2: "#f27b2a" },
  { id: "orange", shape: "wide", base1: "#ff9b32", base2: "#f02a18", accent: "#ffffff", accent2: "#a21612" },
  { id: "moth", shape: "moth", base1: "#bde4dc", base2: "#233f48", accent: "#e87382", accent2: "#dfad27" },
  { id: "fish", shape: "fish", base1: "#59dfdd", base2: "#168ba7", accent: "#91be18", accent2: "#ef59ab" },
  { id: "face-aqua", shape: "face", base1: "#77d5d8", base2: "#b36f4c", accent: "#111111", accent2: "#235b8c" },
  { id: "violet", shape: "capsule", base1: "#b060ef", base2: "#6a1eb3", accent: "#ffffff", accent2: "#e6b124" },
  { id: "rose", shape: "round", base1: "#fa87b4", base2: "#bb2868", accent: "#101010", accent2: "#f0b42b" },
];

const DIMENSIONS = {
  capsule: [180, 72],
  round: [126, 118],
  tall: [80, 178],
  face: [104, 142],
  wide: [210, 92],
  moth: [132, 150],
  fish: [178, 108],
};

function svgData(theme, i) {
  const { shape, base1, base2, accent, accent2 } = theme;
  const id = `g${i}`;
  const common = `
    <defs>
      <radialGradient id="${id}base" cx="30%" cy="22%" r="85%">
        <stop offset="0" stop-color="#fff" stop-opacity=".38"/>
        <stop offset=".16" stop-color="${base1}" stop-opacity=".96"/>
        <stop offset=".72" stop-color="${base2}" stop-opacity=".96"/>
        <stop offset="1" stop-color="#5c1721" stop-opacity=".74"/>
      </radialGradient>
      <linearGradient id="${id}shine" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#fff" stop-opacity=".92"/>
        <stop offset=".35" stop-color="#fff" stop-opacity=".2"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <filter id="${id}glass" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="4" specularConstant=".8" specularExponent="22" lighting-color="#fff" result="spec">
          <fePointLight x="-60" y="-90" z="170"/>
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="spec2"/>
        <feBlend in="SourceGraphic" in2="spec2" mode="screen"/>
      </filter>
    </defs>`;

  const bubbles = Array.from({ length: 18 }, (_, n) => {
    const x = 12 + ((n * 37 + i * 19) % 76);
    const y = 10 + ((n * 29 + i * 11) % 78);
    const r = 1 + ((n + i) % 4) * .7;
    return `<circle cx="${x}%" cy="${y}%" r="${r}" fill="none" stroke="#fff" stroke-opacity=".26" stroke-width=".8"/>`;
  }).join("");

  let body = "";
  if (shape === "capsule") {
    body = `<rect x="7" y="20" width="186" height="70" rx="35" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".34" stroke-width="2"/>
      ${bubbles}
      <path d="M25 40 Q88 20 173 35" fill="none" stroke="url(#${id}shine)" stroke-width="8" stroke-linecap="round" opacity=".75"/>
      ${i % 2 === 0
        ? `<g fill="${accent}">${[32,54,76,98,120,142,164].map(x=>`<circle cx="${x}" cy="38" r="3.3"/>`).join("")}</g><g stroke="${accent2}" stroke-width="6" stroke-linecap="round"><path d="M49 65v12"/><path d="M82 61v16"/><path d="M118 62v15"/><path d="M152 62v14"/></g>`
        : `<g fill="${accent}">${[35,58,81,104,127,150,173].map(x=>`<circle cx="${x}" cy="70" r="5"/>`).join("")}</g><g stroke="${accent2}" stroke-width="6" stroke-linecap="round"><path d="M55 40v12"/><path d="M88 38v14"/><path d="M134 39v13"/><path d="M160 40v12"/></g>`}`;
  } else if (shape === "round") {
    body = `<ellipse cx="70" cy="70" rx="62" ry="58" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".32" stroke-width="2"/>
      ${bubbles}
      <path d="M27 34 Q69 10 110 31" fill="none" stroke="url(#${id}shine)" stroke-width="9" stroke-linecap="round" opacity=".8"/>
      ${theme.id === "lattice"
        ? `<g stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity=".86"><path d="M24 102L104 29"/><path d="M21 70L95 19"/><path d="M36 119L119 45"/><path d="M21 48L112 101"/><path d="M34 25L121 84"/><path d="M20 88L83 122"/></g>`
        : `<path d="M76 30 Q110 50 104 92" fill="${accent2}" opacity=".65"/><path d="M73 31 Q87 51 88 102" fill="none" stroke="${accent}" stroke-width="5"/><g stroke="${accent}" stroke-width="3">${[42,52,62,72,82,92].map((y,k)=>`<path d="M88 ${y}l${18-k} ${-8+k*3}"/>`).join("")}</g><g fill="#7023a8"><circle cx="42" cy="45" r="10"/><circle cx="40" cy="69" r="10"/><circle cx="43" cy="93" r="10"/></g>`}`;
  } else if (shape === "tall") {
    body = `<path d="M46 8 C72 7 84 34 79 76 L69 163 C66 181 23 180 18 158 L10 72 C6 32 20 10 46 8Z" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
      ${bubbles}<path d="M27 27 Q45 13 61 25" fill="none" stroke="url(#${id}shine)" stroke-width="7" stroke-linecap="round"/>
      <g fill="${accent2}"><circle cx="35" cy="64" r="6"/><circle cx="34" cy="90" r="6"/><circle cx="36" cy="116" r="6"/><circle cx="39" cy="142" r="6"/></g>
      <g fill="none" stroke="${accent}" stroke-width="3">${[45,61,77,93,109,125,141].map(y=>`<circle cx="59" cy="${y}" r="6"/>`).join("")}</g>`;
  } else if (shape === "face") {
    body = `<path d="M56 7 C92 8 105 31 102 69 C99 110 84 138 58 147 C27 144 11 123 8 83 C5 43 19 13 56 7Z" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
      ${bubbles}<path d="M25 27 Q55 10 83 27" fill="none" stroke="url(#${id}shine)" stroke-width="8" stroke-linecap="round"/>
      <g fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 54 Q38 43 49 55 Q38 63 24 54"/><path d="M62 54 Q76 43 89 55 Q76 63 62 54"/><path d="M55 56 L48 91 Q54 98 61 91"/><path d="M41 112 Q55 121 71 111 Q55 128 41 112"/><path d="M20 43 Q35 36 49 43"/><path d="M65 43 Q78 37 90 44"/></g><path d="M48 35 L62 96" stroke="${accent2}" stroke-width="13" stroke-linecap="round" opacity=".75"/>`;
  } else if (shape === "wide") {
    body = `<path d="M12 52 Q18 21 60 20 L176 20 Q202 20 204 48 Q204 73 177 78 L57 80 Q20 81 12 52Z" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".33" stroke-width="2"/>
      ${bubbles}<path d="M38 34 Q104 18 174 33" fill="none" stroke="url(#${id}shine)" stroke-width="8" stroke-linecap="round"/>
      <g fill="${accent2}" opacity=".9">${[34,56,81,108,137,165].map((x,k)=>`<circle cx="${x}" cy="${58-(k%2)*8}" r="7"/>`).join("")}</g>
      <path d="M71 44 Q111 32 152 45 Q112 55 71 44Z" fill="none" stroke="#151515" stroke-width="3"/>${[82,96,110,124,138].map(x=>`<path d="M${x} 41l8 9" stroke="#151515" stroke-width="2"/>`).join("")}`;
  } else if (shape === "moth") {
    body = `<path d="M65 44 C39 13 9 31 12 71 C14 107 37 135 61 127 L70 83Z" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".38" stroke-width="2"/><path d="M72 44 C98 13 128 31 125 71 C123 107 100 135 76 127 L68 83Z" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".38" stroke-width="2"/>
      <ellipse cx="69" cy="74" rx="17" ry="52" fill="#17343b" opacity=".88"/><path d="M61 24 Q47 5 37 8" fill="none" stroke="#241d1a" stroke-width="5" stroke-linecap="round"/><path d="M77 24 Q91 5 101 8" fill="none" stroke="#241d1a" stroke-width="5" stroke-linecap="round"/>
      <circle cx="44" cy="84" r="13" fill="${accent}" opacity=".7"/><circle cx="94" cy="84" r="13" fill="${accent}" opacity=".7"/><circle cx="44" cy="84" r="5" fill="#5f1b2a"/><circle cx="94" cy="84" r="5" fill="#5f1b2a"/><g fill="${accent2}"><circle cx="35" cy="103" r="3"/><circle cx="52" cy="112" r="3"/><circle cx="87" cy="112" r="3"/><circle cx="103" cy="103" r="3"/></g>`;
  } else if (shape === "fish") {
    body = `<path d="M45 28 C77 5 143 9 166 51 C143 98 77 103 45 77 L13 94 L20 59 L12 27Z" fill="url(#${id}base)" stroke="#fff" stroke-opacity=".38" stroke-width="2"/>
      ${bubbles}<path d="M55 27 Q100 11 143 30" fill="none" stroke="url(#${id}shine)" stroke-width="7" stroke-linecap="round"/>
      <g fill="${accent}" opacity=".75">${[58,76,94,112].flatMap((x,row)=>[0,1].map(col=>`<ellipse cx="${x}" cy="${52+col*17+(row%2)*4}" rx="5" ry="3"/>`)).join("")}</g>
      <circle cx="145" cy="44" r="9" fill="#f3d923"/><circle cx="145" cy="44" r="5" fill="#111"/><circle cx="147" cy="42" r="2" fill="#fff"/><ellipse cx="169" cy="60" rx="10" ry="7" fill="${accent2}"/><g fill="#154f79"><circle cx="124" cy="63" r="7"/><circle cx="110" cy="76" r="6"/><circle cx="139" cy="77" r="5"/></g>`;
  }

  const viewBox = shape === "wide" ? "0 0 216 100" : shape === "capsule" ? "0 0 200 110" : shape === "tall" ? "0 0 90 190" : shape === "moth" ? "0 0 138 145" : shape === "fish" ? "0 0 180 110" : shape === "face" ? "0 0 110 155" : "0 0 140 140";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${common}<g filter="url(#${id}glass)">${body}</g></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createBodies(width, height) {
  const mobile = width < 700;
  return GLASS_THEMES.map((theme, i) => {
    const [baseW, baseH] = DIMENSIONS[theme.shape];
    const scale = mobile ? 0.62 : Math.min(1.08, Math.max(.82, width / 1450));
    const w = baseW * scale;
    const h = baseH * scale;
    const cols = mobile ? 3 : 4;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = ((col + .55 + ((i * 17) % 13) / 30) / cols) * width;
    const rows = Math.ceil(GLASS_THEMES.length / cols);
    const y = ((row + .55 + ((i * 11) % 9) / 28) / rows) * height;
    return {
      x: Math.max(w / 2 + 8, Math.min(width - w / 2 - 8, x)),
      y: Math.max(h / 2 + 8, Math.min(height - h / 2 - 8, y)),
      vx: (Math.random() - .5) * .75,
      vy: (Math.random() - .5) * .75,
      angle: (Math.random() - .5) * 24,
      spin: (Math.random() - .5) * .08,
      w,
      h,
      radius: Math.min(w, h) * .46,
      mass: Math.max(1, (w * h) / 9500),
      theme,
    };
  });
}

function InteractivePebbles() {
  const nodeRefs = useRef([]);
  const bodiesRef = useRef([]);
  const pointer = useRef({ x: innerWidth / 2, y: innerHeight / 2, active: false });
  const dragging = useRef(null);
  const lastDrag = useRef({ x: 0, y: 0, t: 0 });
  const reducedMotion = useRef(matchMedia("(prefers-reduced-motion: reduce)").matches);
  const assets = useMemo(() => GLASS_THEMES.map(svgData), []);

  useEffect(() => {
    let w = innerWidth;
    let hgt = innerHeight;
    bodiesRef.current = createBodies(w, hgt);
    let raf = 0;
    let last = performance.now();

    const onPointerMove = (e) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.active = true;
      if (dragging.current !== null) {
        const b = bodiesRef.current[dragging.current];
        const now = performance.now();
        const dt = Math.max(8, now - lastDrag.current.t);
        b.vx = (e.clientX - lastDrag.current.x) / dt * 13;
        b.vy = (e.clientY - lastDrag.current.y) / dt * 13;
        b.x = e.clientX;
        b.y = e.clientY;
        lastDrag.current = { x: e.clientX, y: e.clientY, t: now };
      }
    };
    const onLeave = () => { pointer.current.active = false; };
    const onResize = () => {
      w = innerWidth;
      hgt = innerHeight;
      bodiesRef.current.forEach((b) => {
        b.x = Math.min(w - b.w / 2, Math.max(b.w / 2, b.x));
        b.y = Math.min(hgt - b.h / 2, Math.max(b.h / 2, b.y));
      });
    };
    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("pointerdown", onPointerMove, { passive: true });
    addEventListener("pointerleave", onLeave);
    addEventListener("blur", onLeave);
    addEventListener("resize", onResize);

    const collide = (a, b) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const min = a.radius + b.radius;
      const d2 = dx * dx + dy * dy;
      if (d2 <= 0 || d2 >= min * min) return;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const overlap = min - d;
      const total = a.mass + b.mass;
      a.x -= nx * overlap * (b.mass / total) * .58;
      a.y -= ny * overlap * (b.mass / total) * .58;
      b.x += nx * overlap * (a.mass / total) * .58;
      b.y += ny * overlap * (a.mass / total) * .58;
      const rvx = b.vx - a.vx;
      const rvy = b.vy - a.vy;
      const speed = rvx * nx + rvy * ny;
      if (speed > 0) return;
      const restitution = .78;
      const impulse = -(1 + restitution) * speed / (1 / a.mass + 1 / b.mass);
      const ix = impulse * nx;
      const iy = impulse * ny;
      a.vx -= ix / a.mass;
      a.vy -= iy / a.mass;
      b.vx += ix / b.mass;
      b.vy += iy / b.mass;
      a.spin -= speed * .009;
      b.spin += speed * .009;
    };

    const tick = (now) => {
      const dt = Math.min(2.1, Math.max(.45, (now - last) / 16.667));
      last = now;
      const bodies = bodiesRef.current;
      const p = pointer.current;

      if (!reducedMotion.current) {
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          if (dragging.current !== i) {
            if (p.active) {
              const dx = p.x - b.x;
              const dy = p.y - b.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              const pull = Math.min(.085, 34 / (d + 90) * .045);
              b.vx += dx / d * pull * dt;
              b.vy += dy / d * pull * dt;
              const swirl = ((i % 2) ? 1 : -1) * Math.max(0, 1 - d / 700) * .012;
              b.vx += -dy / d * swirl * dt;
              b.vy += dx / d * swirl * dt;
            } else {
              b.vx += Math.sin(now * .00055 + i * 1.71) * .004 * dt;
              b.vy += Math.cos(now * .00047 + i * 1.23) * .004 * dt;
            }
            const speed = Math.hypot(b.vx, b.vy);
            if (speed > 5.4) { b.vx = b.vx / speed * 5.4; b.vy = b.vy / speed * 5.4; }
            b.vx *= Math.pow(.991, dt);
            b.vy *= Math.pow(.991, dt);
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.angle += b.spin * dt;
            b.spin *= Math.pow(.997, dt);
          }
          if (b.x < b.w / 2) { b.x = b.w / 2; b.vx = Math.abs(b.vx) * .78; b.spin += .06; }
          if (b.x > w - b.w / 2) { b.x = w - b.w / 2; b.vx = -Math.abs(b.vx) * .78; b.spin -= .06; }
          if (b.y < b.h / 2) { b.y = b.h / 2; b.vy = Math.abs(b.vy) * .78; b.spin -= .05; }
          if (b.y > hgt - b.h / 2) { b.y = hgt - b.h / 2; b.vy = -Math.abs(b.vy) * .78; b.spin += .05; }
        }
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) collide(bodies[i], bodies[j]);
        }
      }

      bodies.forEach((b, i) => {
        const el = nodeRefs.current[i];
        if (!el) return;
        el.style.width = `${b.w}px`;
        el.style.height = `${b.h}px`;
        el.style.transform = `translate3d(${b.x - b.w / 2}px, ${b.y - b.h / 2}px, 0) rotate(${b.angle}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pointerdown", onPointerMove);
      removeEventListener("pointerleave", onLeave);
      removeEventListener("blur", onLeave);
      removeEventListener("resize", onResize);
    };
  }, []);

  const startDrag = (i, e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = i;
    const b = bodiesRef.current[i];
    if (!b) return;
    b.spin = 0;
    b.vx = 0;
    b.vy = 0;
    b.x = e.clientX;
    b.y = e.clientY;
    lastDrag.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.currentTarget.classList.add("is-grabbed");
  };
  const endDrag = (i, e) => {
    if (dragging.current !== i) return;
    dragging.current = null;
    e.currentTarget.classList.remove("is-grabbed");
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (_) {}
  };

  return h("div", { className: "pebble-world", "aria-hidden": "true" },
    GLASS_THEMES.map((theme, i) => h("img", {
      key: theme.id,
      ref: el => nodeRefs.current[i] = el,
      className: `physics-pebble pebble-${theme.shape}`,
      src: assets[i],
      draggable: false,
      alt: "",
      onPointerDown: e => startDrag(i, e),
      onPointerUp: e => endDrag(i, e),
      onPointerCancel: e => endDrag(i, e),
    }))
  );
}

const mount = document.getElementById("pebble-react-root");
if (mount) createRoot(mount).render(h(InteractivePebbles));
