/**
 * IRHAM NAUFAL — Space Portfolio
 * Handles: Canvas stars + shooting stars, Custom cursor,
 *          Nav scroll, Mobile menu, Scroll reveal (multi-variant),
 *          Posts loading, Tag filtering
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. SPACE CANVAS — Stars + Shooting Stars + Nebula Dust
   ══════════════════════════════════════════════════════════ */
(function initSpaceCanvas() {
  const canvas = document.getElementById('spaceCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars, dustClouds;
  const shootingStars = [];
  let frameId;
  let lastShot = 0;

  // ─── Resize ───
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
    initDust();
  }

  // ─── Stars ───
  function initStars() {
    const count = Math.floor((W * H) / 4200);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.3 + 0.05,  // twinkle speed
      phase: Math.random() * Math.PI * 2,
      color: randomStarColor(),
    }));
  }

  function randomStarColor() {
    const palette = ['#FFFFFF', '#E8E0FF', '#C4B5FD', '#BAE6FD', '#FEF3C7', '#FDD8FF'];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  // ─── Nebula dust clouds ───
  function initDust() {
    dustClouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 250 + 100,
      alpha: Math.random() * 0.025 + 0.008,
      hue: Math.random() > .5 ? '139,92,246' : '6,182,212',
    }));
  }

  // ─── Shooting star factory ───
  function spawnShootingStar() {
    const angle = (Math.random() * 30 + 15) * (Math.PI / 180); // 15–45°
    const speed = Math.random() * 10 + 8;
    const length = Math.random() * 160 + 80;
    const startX = Math.random() * W * 1.2 - W * 0.1;
    const startY = Math.random() * H * 0.5;

    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01,
      width: Math.random() * 1.5 + .5,
      trail: [],
      color: Math.random() > .4 ? '#A78BFA' : '#67E8F9',
    });
  }

  // ─── Draw functions ───
  function drawDust() {
    dustClouds.forEach(d => {
      const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
      grad.addColorStop(0, `rgba(${d.hue},${d.alpha})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawStars(t) {
    stars.forEach(s => {
      const twinkle = Math.sin(t * s.speed + s.phase) * 0.4 + 0.6;
      ctx.save();
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = s.color;
      ctx.shadowBlur = s.r > 1 ? 4 : 0;
      ctx.shadowColor = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 18) s.trail.shift();

      // Draw trail
      if (s.trail.length > 1) {
        for (let j = 1; j < s.trail.length; j++) {
          const prog = j / s.trail.length;
          ctx.save();
          ctx.globalAlpha = prog * s.alpha * 0.9;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.width * prog;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 12 * prog;
          ctx.shadowColor = s.color;
          ctx.beginPath();
          ctx.moveTo(s.trail[j - 1].x, s.trail[j - 1].y);
          ctx.lineTo(s.trail[j].x, s.trail[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Head glow
      ctx.save();
      ctx.globalAlpha = s.alpha;
      const headGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 4);
      headGrad.addColorStop(0, '#FFFFFF');
      headGrad.addColorStop(.4, s.color);
      headGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Move + decay
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;

      if (s.alpha <= 0 || s.x > W + 100 || s.y > H + 100) {
        shootingStars.splice(i, 1);
      }
    }
  }

  // ─── Main loop ───
  function loop(t) {
    frameId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    drawDust();
    drawStars(t * 0.001);
    drawShootingStars();

    // Spawn shooting stars stochastically
    if (t - lastShot > 2200 + Math.random() * 3000) {
      spawnShootingStar();
      if (Math.random() > .65) {
        setTimeout(spawnShootingStar, 180 + Math.random() * 400);
      }
      lastShot = t;
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  frameId = requestAnimationFrame(loop);
})();


/* ══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ══════════════════════════════════════════════════════════ */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor__dot';
  ring.className = 'cursor__ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  let enlarged = false;
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .work-card, .skill-tag, .filter-btn')) {
      if (!enlarged) {
        enlarged = true;
        dot.style.width = dot.style.height = '14px';
        ring.style.width = ring.style.height = '54px';
        ring.style.borderColor = 'rgba(167,139,250,.7)';
      }
    } else {
      if (enlarged) {
        enlarged = false;
        dot.style.width = dot.style.height = '8px';
        ring.style.width = ring.style.height = '36px';
        ring.style.borderColor = 'rgba(139,92,246,.5)';
      }
    }
  }, { passive: true });

  let raf;
  function animateCursor() {
    raf = requestAnimationFrame(animateCursor);
    // Ring lags behind dot
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  }
  animateCursor();
})();


/* ══════════════════════════════════════════════════════════
   3. NAV — scroll state + mobile toggle
   ══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  burger?.addEventListener('click', () => {
    mobile?.classList.toggle('nav__mobile--open');
  });
  mobile?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobile.classList.remove('nav__mobile--open'));
  });
})();


/* ══════════════════════════════════════════════════════════
   4. SCROLL REVEAL — multi-variant with IntersectionObserver
   ══════════════════════════════════════════════════════════ */
(function initReveal() {
  // All elements with data-reveal or timeline items
  const targets = document.querySelectorAll('[data-reveal], .timeline__item');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Stagger delay for timeline items based on index
      const idx = parseInt(el.dataset.index || '0', 10);
      const delay = el.classList.contains('timeline__item') ? idx * 100 : 0;
      setTimeout(() => el.classList.add('is-visible'), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    if (el.classList.contains('timeline__item')) {
      el.dataset.index = i;
    }
    io.observe(el);
  });

  // Also handle [data-stagger] containers
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  const staggerIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        staggerIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  staggerContainers.forEach(el => staggerIO.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   5. POSTS — load from index.json, render cards, filter
   ══════════════════════════════════════════════════════════ */
(async function initPosts() {
  let allPosts = [];

  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('No index');
    allPosts = await res.json();
  } catch (_) {
    showEmpty('workEmpty');
    showEmpty('postsEmpty');
    return;
  }

  const projects = allPosts.filter(p => p.tags?.includes('project'));
  renderGrid('workGrid', projects, 'workEmpty');
  renderGrid('postsGrid', allPosts, 'postsEmpty');
  initFilter(allPosts);
})();

function renderGrid(gridId, posts, emptyId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!posts.length) { showEmpty(emptyId); return; }

  grid.innerHTML = posts.map(buildCard).join('');

  // Trigger reveal with staggered delay
  grid.querySelectorAll('.work-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px) scale(.96)';
    el.style.transition = `opacity .7s cubic-bezier(.16,1,.3,1) ${i * 0.09}s, transform .7s cubic-bezier(.34,1.56,.64,1) ${i * 0.09}s`;
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 80 + i * 90);
    });
  });
}

function buildCard(post) {
  const tags = (post.tags || []).map(t =>
    `<span class="work-card__tag work-card__tag--${t}">${cap(t)}</span>`
  ).join('');
  const banner = post.banner
    ? `<img class="work-card__banner" src="${post.banner}" alt="${post.title}" loading="lazy" />`
    : `<div class="work-card__banner--placeholder">${post.emoji || '✦'}</div>`;
  const date = post.date ? fmtDate(post.date) : '';

  return `
    <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="work-card">
      ${banner}
      <div class="work-card__body">
        <div class="work-card__tags">${tags}</div>
        <h3 class="work-card__title">${esc(post.title)}</h3>
        <p class="work-card__desc">${esc(post.description || '')}</p>
        <div class="work-card__footer">
          <span class="work-card__date">${date}</span>
          <span class="work-card__arrow">→</span>
        </div>
      </div>
    </a>`;
}

function initFilter(posts) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      const tag = btn.dataset.tag;
      const filtered = tag === 'all' ? posts : posts.filter(p => p.tags?.includes(tag));
      renderGrid('postsGrid', filtered, 'postsEmpty');
    });
  });
}

/* ── Helpers ── */
function showEmpty(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
