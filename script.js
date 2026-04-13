// photos injected from photos.js

// ── ENTRY CANVAS SIZZLE ──
const entryCanvas = document.getElementById('entryCanvas');
const ectx = entryCanvas.getContext('2d');

function resizeEntry() {
  entryCanvas.width = window.innerWidth;
  entryCanvas.height = window.innerHeight;
}
resizeEntry();
window.addEventListener('resize', resizeEntry);

const particles = Array.from({ length: 60 }, () => makeParticle());

function makeParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -0.3 - Math.random() * 0.8,
    size: 1 + Math.random() * 2.5,
    alpha: Math.random(),
    color: Math.random() > 0.5 ? '#ff4d6d' : '#ff85a1',
    life: Math.random()
  };
}

let entryAnimating = true;

function animateEntry() {
  if (!entryAnimating) return;
  ectx.clearRect(0, 0, entryCanvas.width, entryCanvas.height);

  particles.forEach(p => {
    ectx.save();
    ectx.globalAlpha = p.alpha * p.life;
    ectx.fillStyle = p.color;
    ectx.shadowColor = p.color;
    ectx.shadowBlur = 6;
    ectx.beginPath();
    ectx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ectx.fill();
    ectx.restore();

    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.008;
    p.alpha = p.life;

    if (p.life <= 0) {
      Object.assign(p, makeParticle());
      p.x = Math.random() * window.innerWidth;
      p.y = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4;
    }
  });

  requestAnimationFrame(animateEntry);
}
animateEntry();
const music = document.getElementById('bgMusic');
let playing = false;

let rainStarted = false;

function enterPage() {
  entryAnimating = false;
  ectx.clearRect(0, 0, entryCanvas.width, entryCanvas.height);
  document.getElementById('entry').classList.add('hidden');
  music.volume = 1;
  music.play().then(() => {
    playing = true;
    document.getElementById('musicToggle').textContent = '⏸';
    document.getElementById('musicIcon').style.animationPlayState = 'running';
  }).catch(() => {});
  setTimeout(() => { rainStarted = true; }, 800);
}

function toggleMusic() {
  if (playing) {
    music.pause();
    playing = false;
    document.getElementById('musicToggle').textContent = '▶';
    document.getElementById('musicIcon').style.animationPlayState = 'paused';
  } else {
    music.play();
    playing = true;
    document.getElementById('musicToggle').textContent = '⏸';
    document.getElementById('musicIcon').style.animationPlayState = 'running';
  }
}

// ── STARS ──
const starsEl = document.getElementById('stars');
for (let i = 0; i < 120; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  const size = Math.random() * 2.5 + 0.5;
  s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;animation-delay:${Math.random()*4}s`;
  starsEl.appendChild(s);
}

// ── RAIN CANVAS ──
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initRain(); });

// Preload photo images
const photoImgs = photoB64s.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const phrases = [
  'Lynnah', 'Happy Birthday', '21st April',
  'I love you',
  'Lynnah ♡', 'Today is your day',
  'So special', 'Beautiful soul'
];

// Each column can be text OR a photo
let drops = [];

function initRain() {
  const SPACING = 110;
  const count = Math.ceil(canvas.width / SPACING) + 2;
  drops = [];
  for (let i = 0; i < count; i++) {
    drops.push(makeColumn(i * SPACING + Math.random() * 30 - 10, -Math.random() * canvas.height));
  }
}

function makeColumn(x, startY) {
  const isPhoto = Math.random() < 0.35; // 35% chance of photo column
  return {
    x,
    y: startY,
    speed: 0.5 + Math.random() * 0.7,
    isPhoto,
    photoImg: isPhoto ? photoImgs[Math.floor(Math.random() * photoImgs.length)] : null,
    photoW: 65 + Math.random() * 45,
    phrase: phrases[Math.floor(Math.random() * phrases.length)],
    size: 13 + Math.random() * 9,
    alpha: 0.2 + Math.random() * 0.45,
    color: Math.random() > 0.5 ? '#ff4d6d' : '#ff85a1',
    gap: 60 + Math.random() * 50,
    items: []
  };
}

function populateItems(col) {
  col.items = [];
  let yy = col.y;
  while (yy < canvas.height + 150) {
    col.items.push({ y: yy });
    yy += col.gap + (col.isPhoto ? col.photoW * 1.4 : 30);
  }
}

initRain();
drops.forEach(populateItems);

function drawRain() {
  if (!rainStarted) {
    ctx.fillStyle = '#0d0007';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawRain);
    return;
  }
  ctx.fillStyle = 'rgba(13, 0, 7, 0.18)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drops.forEach(col => {
    col.items.forEach((item, idx) => {
      const isLead = idx === col.items.length - 1;

      if (col.isPhoto && col.photoImg.complete) {
        const w = col.photoW;
        const h = w * 1.3;
        ctx.save();
        ctx.globalAlpha = isLead ? Math.min(col.alpha + 0.25, 0.85) : col.alpha * 0.8;
        // Soft rounded clip
        const r = 6;
        ctx.beginPath();
        ctx.moveTo(col.x + r, item.y);
        ctx.lineTo(col.x + w - r, item.y);
        ctx.quadraticCurveTo(col.x + w, item.y, col.x + w, item.y + r);
        ctx.lineTo(col.x + w, item.y + h - r);
        ctx.quadraticCurveTo(col.x + w, item.y + h, col.x + w - r, item.y + h);
        ctx.lineTo(col.x + r, item.y + h);
        ctx.quadraticCurveTo(col.x + w, item.y + h, col.x, item.y + h - r);
        ctx.lineTo(col.x, item.y + r);
        ctx.quadraticCurveTo(col.x, item.y, col.x + r, item.y);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(col.photoImg, col.x, item.y, w, h);
        // Pink tint overlay
        ctx.fillStyle = 'rgba(255, 77, 109, 0.12)';
        ctx.fillRect(col.x, item.y, w, h);
        ctx.restore();
        // Glow border
        if (isLead) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,133,161,0.5)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(col.x, item.y, w, h);
          ctx.restore();
        }
      } else if (!col.isPhoto) {
        ctx.save();
        ctx.font = `${col.size}px 'Great Vibes', cursive`;
        ctx.globalAlpha = isLead ? Math.min(col.alpha + 0.3, 0.95) : col.alpha;
        ctx.fillStyle = isLead ? '#ffffff' : col.color;
        ctx.fillText(col.phrase, col.x, item.y);
        ctx.restore();
      }

      item.y += col.speed;
    });

    // Remove off-screen items
    col.items = col.items.filter(item => item.y < canvas.height + 150);

    // Spawn new item when gap opens at top
    const itemH = col.isPhoto ? col.photoW * 1.3 : 20;
    const first = col.items[0];
    const last = col.items[col.items.length - 1];

    if (!last || last.y > col.gap) {
      // Rotate phrase/photo occasionally
      if (Math.random() < 0.3) {
        col.phrase = phrases[Math.floor(Math.random() * phrases.length)];
        col.isPhoto = Math.random() < 0.35;
        if (col.isPhoto) col.photoImg = photoImgs[Math.floor(Math.random() * photoImgs.length)];
      }
      col.items.push({ y: -itemH });
    }
  });

  requestAnimationFrame(drawRain);
}

drawRain();
