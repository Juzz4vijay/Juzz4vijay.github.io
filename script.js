// Neural network background (hero canvas) — subtle nod to the AI/CV theme
(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  let width, height, nodes;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getAccentColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      dot: styles.getPropertyValue('--accent-2').trim() || '#06b6d4',
      line: styles.getPropertyValue('--accent').trim() || '#4f46e5'
    };
  }

  function resize() {
    width = canvas.width = hero.clientWidth * devicePixelRatio;
    height = canvas.height = hero.clientHeight * devicePixelRatio;
    canvas.style.width = hero.clientWidth + 'px';
    canvas.style.height = hero.clientHeight + 'px';
    const density = Math.min(70, Math.floor((hero.clientWidth * hero.clientHeight) / 18000));
    nodes = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      r: (Math.random() * 1.6 + 1) * devicePixelRatio
    }));
  }

  function step() {
    const { dot, line } = getAccentColors();
    ctx.clearRect(0, 0, width, height);
    const linkDist = 150 * devicePixelRatio;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.strokeStyle = line;
          ctx.globalAlpha = (1 - dist / linkDist) * 0.35;
          ctx.lineWidth = devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = dot;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  step();
})();

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle with persistence
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('is-open'));
});

// Scroll reveal (falls back to instantly-visible if IntersectionObserver is unavailable)
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Active nav link on scroll
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.style.color = '');
      link.style.color = 'var(--text)';
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(sec => navObserver.observe(sec));

// Hero title rotator
const roles = [
  'Data Scientist',
  'Machine Learning Engineer',
  'Generative AI Architect',
  'Agentic AI Systems Developer',
  'AI Strategy Consultant'
];
const rotator = document.getElementById('rotator');
let roleIndex = 0;

function typeRole(text, cb) {
  let i = 0;
  rotator.textContent = '';
  const interval = setInterval(() => {
    rotator.textContent += text[i];
    i++;
    if (i === text.length) {
      clearInterval(interval);
      setTimeout(cb, 1600);
    }
  }, 45);
}

function eraseRole(cb) {
  let text = rotator.textContent;
  const interval = setInterval(() => {
    text = text.slice(0, -1);
    rotator.textContent = text;
    if (text.length === 0) {
      clearInterval(interval);
      cb();
    }
  }, 25);
}

function cycleRoles() {
  const current = roles[roleIndex];
  typeRole(current, () => {
    eraseRole(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      cycleRoles();
    });
  });
}
cycleRoles();

// Animated stat counters
const statEls = document.querySelectorAll('.stat-value');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isDecimal = !Number.isInteger(target);
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = `${prefix}${isDecimal ? value.toFixed(1) : Math.round(value)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.4 });
statEls.forEach(el => statObserver.observe(el));
