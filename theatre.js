// Interactive 3D paper shadow-box theatre.
// Assembles the uploaded paper-cut artworks into a genuine 3D scene:
// each artwork lives on its own Z-plane so there is real air between the
// pieces of paper. Pointer movement lets the viewer look between the layers;
// scrolling flies a virtual camera through the box.
import * as THREE from "https://esm.sh/three@0.148.0";

// ---- Tunable scene configuration -----------------------------------------
// All source images share the same canvas (1366 x 1427), so giving every
// vertical plane the same world size and centring it at x=0,y=0 reconstructs
// the original composition exactly. Only Z (depth) differs per layer.
const IMG_W = 1366;
const IMG_H = 1427;
const PLANE_W = 10;                       // master scene width (units)
const PLANE_H = PLANE_W * (IMG_H / IMG_W); // master scene height (~10.45)

// Z depths (front = closer to camera = larger Z). Back-to-back ordering:
//   proscenium -> curtain -> floor -> chandelier -> wall -> inner room
const LAYERS = [
  { key: "room",       file: "c0936989d_Untitleddesign-7.png", z: -6.0 },  // inner room seen through the doorway
  { key: "wall",       file: "5c06c62ff_Untitleddesign-6.png", z:  0.0 },  // navy constellation back wall
  { key: "chandelier", file: "fb9313f5c_Untitleddesign-5.png", z:  1.2 },  // floating chandelier
  { key: "floor",      file: "f70acc15c_Untitleddesign-8.png", z: 13.0, isFloor: true }, // stage floor, in FRONT of the curtains
  { key: "curtain",    file: "244e67561_Untitleddesign-4.png", z: 12.0 },  // velvet curtain
  { key: "proscenium", file: "db1fa1fa9_Untitleddesign-3.png", z: 16.0 },  // ornate front frame
];
const Z_MEAN = LAYERS.reduce((s, l) => s + l.z, 0) / LAYERS.length; // ~5.0

const FLOOR_TILT = 1.0;      // radians the stage floor is laid back (~57deg)
const FLOOR_SCALE = 0.55;    // shrinks the stage so its front edge doesn't over-project

// The dancing performer: a looping video screen standing on the stage, in
// front of the curtains, watchable through the proscenium. (16:9 source.)
const VIDEO = { src: "./videos/theatre/dance.mov", z: 13.6, y: -2.1, w: 4.6 };

const FOV = 42;
const CAM_FAR_Z = 30;        // scroll 0%  — theatre seen from afar
const CAM_NEAR_Z = 1.2;      // scroll 100% — up against the doorway
const LOOK_AT_Z = 5;         // where the camera looks (centre of the stack)

