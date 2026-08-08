// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle with persistence — dark is the default brand appearance;
// only an explicit user choice (saved below) switches to light.
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') || 'dark';
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

// Role typewriter
const roles = [
  'AI & Data Science Leader',
  'Techno-Functional Strategist',
  'Digital Transformation Leader',
  'Agentic AI Program Lead',
  'Enterprise AI Advisor'
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
      setTimeout(cb, 1500);
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
  }, 28);
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

// Animated stat counters (Impact section)
const statEls = document.querySelectorAll('.stat-value');
if ('IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isDecimal = !Number.isInteger(target);
      const duration = 1100;
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
  }, { threshold: 0.35 });
  statEls.forEach(el => statObserver.observe(el));
}

// Ticker marquees (top of hero + above footer) — duplicate list for a seamless loop
const tickerItems = ['MARITIME AI', 'TELECOM NETWORKS', 'ROBOTICS & IoT', 'DIGITIZATION', 'COST OPTIMIZATION', 'AGENTIC SYSTEMS', 'ENTERPRISE SCALE'];
function renderTicker(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const loop = [...tickerItems, ...tickerItems];
  el.innerHTML = loop.map((t, i) => {
    const isLastOfSet = i % tickerItems.length === tickerItems.length - 1;
    return `<span>${t}${isLastOfSet ? '' : '  //'}</span>`;
  }).join('');
}
renderTicker('tickerTop');
renderTicker('tickerBottom');

