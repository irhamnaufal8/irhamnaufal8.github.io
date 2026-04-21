/**
 * IRHAM NAUFAL — Portfolio JS
 * Handles: Nav scroll, mobile menu, scroll reveal, posts loading, tag filtering
 */

'use strict';

/* ── NAV ──────────────────────────────────────────────────── */
(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('navBurger');
  const mobile  = document.getElementById('navMobile');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  }, { passive: true });

  burger?.addEventListener('click', () => {
    mobile?.classList.toggle('nav__mobile--open');
  });

  mobile?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobile.classList.remove('nav__mobile--open'));
  });
})();

/* ── SCROLL REVEAL ────────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal, .timeline__item');
  if (!targets.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();

/* ── POSTS & WORK CARDS ───────────────────────────────────── */
(async function initPosts() {
  let allPosts = [];

  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('No index');
    allPosts = await res.json();
  } catch (_) {
    // No posts yet — show empty state
    showEmpty('workEmpty');
    showEmpty('postsEmpty');
    return;
  }

  /* Split into "project" posts and story/lesson posts */
  const projects = allPosts.filter(p => p.tags?.includes('project'));
  const writings = allPosts;

  renderGrid('workGrid', projects, 'workEmpty');
  renderGrid('postsGrid', writings, 'postsEmpty');
  initFilter(writings);
})();

/**
 * Render post cards into a grid element.
 * @param {string}   gridId  - DOM element id
 * @param {object[]} posts   - array of post metadata
 * @param {string}   emptyId - id of empty-state element
 */
function renderGrid(gridId, posts, emptyId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!posts.length) {
    showEmpty(emptyId);
    return;
  }

  grid.innerHTML = posts.map(post => buildCard(post)).join('');

  // Reveal animation for new cards
  grid.querySelectorAll('.work-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.07}s`;
    el.classList.add('reveal');
    requestAnimationFrame(() => el.classList.add('is-visible'));
  });
}

/**
 * Build a single post card HTML string.
 * @param {object} post
 * @returns {string}
 */
function buildCard(post) {
  const tags    = (post.tags || []).map(t => `<span class="work-card__tag work-card__tag--${t}">${capitalise(t)}</span>`).join('');
  const banner  = post.banner
    ? `<img class="work-card__banner" src="${post.banner}" alt="${post.title}" loading="lazy" />`
    : `<div class="work-card__banner--placeholder">${post.emoji || '✦'}</div>`;
  const date    = post.date ? formatDate(post.date) : '';

  return `
    <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="work-card">
      ${banner}
      <div class="work-card__body">
        <div class="work-card__tags">${tags}</div>
        <h3 class="work-card__title">${escHtml(post.title)}</h3>
        <p class="work-card__desc">${escHtml(post.description || '')}</p>
        <div class="work-card__footer">
          <span class="work-card__date">${date}</span>
          <span class="work-card__arrow">→</span>
        </div>
      </div>
    </a>`;
}

/* ── TAG FILTER ───────────────────────────────────────────── */
let allWritings = [];

function initFilter(posts) {
  allWritings = posts;
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      const tag = btn.dataset.tag;
      const filtered = tag === 'all' ? posts : posts.filter(p => p.tags?.includes(tag));
      renderGrid('postsGrid', filtered, 'postsEmpty');
    });
  });
}

/* ── HELPERS ──────────────────────────────────────────────── */
function showEmpty(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