const PARALLAX_X = 1.25;     // pointer-driven camera X (≈ ±4deg yaw)
const PARALLAX_Y = 0.85;     // pointer-driven camera Y (≈ ±2.5deg pitch)
const LERP = 0.06;          // inertial follow factor

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initTheatre() {
  const canvas = document.querySelector(".theatreCanvas");
  const stage = document.querySelector(".theatreStage");
  const section = document.getElementById("sectionTheatre");
  const explodeBtn = document.getElementById("theatreExplode");
  if (!canvas || !stage) return;

  // ---- renderer / scene / camera ----------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x06050a, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06050a);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_FAR_Z);
  camera.lookAt(0, 0, LOOK_AT_Z);

  // ---- lighting (warm key from upper-left + soft fill) ------------------
  scene.add(new THREE.AmbientLight(0xfff3e0, 0.95));
  const key = new THREE.DirectionalLight(0xffe6c8, 0.4);
  key.position.set(-6, 8, 18);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  scene.add(key);

  // ---- layers ------------------------------------------------------------
  const loader = new THREE.TextureLoader();
  const meshes = {};
  let floorGroup = null;

  LAYERS.forEach((L) => {
    const tex = loader.load(`./images/theatre/${L.file}`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.minFilter = THREE.LinearMipmapLinearFilter;

    const mat = new THREE.MeshLambertMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.5,   // crisp paper-cut edges + drives the silhouette shadow
      side: THREE.DoubleSide,
      roughness: 1,
    });

    // Silhouette shadows: the default shadow depth material ignores texture
    // alpha, so give each layer a depth material that discards transparent
    // texels — only the paper shape casts a shadow.
    const depthMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: 0.5,
      map: tex,
    });

    const geo = new THREE.PlaneGeometry(PLANE_W, PLANE_H);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.customDepthMaterial = depthMat;
    mesh.userData.baseZ = L.z;

    if (L.isFloor) {
      // Lay the stage floor as a receding plane: pivot at the back (top) edge so
      // the back edge meets the wall base and the front edge swings toward viewer.
      const g = new THREE.PlaneGeometry(PLANE_W, PLANE_H);
      g.translate(0, -PLANE_H / 2, 0);          // top edge -> origin
      mesh.geometry = g;
      mesh.scale.setScalar(FLOOR_SCALE);        // smaller stage apron
      mesh.rotation.x = -FLOOR_TILT;            // tilt back into the box
      mesh.position.set(0, -PLANE_H / 2, L.z);  // back edge at wall base
      floorGroup = mesh;
    } else {
      mesh.position.set(0, 0, L.z);
    }
    scene.add(mesh);
    meshes[L.key] = mesh;
  });

  // ---- the dancing performer (a looping video screen on the stage) -----
  addPerformer(scene);

  // ---- dust (a handful of slow motes drifting inside the box) -----------
  const dust = makeDust();
  scene.add(dust.points);

  // ---- interaction state -------------------------------------------------
  const state = {
    px: 0, py: 0,            // pointer normalised -1..1
    tx: 0, ty: 0,            // eased pointer
    scroll: 0,               // 0..1 progress through the section
    hover: 0, thover: 0,     // depth-on-hover 0..1
    explode: 0, texplode: 0, // exploded view 0..1
  };

  // ---- pointer parallax --------------------------------------------------
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    state.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    state.py = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  stage.addEventListener("pointerenter", () => { state.thover = 1; });
  stage.addEventListener("pointerleave", () => { state.thover = 0; state.tx = 0; state.ty = 0; state.px = 0; state.py = 0; });

  // ---- exploded view debug toggle ---------------------------------------
  if (explodeBtn) {
    explodeBtn.addEventListener("click", () => {
      const on = explodeBtn.getAttribute("aria-pressed") === "true";
      explodeBtn.setAttribute("aria-pressed", String(!on));
      explodeBtn.textContent = on ? "Exploded view" : "Normal view";
      state.texplode = on ? 0 : 1;
    });
  }

  // ---- scroll progress (the section is taller than the viewport) -------
  const main = document.querySelector("main");
  function updateScroll() {
    if (!section || !main) { state.scroll = 0; return; }
    const top = section.offsetTop - main.offsetTop;
    const span = Math.max(1, section.offsetHeight - stage.offsetHeight);
    const p = (main.scrollTop - top) / span;
    state.scroll = Math.min(1, Math.max(0, p));
  }
  if (main) main.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  // ---- resize ------------------------------------------------------------
  function resize() {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  // ---- visibility gate (only render while the theatre is on screen) -----
  let visible = true;
  new IntersectionObserver((ents) => {
    visible = ents[0].isIntersecting;
  }, { threshold: 0.01 }).observe(stage);

  // ---- animation loop ----------------------------------------------------
  const clock = new THREE.Clock();
  const ease = (a, b) => a + (b - a) * LERP;
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const t = clock.getElapsedTime();

    // ease pointer + boosts
    state.tx = ease(state.tx, state.px);
    state.ty = ease(state.ty, state.py);
    state.hover = ease(state.hover, state.thover);
    state.explode = ease(state.explode, state.texplode);

    const depthBoost = 1 + state.hover * 0.07;     // +7% depth on hover
    const spread = depthBoost * (1 + state.explode * 1.8); // exploded spreads layers

    // place vertical layers along Z (floor keeps its fixed tilt)
    for (const L of LAYERS) {
      if (L.isFloor) continue;
      const m = meshes[L.key];
      m.position.z = Z_MEAN + (L.z - Z_MEAN) * spread;
    }

    // camera dolly from scroll + pointer parallax
    let z = CAM_FAR_Z;
    if (!prefersReduced) {
      z = CAM_FAR_Z + (CAM_NEAR_Z - CAM_FAR_Z) * easeInOut(state.scroll);
    }
    let cx = 0, cy = 0;
    if (!prefersReduced) {
      cx = state.tx * PARALLAX_X;
      cy = -state.ty * PARALLAX_Y;
    }
    camera.position.x += (cx - camera.position.x) * LERP;
    camera.position.y += (cy - camera.position.y) * LERP;
    camera.position.z += (z - camera.position.z) * LERP;
    camera.lookAt(0, 0, LOOK_AT_Z);

    // micro-motion: barely-there sway of the soft elements
    if (!prefersReduced) {
      if (meshes.curtain)    meshes.curtain.rotation.z    = Math.sin(t * 0.30) * 0.004;
      if (meshes.chandelier) meshes.chandelier.rotation.z = Math.sin(t * 0.42 + 1) * 0.002;
      if (meshes.chandelier) meshes.chandelier.position.y = Math.sin(t * 0.5) * 0.012;
    }

    // dust drift
    if (!prefersReduced) updateDust(dust, t);

    renderer.render(scene, camera);
  }
  tick();
}

