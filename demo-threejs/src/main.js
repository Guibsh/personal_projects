import * as THREE from 'three';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('gl');

/* ---------- paleta (a mesma do site) ---------- */
const COR_FUNDO = 0xf1e9d6;
const COR_NEVOA = 0xf1e9d6;
const COR_OLIVA = 0x5a6348;
const COR_OLIVA_ESCURA = 0x434b36;
const COR_TERRACOTA = 0xc0705a;
const COR_TERRACOTA_SUAVE = 0xd89882;
const COR_CREME = 0xfffdf8;

/* ---------- cena, câmera, renderer ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(COR_FUNDO);
scene.fog = new THREE.Fog(COR_NEVOA, 6, 26);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.35, 9);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* ---------- luz ---------- */
scene.add(new THREE.HemisphereLight(0xfff3e0, 0x4a5138, 0.9));
const sol = new THREE.DirectionalLight(0xffe6cf, 1.15);
sol.position.set(4, 8, 5);
sol.castShadow = true;
sol.shadow.mapSize.set(1024, 1024);
sol.shadow.camera.left = -10;
sol.shadow.camera.right = 10;
sol.shadow.camera.top = 10;
sol.shadow.camera.bottom = -10;
scene.add(sol);

/* ---------- chão ---------- */
const chao = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x8a9070, roughness: 1 })
);
chao.rotation.x = -Math.PI / 2;
chao.position.y = 0;
chao.receiveShadow = true;
scene.add(chao);

/* ---------- geometria de uma flor, reaproveitada por instância ---------- */
function construirFlor() {
  const grupo = new THREE.Group();

  const caule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 1, 6),
    new THREE.MeshStandardMaterial({ color: COR_OLIVA, roughness: 0.85 })
  );
  caule.position.y = 0.5;
  caule.castShadow = true;
  grupo.add(caule);

  const folha = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.32, 4),
    new THREE.MeshStandardMaterial({ color: COR_OLIVA, roughness: 0.85 })
  );
  folha.rotation.z = Math.PI / 2.3;
  folha.position.set(0.14, 0.6, 0);
  folha.castShadow = true;
  grupo.add(folha);

  const miolo = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 8),
    new THREE.MeshStandardMaterial({ color: COR_CREME, roughness: 0.6 })
  );
  miolo.position.y = 1.02;
  miolo.castShadow = true;
  grupo.add(miolo);

  const corPetala = Math.random() > 0.6 ? COR_TERRACOTA : COR_TERRACOTA_SUAVE;
  const matPetala = new THREE.MeshStandardMaterial({ color: corPetala, roughness: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const petala = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), matPetala);
    const ang = (i / 6) * Math.PI * 2;
    // as pétalas abrem para os lados e um pouco para cima, como um copo — se
    // ficarem no plano horizontal a flor lê como um disco visto de cima
    petala.position.set(Math.cos(ang) * 0.15, 1.06, Math.sin(ang) * 0.15);
    petala.scale.set(1, 0.5, 1.6);
    petala.lookAt(
      petala.position.x + Math.cos(ang) * 0.4,
      petala.position.y + 0.25,
      petala.position.z + Math.sin(ang) * 0.4
    );
    petala.castShadow = true;
    grupo.add(petala);
  }

  return grupo;
}

/* ---------- planta um campo de flores ao longo do eixo Z ---------- */
const campo = new THREE.Group();
scene.add(campo);
const TOTAL = 46;
for (let i = 0; i < TOTAL; i++) {
  const flor = construirFlor();
  const lado = i % 2 === 0 ? -1 : 1;
  const faixa = 1.1 + Math.random() * 2.6;
  flor.position.set(lado * faixa, 0, -i * 1.35 - Math.random() * 0.6);
  const escala = 0.7 + Math.random() * 0.8;
  flor.scale.setScalar(escala);
  flor.rotation.y = Math.random() * Math.PI * 2;
  flor.userData.fase = Math.random() * Math.PI * 2;
  flor.userData.amp = 0.05 + Math.random() * 0.05;
  campo.add(flor);
}

/* ---------- pétalas flutuantes (sprites simples) ---------- */
function texturaPetala() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d89882';
  ctx.beginPath();
  ctx.ellipse(32, 32, 26, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
}
const texPetala = texturaPetala();
const matSprite = new THREE.SpriteMaterial({ map: texPetala, transparent: true, opacity: 0.85, depthWrite: false });
const petalas = [];
for (let i = 0; i < 40; i++) {
  const s = new THREE.Sprite(matSprite);
  s.scale.setScalar(0.12 + Math.random() * 0.1);
  s.position.set((Math.random() - 0.5) * 8, Math.random() * 5, -Math.random() * 60);
  s.userData.vy = 0.004 + Math.random() * 0.006;
  s.userData.vx = (Math.random() - 0.5) * 0.004;
  petalas.push(s);
  scene.add(s);
}

/* ---------- redimensionar ---------- */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- scroll conduz a câmera através do campo ---------- */
const DIST_TOTAL = TOTAL * 1.35;

function aplicarScroll(progresso) {
  const z = 9 - progresso * (DIST_TOTAL + 6);
  camera.position.z = z;
  camera.position.y = 1.35 - progresso * 0.4;
  camera.rotation.z = Math.sin(progresso * Math.PI * 6) * 0.012;
  camera.lookAt(Math.sin(progresso * Math.PI * 4) * 0.6, 1, z - 6);
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.to({ p: 0 }, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#pista', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    onUpdate: function () { aplicarScroll(this.targets()[0].p); }
  });
  ScrollTrigger.refresh();
} else {
  aplicarScroll(0);
}

/* ---------- laço de animação ---------- */
const relogio = new THREE.Clock();
function animar() {
  requestAnimationFrame(animar);
  const t = relogio.getElapsedTime();

  if (!reduced) {
    for (const flor of campo.children) {
      flor.rotation.z = Math.sin(t * 1.4 + flor.userData.fase) * flor.userData.amp;
    }
    for (const p of petalas) {
      p.position.y -= p.userData.vy;
      p.position.x += p.userData.vx + Math.sin(t + p.position.z) * 0.0015;
      if (p.position.y < 0) { p.position.y = 5; p.position.z = camera.position.z - Math.random() * 20; }
    }
  }

  renderer.render(scene, camera);
}
animar();

document.dispatchEvent(new CustomEvent('cena-pronta'));