// Systems canvas: an interactive AI value-chain diagram (Data -> AI/Intelligence ->
// Business -> Enterprise Value) with hover tooltips, click-to-expand sub-nodes, a
// dashed feedback loop, and animated flow particles along the spine.
(function initSystemsCanvas() {
  const canvas = document.getElementById('systemsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const panel = canvas.closest('.graph-panel');
  const tooltip = document.getElementById('graphTooltip');
  const tooltipTitle = document.getElementById('graphTooltipTitle');
  const tooltipBody = document.getElementById('graphTooltipBody');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LAYERS = [
    { id: 'data', label: 'DATA', metrics: 'Quality · Coverage · Freshness', desc: 'The foundation that feeds intelligence.', support: ['Enterprise Systems', 'IoT & Sensors', 'Docs & APIs'], detail: ['Ingestion', 'Validation', 'Feature Eng.', 'Data Products'] },
    { id: 'ai', label: 'AI / INTELLIGENCE', metrics: 'Accuracy · Latency · Cost', desc: 'Transforms data into predictions & decisions.', support: ['Machine Learning', 'Generative AI', 'Agentic AI'], detail: ['RAG & Embeddings', 'Forecasting', 'Planning & Tools', 'MLOps'] },
    { id: 'business', label: 'BUSINESS', metrics: 'Efficiency · Adoption · Quality', desc: 'Converts intelligence into operational outcomes.', support: ['Automation', 'Decision Speed', 'Customer Exp.'], detail: ['Hours Saved', 'Cycle Time', 'Conversion', 'Error Reduction'] },
    { id: 'value', label: 'ENTERPRISE VALUE', metrics: 'Revenue · Cost · ROI', desc: 'The financial and strategic bottom line.', support: ['Revenue Growth', 'Cost Reduction', 'Risk Reduction'], detail: ['Margin', 'Cash Flow', 'Payback Period', 'Capital Efficiency'] }
  ];
  const layerY = [0.1, 0.38, 0.65, 0.92];
  const supportOffsets = [{ dx: -0.32, dy: -0.02 }, { dx: 0.32, dy: -0.05 }, { dx: 0.17, dy: 0.1 }];
  const detailOffsets = [{ dx: -0.36, dy: 0.06 }, { dx: 0.36, dy: -0.09 }, { dx: 0.22, dy: 0.14 }, { dx: -0.2, dy: 0.15 }];

  let w, h;
  let expandedLayer = null;
  let lastHoverKey = null;
  const pointer = { x: -9999, y: -9999, active: false };

  function currentColor() {
    return root.getAttribute('data-theme') === 'light' ? '#000000' : '#ffffff';
  }

  function resize() {
    w = canvas.width = panel.clientWidth * devicePixelRatio;
    h = canvas.height = panel.clientHeight * devicePixelRatio;
    canvas.style.width = panel.clientWidth + 'px';
    canvas.style.height = panel.clientHeight + 'px';
  }

  function buildNodes() {
    const flat = [];
    LAYERS.forEach((layer, li) => {
      const lx = 0.5 * w, ly = layerY[li] * h;
      flat.push({ key: `L${li}`, kind: 'layer', li, x: lx, y: ly, r: 8 * devicePixelRatio, label: layer.label, tipTitle: layer.label, tipBody: `${layer.desc} — ${layer.metrics}` });
      const subs = expandedLayer === li ? layer.detail : layer.support;
      const offsets = expandedLayer === li ? detailOffsets : supportOffsets;
      subs.forEach((s, si) => {
        const off = offsets[si];
        flat.push({ key: `S${li}_${si}`, kind: 'sub', li, x: lx + off.dx * w, y: ly + off.dy * h, r: 3.2 * devicePixelRatio, label: s, parentKey: `L${li}`, tipTitle: s, tipBody: `Part of ${layer.label}` });
      });
    });
    return flat;
  }

  function toCanvasXY(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * devicePixelRatio, y: (clientY - rect.top) * devicePixelRatio };
  }
  function nodeAt(nodes, x, y) {
    const hitR = 20 * devicePixelRatio;
    for (const n of nodes) if (Math.hypot(n.x - x, n.y - y) < hitR) return n;
    return null;
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = toCanvasXY(e.clientX, e.clientY);
    pointer.x = p.x; pointer.y = p.y; pointer.active = true;
  });
  canvas.addEventListener('mouseleave', () => { pointer.active = false; });
  canvas.addEventListener('click', (e) => {
    const p = toCanvasXY(e.clientX, e.clientY);
    const hit = nodeAt(buildNodes(), p.x, p.y);
    if (hit && hit.kind === 'layer') {
      expandedLayer = expandedLayer === hit.li ? null : hit.li;
    } else if (!hit) {
      expandedLayer = null;
    }
  });

  let t = 0;
  function step() {
    const color = currentColor();
    ctx.clearRect(0, 0, w, h);
    const nodes = buildNodes();
    const hovered = pointer.active ? nodeAt(nodes, pointer.x, pointer.y) : null;
    const hoverKey = hovered ? hovered.key : null;
    canvas.style.cursor = hovered ? 'pointer' : 'default';
    if (hoverKey !== lastHoverKey) {
      lastHoverKey = hoverKey;
      if (hovered) {
        tooltip.classList.add('is-visible');
        tooltip.style.left = (hovered.x / devicePixelRatio) + 'px';
        tooltip.style.top = (hovered.y / devicePixelRatio) + 'px';
        tooltipTitle.textContent = hovered.tipTitle;
        tooltipBody.textContent = hovered.tipBody;
      } else {
        tooltip.classList.remove('is-visible');
      }
    }
    const connected = new Set();
    if (hovered) {
      connected.add(hovered.key);
      if (hovered.kind === 'sub') connected.add(hovered.parentKey);
      if (hovered.kind === 'layer') nodes.forEach((n) => { if (n.parentKey === hovered.key) connected.add(n.key); });
    }
    const dim = (key) => (hovered ? (connected.has(key) ? 1 : 0.14) : 1);

    // feedback loop (value -> data)
    const dataN = nodes.find((n) => n.key === 'L0'), valueN = nodes.find((n) => n.key === 'L3');
    if (dataN && valueN) {
      ctx.save();
      ctx.setLineDash([5 * devicePixelRatio, 6 * devicePixelRatio]);
      ctx.lineDashOffset = -t * 20;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.14 * dim('L0');
      ctx.lineWidth = devicePixelRatio;
      const cx = w * 0.94;
      ctx.beginPath();
      ctx.moveTo(valueN.x, valueN.y);
      ctx.bezierCurveTo(cx, valueN.y, cx, dataN.y, dataN.x, dataN.y);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = color;
      ctx.font = `${9 * devicePixelRatio}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('FEEDBACK', cx - 2, (dataN.y + valueN.y) / 2);
    }

    // spine
    for (let i = 0; i < 3; i++) {
      const a = nodes.find((n) => n.key === `L${i}`), b = nodes.find((n) => n.key === `L${i + 1}`);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.4 * Math.min(dim(a.key), dim(b.key));
      ctx.lineWidth = 1.4 * devicePixelRatio;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // flow dots along spine
    for (let d = 0; d < 3; d++) {
      const prog = ((t * 0.012 + d / 3) % 1);
      const seg = prog * 3;
      const i = Math.min(2, Math.floor(seg));
      const localT = seg - i;
      const a = nodes.find((n) => n.key === `L${i}`), b = nodes.find((n) => n.key === `L${i + 1}`);
      const jag = 5;
      const flicker = 0.75 + Math.sin(t * 0.14 + d * 3) * 0.25 + (Math.random() < 0.04 ? 0.5 : 0);
      ctx.save();
      ctx.shadowColor = '#ffd75e';
      ctx.shadowBlur = 14 * devicePixelRatio;
      ctx.strokeStyle = '#ffe08a';
      ctx.globalAlpha = 0.55 * flicker;
      ctx.lineWidth = 1.3 * devicePixelRatio;
      ctx.beginPath();
      for (let s = 0; s <= jag; s++) {
        const st = Math.max(0, localT - 0.09 + (0.09 * s) / jag);
        const sx = a.x + (b.x - a.x) * st, sy = a.y + (b.y - a.y) * st;
        const wobble = Math.sin(t * 0.5 + s * 2 + d) * 3.5 * devicePixelRatio * (s / jag);
        const nx = -(b.y - a.y), ny = (b.x - a.x);
        const len = Math.hypot(nx, ny) || 1;
        const px = sx + (nx / len) * wobble, py = sy + (ny / len) * wobble;
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      const x = a.x + (b.x - a.x) * localT, y = a.y + (b.y - a.y) * localT;
      ctx.save();
      ctx.shadowColor = '#ffd75e';
      ctx.shadowBlur = 16 * devicePixelRatio;
      ctx.globalAlpha = Math.min(1, flicker);
      ctx.fillStyle = '#fff3cf';
      ctx.beginPath(); ctx.arc(x, y, 2.4 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // sub edges
    nodes.filter((n) => n.kind === 'sub').forEach((n) => {
      const parent = nodes.find((p) => p.key === n.parentKey);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.22 * dim(n.key);
      ctx.lineWidth = devicePixelRatio * 0.8;
      ctx.beginPath(); ctx.moveTo(parent.x, parent.y); ctx.lineTo(n.x, n.y); ctx.stroke();
    });

    // nodes
    nodes.forEach((n) => {
      const active = n.key === hoverKey;
      const a = dim(n.key);
      const isHub = n.kind === 'layer';
      const hubPulse = isHub ? 0.75 + Math.sin(t * 0.003 + n.x * 0.01) * 0.25 : 1;
      if (isHub) {
        ctx.save();
        ctx.shadowColor = '#ffd75e';
        ctx.shadowBlur = 18 * devicePixelRatio * hubPulse;
        ctx.globalAlpha = 0.95 * a * hubPulse * (active ? 1.15 : 1);
        ctx.fillStyle = '#ffdd7a';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (active ? 1.3 : 1), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.3 * a * hubPulse;
        ctx.strokeStyle = '#ffd75e';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else {
        ctx.globalAlpha = 0.6 * a * (active ? 1.15 : 1);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (active ? 1.3 : 1), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = (isHub ? 0.9 : 0.55) * a;
      ctx.fillStyle = isHub ? '#ffdd7a' : color;
      ctx.font = `${(isHub ? 12 : 9.5) * devicePixelRatio}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = n.x > w * 0.6 ? 'right' : 'left';
      const lx = n.x > w * 0.6 ? n.x - (n.r + 8 * devicePixelRatio) : n.x + n.r + 8 * devicePixelRatio;
      ctx.fillText(n.label, lx, n.y);
    });

    ctx.globalAlpha = 1;
    t += 1;
    if (!reduced) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  step();
})();