// ---- helpers -------------------------------------------------------------

// Build the watchable dancing performer: a looping <video> mapped onto a
// plane standing on the stage, in front of the curtains, with a dark backing
// frame so it reads as a little screen inside the theatre.
function addPerformer(scene) {
  const video = document.createElement("video");
  video.src = VIDEO.src;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.style.display = "none";
  document.body.appendChild(video);
  video.play().catch(() => {}); // muted autoplay; if blocked, first frame still shows

  const tex = new THREE.VideoTexture(video);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const vw = VIDEO.w;
  const vh = vw * (1080 / 1920);

  // dark backing frame, slightly larger and just behind the screen
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(vw + 0.35, vh + 0.35),
    new THREE.MeshBasicMaterial({ color: 0x160e08, side: THREE.DoubleSide })
  );
  frame.position.set(0, VIDEO.y, VIDEO.z - 0.06);
  scene.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(vw, vh),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
  );
  screen.position.set(0, VIDEO.y, VIDEO.z);
  scene.add(screen);
}

function easeInOut(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

// Build ~14 dust motes scattered through the box volume.
function makeDust() {
  const N = 14;
  const positions = new Float32Array(N * 3);
  const velocities = [];
  for (let i = 0; i < N; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = -5 + Math.random() * 20;
    velocities.push((Math.random() - 0.5) * 0.02);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.07,
    map: dustSprite(),
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return { points: new THREE.Points(geo, mat), velocities };
}

function updateDust(dust, t) {
  const arr = dust.points.geometry.attributes.position.array;
  for (let i = 0; i < dust.velocities.length; i++) {
    arr[i * 3]     += Math.sin(t * 0.2 + i) * 0.0008;
    arr[i * 3 + 1] += dust.velocities[i] * 0.016;
    if (arr[i * 3 + 1] > 4)  arr[i * 3 + 1] = -4;
    if (arr[i * 3 + 1] < -4) arr[i * 3 + 1] = 4;
  }
  dust.points.geometry.attributes.position.needsUpdate = true;
}

// Soft round sprite for dust (generated, no external asset).
function dustSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, "rgba(255,240,210,1)");
  grd.addColorStop(1, "rgba(255,240,210,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
