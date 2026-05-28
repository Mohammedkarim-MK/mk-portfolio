// =============================================================================
// Shared script for index.html + contact.html
// =============================================================================


// ----- Decoder-style typewriter on the role/name line -----------------------
(function decoder(){
  const target = document.getElementById('nameType');
  if (!target) return;
  const text = target.dataset.text || 'Mohammed Karim — Data Analyst · Developer';
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&!@<>/_=+0123456789';
  let revealed = 0;
  function tick() {
    let out = '';
    for (let i = 0; i < text.length; i++) {
      if (i < revealed) out += text[i];
      else if (text[i] === ' ') out += ' ';
      else out += charset[Math.floor(Math.random() * charset.length)];
    }
    target.textContent = out;
    if (revealed < text.length) {
      revealed += 1;
      setTimeout(tick, 52);
    } else {
      target.textContent = text;
    }
  }
  setTimeout(tick, 350);
})();

// ----- Activity heatmap (dashboard only) ------------------------------------
(function heatmap(){
  const hm = document.getElementById('heatmap');
  if (!hm) return;
  for (let c = 0; c < 18; c++) {
    const col = document.createElement('div');
    col.className = 'heatmap-col';
    for (let r = 0; r < 7; r++) {
      const cell = document.createElement('div');
      const w = Math.random();
      const level = w < 0.25 ? 0 : w < 0.50 ? 1 : w < 0.72 ? 2 : w < 0.90 ? 3 : 4;
      cell.className = `hm-cell hm${level}`;
      col.appendChild(cell);
    }
    hm.appendChild(col);
  }
})();

// ----- Scroll reveal: cards with slide direction awareness ------------------
(function reveal(){
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const colLeft = document.querySelector('.col-left');
  const colRight = document.querySelector('.col-right');

  cards.forEach(card => {
    if (colLeft && colLeft.contains(card)) card.classList.add('slide-left');
    else if (colRight && colRight.contains(card)) card.classList.add('slide-right');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      e.target.querySelectorAll('.skill-fill').forEach(el => {
        el.style.transform = `scaleX(${el.dataset.w})`;
      });
      e.target.querySelectorAll('.ring-val').forEach(el => {
        const pct = parseInt(el.dataset.pct);
        const circ = 2 * Math.PI * 28;
        setTimeout(() => { el.style.strokeDashoffset = circ - (pct / 100) * circ; }, 150);
      });
      observer.unobserve(e.target);
    });
  }, { threshold: 0.06 });

  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.045}s`;
    observer.observe(card);
  });
})();

// ----- Stat bars + counting numbers on load ---------------------------------
window.addEventListener('load', () => {
  document.querySelectorAll('.stat-fill').forEach(el => {
    setTimeout(() => { el.style.transform = `scaleX(${el.dataset.w})`; }, 500);
  });
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + Math.ceil(target / 40), target);
      el.textContent = cur + suffix;
      if (cur >= target) clearInterval(t);
    }, 28);
  });
});

// ----- Subtle 3D tilt on hero cards -----------------------------------------
(function tilt(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(max-width: 768px)').matches) return;
  document.querySelectorAll('.hero-card, .contact-hero').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 2.5}deg) rotateY(${x * 2.5}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ----- Hamburger menu -------------------------------------------------------
(function hamburger(){
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      btn.classList.remove('open');
      nav.classList.remove('open');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      btn.classList.remove('open');
      nav.classList.remove('open');
    }
  });
})();

// ----- Experience modal (dashboard only) ------------------------------------
function openModal(data) {
  const modal = document.getElementById('expModal');
  if (!modal) return;
  document.getElementById('modalTitle').textContent = data.title + ' · ' + data.company;
  document.getElementById('modalMeta').textContent = data.period + ' · ' + data.location;
  document.getElementById('modalBullets').innerHTML = data.bullets.map(b => `<li>${b}</li>`).join('');
  document.getElementById('modalTags').innerHTML = data.tags.map(t => `<span class="chip chip-rd">${t}</span>`).join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const modal = document.getElementById('expModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
(function modalEvents(){
  const modal = document.getElementById('expModal');
  if (!modal) return;
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

// ----- Contact form — live validation + email verification flow --------------
(function contactForm(){
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const emailInput   = document.getElementById('emailInput');
  const emailErr     = document.getElementById('emailErr');
  const submitBtn    = document.getElementById('submitBtn');
  const formStatus   = document.getElementById('formStatus');
  const verifyPanel  = document.getElementById('verifyPending');
  const verifyEmail  = document.getElementById('verifyEmailDisplay');
  const resendBtn    = document.getElementById('resendBtn');
  const resendStatus = document.getElementById('resendStatus');
  const backBtn      = document.getElementById('backToFormBtn');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function isValidEmail(v){ return EMAIL_RE.test(String(v).trim()); }

  function validateEmail(){
    const val = emailInput.value;
    if (val && !isValidEmail(val)){
      emailErr.textContent  = 'Please enter a valid email address.';
      emailInput.classList.add('input-invalid');
      submitBtn.disabled = true;
      return false;
    }
    emailErr.textContent = '';
    emailInput.classList.remove('input-invalid');
    submitBtn.disabled = false;
    return true;
  }

  emailInput.addEventListener('input', validateEmail);
  emailInput.addEventListener('blur',  validateEmail);

  // Store last payload so resend can replay it
  let lastPayload = null;

  async function submitContact(payload){
    submitBtn.disabled  = true;
    submitBtn.textContent = 'Sending…';
    formStatus.textContent = '';

    try {
      const res  = await fetch('https://mk-contact.mohammed-kareem7707.workers.dev', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success){
        // Show verification pending panel
        form.style.display          = 'none';
        verifyPanel.style.display   = 'block';
        verifyEmail.textContent     = payload.email;
        lastPayload = payload;
      } else {
        formStatus.textContent = '✗ ' + (json.error || 'Failed to send. Please try again.');
        formStatus.style.color = 'var(--neon)';
        submitBtn.disabled  = false;
        submitBtn.textContent = 'Send Message ↗';
      }
    } catch {
      formStatus.textContent = '✗ Network error — email me directly: mk.insight@outlook.com';
      formStatus.style.color = 'var(--neon)';
      submitBtn.disabled  = false;
      submitBtn.textContent = 'Send Message ↗';
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateEmail()) return;

    const fd = new FormData(form);
    const name    = (fd.get('name')    || '').trim();
    const email   = (fd.get('email')   || '').trim();
    const subject = (fd.get('subject') || '').trim();
    const message = (fd.get('message') || '').trim();

    if (!name || !email || !message){
      formStatus.textContent = '✗ Please fill in all required fields.';
      formStatus.style.color = 'var(--neon)';
      return;
    }

    await submitContact({ name, email, subject, message });
  });

  // Resend button
  if (resendBtn){
    resendBtn.addEventListener('click', async () => {
      if (!lastPayload) return;
      resendBtn.disabled   = true;
      resendStatus.textContent = 'Resending…';
      resendStatus.style.color = 'var(--muted)';

      try {
        const res  = await fetch('https://mk-contact.mohammed-kareem7707.workers.dev', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(lastPayload),
        });
        const json = await res.json();
        if (res.ok && json.success){
          resendStatus.textContent = '✓ Email resent! Check your inbox.';
          resendStatus.style.color = 'var(--neon-bright)';
        } else {
          resendStatus.textContent = json.error || 'Could not resend. Try again later.';
          resendStatus.style.color = 'var(--neon)';
        }
      } catch {
        resendStatus.textContent = 'Network error. Please try again.';
        resendStatus.style.color = 'var(--neon)';
      } finally {
        resendBtn.disabled = false;
        setTimeout(() => { resendStatus.textContent = ''; }, 4000);
      }
    });
  }

  // Back to form button
  if (backBtn){
    backBtn.addEventListener('click', () => {
      verifyPanel.style.display = 'none';
      form.style.display        = '';
      submitBtn.disabled        = false;
      submitBtn.textContent     = 'Send Message ↗';
      formStatus.textContent    = '';
    });
  }

  // Copy email button
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn){
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('mk.insight@outlook.com');
        formStatus.textContent = '✓ Email copied!';
        formStatus.style.color = 'var(--neon-bright)';
        setTimeout(() => { formStatus.textContent = ''; }, 2000);
      } catch {
        formStatus.textContent = 'Copy failed';
      }
    });
  }
})();

// ----- 3D photo: smooth lerp tilt + depth effects + glitch -------------------
(function photo3dTilt(){
  const el = document.getElementById('aboutPhoto3d');
  if (!el) return;

  const scene    = el.closest('.about-photo-scene');
  const glow     = scene && scene.querySelector('.photo-depth-glow');
  const floor    = scene && scene.querySelector('.photo-floor-shadow');

  let curX = 0, curY = 0, targetX = 0, targetY = 0;
  let hovering = false, raf = null;

  function lerp(a, b, t){ return a + (b - a) * t; }
  function clamp(v, mn, mx){ return Math.max(mn, Math.min(mx, v)); }

  function tick(){
    curX = lerp(curX, targetX, 0.085);
    curY = lerp(curY, targetY, 0.085);

    const absX = Math.abs(curX), absY = Math.abs(curY);
    const depth = clamp((absX + absY) * 0.5, 0, 20);

    // card tilt
    el.style.transform = `perspective(1100px) rotateX(${curX}deg) rotateY(${curY}deg) scale(${hovering ? 1.04 : 1})`;

    if (hovering) {
      // dynamic neon shadow grows with tilt depth
      el.style.boxShadow = `0 0 0 2px rgba(255,82,82,${0.58+depth*0.012}),0 ${52+depth*1.4}px ${105+depth*2.5}px rgba(0,0,0,0.88),0 0 ${62+depth*3.2}px rgba(255,42,42,${0.52+depth*0.018}),0 0 ${125+depth*5}px rgba(255,42,42,${0.16+depth*0.007})`;

      // depth glow shifts with tilt
      if (glow) {
        glow.style.transform = `translateX(${curY*0.8}px) translateY(${-curX*0.6}px) scale(${1+depth*0.015})`;
        glow.style.opacity = `${0.9 + depth * 0.02}`;
      }
      // floor shadow stretches with forward tilt
      if (floor) {
        const stretch = 1 + Math.max(0, curX) * 0.04;
        floor.style.transform = `scaleX(${stretch}) translateY(${Math.max(0,curX)*1.5}px)`;
        floor.style.opacity = `${0.7 + depth * 0.02}`;
      }
    } else {
      el.style.boxShadow = '';
      if (glow)  { glow.style.transform  = ''; glow.style.opacity  = ''; }
      if (floor) { floor.style.transform = ''; floor.style.opacity = ''; }
    }

    const still = absX < 0.04 && absY < 0.04;
    if (hovering || !still) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
      el.style.transform   = '';
      el.style.boxShadow   = '';
    }
  }

  el.addEventListener('mouseenter', () => {
    hovering = true;
    el.style.animation = 'neonRing 1.4s ease-in-out infinite';
    if (!raf) raf = requestAnimationFrame(tick);
  });

  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    targetX = -((e.clientY - r.top)  / r.height - 0.5) * 30;
    targetY =  ((e.clientX - r.left) / r.width  - 0.5) * 30;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  el.addEventListener('mouseleave', () => {
    hovering = false;
    targetX = 0; targetY = 0;
    el.style.animation = '';
    if (!raf) raf = requestAnimationFrame(tick);
  });
})();


// ----- Ember & smoke background — dark fire particle aesthetic -----------------
(function fireBackground(){
  if (document.getElementById('fireCanvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'fireCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0;

  function isLightTheme(){ return document.documentElement.getAttribute('data-theme') === 'light'; }

  function resize(){
    W = innerWidth; H = innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const mobile = matchMedia('(max-width:768px)').matches;
  const COUNT  = mobile ? 160 : 380;

  // --- Atmospheric fog clouds — slow drifting red smoke masses ---
  const CLOUD_N = mobile ? 5 : 9;
  let clouds = [];

  function makeClouds(){
    clouds = Array.from({length: CLOUD_N}, (_, i) => ({
      x: Math.random() * W,
      y: H * 0.2 + Math.random() * H * 0.8,
      rx: (0.16 + Math.random() * 0.32) * W,
      ry: (0.10 + Math.random() * 0.24) * H,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(0.03 + Math.random() * 0.07),
      ph: Math.random() * Math.PI * 2,
      ps: 0.003 + Math.random() * 0.005,
      alpha: 0.07 + Math.random() * 0.10,
      warm: Math.random()
    }));
  }

  function drawClouds(){
    ctx.globalCompositeOperation = 'source-over';
    for (const c of clouds){
      c.x  += c.vx;
      c.y  += c.vy;
      c.ph += c.ps;
      if (c.y < -c.ry * 2){ c.y = H + c.ry; c.x = Math.random() * W; }
      if (c.x < -c.rx) c.x = W + c.rx;
      if (c.x > W + c.rx) c.x = -c.rx;

      const pulse = 0.88 + Math.sin(c.ph) * 0.12;
      const a  = c.alpha * pulse;
      const rx = c.rx * pulse;
      const ry = c.ry * pulse;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      if (isLightTheme()){
        const la = a * 0.55;
        g.addColorStop(0,    `rgba(255,160,160,${la * 1.4})`);
        g.addColorStop(0.30, `rgba(240,110,110,${la * 0.70})`);
        g.addColorStop(0.62, `rgba(210,70,70,${la * 0.28})`);
        g.addColorStop(1,    'rgba(190,50,50,0)');
      } else if (c.warm > 0.55){
        g.addColorStop(0,    `rgba(210,52,14,${a * 1.4})`);
        g.addColorStop(0.28, `rgba(170,28,8,${a * 0.80})`);
        g.addColorStop(0.60, `rgba(110,10,3,${a * 0.32})`);
        g.addColorStop(1,    'rgba(45,3,1,0)');
      } else {
        g.addColorStop(0,    `rgba(155,10,4,${a})`);
        g.addColorStop(0.34, `rgba(115,7,2,${a * 0.58})`);
        g.addColorStop(0.66, `rgba(65,3,1,${a * 0.18})`);
        g.addColorStop(1,    'rgba(22,1,0,0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // --- Ember / spark particles ---
  function Ember(){ this.reset(true); }

  Ember.prototype.reset = function(init){
    this.depth = Math.random();           // 0=far  1=near
    const ds   = 0.28 + this.depth * 0.72;

    const r = Math.random();
    this.type = r < 0.44 ? 'mote' : r < 0.80 ? 'ember' : 'spark';

    this.x  = (Math.random() * 1.10 - 0.05) * W;
    this.y  = init ? Math.random() * H : H * (0.55 + Math.random() * 0.55);
    this.ph = Math.random() * Math.PI * 2;
    this.ps = 0.038 + Math.random() * 0.082;

    if (this.type === 'mote'){
      this.r    = (0.28 + Math.random() * 1.20) * ds;
      this.vx   = (Math.random() - 0.5) * 0.65;
      this.vy   = -(0.18 + Math.random() * 0.52) * ds;
      this.ml   = 140 + Math.random() * 200;
      this.drag = 0.997;
    } else if (this.type === 'ember'){
      this.r    = (0.8 + Math.random() * 3.2) * ds;
      this.vx   = (Math.random() - 0.5) * 1.20;
      this.vy   = -(0.32 + Math.random() * 0.95) * ds;
      this.ml   = 100 + Math.random() * 160;
      this.drag = 0.995;
    } else {
      this.r    = (0.6 + Math.random() * 2.4) * ds;
      this.vx   = (Math.random() - 0.5) * 2.20;
      this.vy   = -(0.65 + Math.random() * 1.70) * ds;
      this.ml   = 65 + Math.random() * 110;
      this.drag = 0.992;
    }

    this.life = init ? Math.random() * this.ml : 0;
  };

  Ember.prototype.update = function(){
    this.life++;
    this.ph += this.ps;
    this.x  += this.vx + Math.sin(this.ph * 0.8) * 0.24;
    this.y  += this.vy;
    this.vx *= this.drag;
    this.vy  = this.vy * this.drag - 0.006;   // upward buoyancy
    return this.life < this.ml;
  };

  Ember.prototype.draw = function(){
    const p  = this.life / this.ml;
    const lf = p < 0.08 ? p / 0.08 : p > 0.65 ? 1 - (p - 0.65) / 0.35 : 1;
    const fl = 0.70 + Math.sin(this.ph) * 0.30;
    const a  = lf * fl;
    if (a < 0.01) return;

    const x = this.x, y = this.y, r = this.r;

    if (this.type === 'mote'){
      // Tiny dim background speck — depth-tinted
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.round(170 + this.depth * 85)},${Math.round(this.depth * 55)},${Math.round(this.depth * 12)},${a * 0.60})`;
      ctx.fill();
      return;
    }

    if (this.type === 'ember'){
      // Soft glowing blob — colour shifts warm→red with depth
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 4.5);
      gr.addColorStop(0,    `rgba(255,${Math.round(105 + this.depth * 85)},${Math.round(this.depth * 38)},${a})`);
      gr.addColorStop(0.22, `rgba(255,${Math.round(50 + this.depth * 38)},8,${a * 0.72})`);
      gr.addColorStop(0.52, `rgba(195,14,4,${a * 0.28})`);
      gr.addColorStop(0.80, `rgba(115,5,2,${a * 0.07})`);
      gr.addColorStop(1,    'rgba(38,1,0,0)');
      ctx.beginPath(); ctx.arc(x, y, r * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();
      return;
    }

    // spark — 4-layer glow + white-hot core
    ctx.beginPath(); ctx.arc(x, y, r * 9, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,28,4,${a * 0.07 * this.depth})`; ctx.fill();

    ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,68,14,${a * 0.22 * this.depth})`; ctx.fill();

    ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,135,45,${a * 0.82})`; ctx.fill();

    ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,235,185,${a})`; ctx.fill();
  };

  function drawTopMask(){
    ctx.globalCompositeOperation = 'source-over';
    if (isLightTheme()){
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.60);
      g.addColorStop(0,    'rgba(245,245,247,0.96)');
      g.addColorStop(0.22, 'rgba(245,245,247,0.78)');
      g.addColorStop(0.48, 'rgba(245,245,247,0.30)');
      g.addColorStop(0.75, 'rgba(245,245,247,0.06)');
      g.addColorStop(1,    'rgba(245,245,247,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.60);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.68);
      g.addColorStop(0,    'rgba(2,2,2,0.97)');
      g.addColorStop(0.24, 'rgba(2,2,2,0.88)');
      g.addColorStop(0.52, 'rgba(2,2,2,0.42)');
      g.addColorStop(0.78, 'rgba(2,2,2,0.08)');
      g.addColorStop(1,    'rgba(2,2,2,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.68);
    }
  }

  const pool = [];
  for (let i = 0; i < COUNT; i++) pool.push(new Ember());

  // --- Network / neural node layer ---
  const NODE_COUNT = mobile ? 18 : 34;
  const CONNECT_DIST = mobile ? 140 : 200;
  let nodes = [];

  function makeNodes(){
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      z:    0.2 + Math.random() * 0.8,       // depth: 0=far, 1=near
      vx:   (Math.random() - 0.5) * 0.28,
      vy:   (Math.random() - 0.5) * 0.18,
      ph:   Math.random() * Math.PI * 2,
      ps:   0.012 + Math.random() * 0.018,   // pulse speed
      r:    1.5 + Math.random() * 2.5,
    }));
  }

  function drawNetwork(){
    ctx.globalCompositeOperation = 'source-over';

    // Update positions
    for (const n of nodes){
      n.x  += n.vx;
      n.y  += n.vy;
      n.ph += n.ps;
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;
    }

    // Draw edges (connecting lines)
    for (let i = 0; i < nodes.length; i++){
      for (let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONNECT_DIST) continue;

        const edgeMult = isLightTheme() ? 0.45 : 0.22;
        const alpha = (1 - dist / CONNECT_DIST) * edgeMult * ((a.z + b.z) * 0.5);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(200,30,30,${alpha})`;
        ctx.lineWidth   = 0.6 * ((a.z + b.z) * 0.5);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const n of nodes){
      const pulse = 0.7 + Math.sin(n.ph) * 0.3;
      const r     = n.r * n.z * pulse;
      const alpha = 0.55 * n.z * pulse;

      // Outer glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
      glow.addColorStop(0,   `rgba(255,82,42,${alpha * 0.9})`);
      glow.addColorStop(0.4, `rgba(255,42,42,${alpha * 0.4})`);
      glow.addColorStop(1,   'rgba(255,42,42,0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${Math.round(90 + n.z * 80)},${Math.round(n.z * 30)},${alpha + 0.3})`;
      ctx.fill();
    }
  }

  // --- Perspective grid at the bottom ---
  function drawGrid(){
    const horizon  = H * 0.72;
    const vanishX  = W * 0.5;
    const gridW    = W * 1.4;
    const gridStep = 0.06;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 0.7;

    // Horizontal lines
    for (let p = 0; p <= 1; p += gridStep){
      const y    = horizon + (H - horizon) * Math.pow(p, 1.6);
      const fadP = Math.pow(p, 0.6);
      const a    = fadP * 0.12;
      if (a < 0.005) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.strokeStyle = `rgba(255,42,42,${a})`;
      ctx.stroke();
    }

    // Vertical lines radiating from vanishing point
    const VLINES = 14;
    for (let i = 0; i <= VLINES; i++){
      const t    = i / VLINES;
      const xBot = -gridW * 0.5 + gridW * t;
      const a    = 0.08 * (1 - Math.abs(t - 0.5) * 1.6);
      if (a < 0.005) continue;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(W * 0.5 + (xBot - W * 0.5), H + 10);
      ctx.strokeStyle = `rgba(255,42,42,${a})`;
      ctx.stroke();
    }
  }

  let t = 0;

  function frame(){
    ctx.clearRect(0, 0, W, H);
    t++;

    // Layer 1 — Atmospheric fog / red smoke
    drawClouds();

    // Layer 2 — Network nodes & grid (below embers so embers sit on top)
    drawNetwork();
    drawGrid();

    // Layer 3 — Embers (additive blend dark mode; source-over light mode)
    ctx.globalCompositeOperation = isLightTheme() ? 'source-over' : 'lighter';
    if (t % 10 === 0) pool.sort((a, b) => a.depth - b.depth);
    for (let i = 0; i < pool.length; i++){
      if (!pool[i].update()) pool[i].reset(false);
      else pool[i].draw();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Layer 4 — Top fade mask so UI text stays readable
    drawTopMask();

    requestAnimationFrame(frame);
  }

  resize();
  makeClouds();
  makeNodes();
  frame();
  window.addEventListener('resize', () => { resize(); makeClouds(); makeNodes(); });
})();


// =============================================================================
// Light / Dark Theme Toggle
// =============================================================================
(function themeToggle(){
  const html = document.documentElement;
  const STORAGE_KEY = 'mk_theme';

  function applyTheme(theme){
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  applyTheme(localStorage.getItem(STORAGE_KEY) || 'dark');

  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function(){
      const isLight = html.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
})();

// =============================================================================
// Cookie Consent Banner
// =============================================================================
(function cookieConsent(){
  const STORAGE_KEY = 'mk_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY)) return;   // already decided

  // Inject HTML
  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.innerHTML = `
    <div class="cookie-inner">
      <div class="cookie-icon">🍪</div>
      <div class="cookie-text">
        <strong>We use cookies</strong>
        <span>This site uses cookies to enhance your experience and analyse traffic. No personal data is sold.</span>
      </div>
      <div class="cookie-btns">
        <button id="cookieAccept" class="cookie-btn cookie-btn-accept">Accept All</button>
        <button id="cookieReject" class="cookie-btn cookie-btn-reject">Reject</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // Slide in after a short delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('cookie-visible'));
  });

  function dismiss(accepted){
    localStorage.setItem(STORAGE_KEY, accepted ? 'accepted' : 'rejected');
    banner.classList.add('cookie-out');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }

  document.getElementById('cookieAccept').addEventListener('click', () => {
    const btn = document.getElementById('cookieAccept');
    // Checkmark burst animation
    btn.textContent = '✓ Done!';
    btn.classList.add('cookie-btn-accepted');

    // Burst particles
    spawnBurst(btn);

    setTimeout(() => dismiss(true), 900);
  });

  document.getElementById('cookieReject').addEventListener('click', () => dismiss(false));

  // Mini confetti burst on accept
  function spawnBurst(anchor){
    const rect    = anchor.getBoundingClientRect();
    const cx      = rect.left + rect.width  / 2;
    const cy      = rect.top  + rect.height / 2;
    const colours = ['#ff2a2a','#ff5252','#ff8a8a','#ffffff','#ffcc00'];

    for (let i = 0; i < 22; i++){
      const dot = document.createElement('span');
      dot.className = 'cookie-burst-dot';
      const angle = (i / 22) * Math.PI * 2;
      const dist  = 28 + Math.random() * 42;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist;
      dot.style.cssText = `
        left:${cx}px; top:${cy}px;
        background:${colours[i % colours.length]};
        --tx:${tx}px; --ty:${ty}px;
      `;
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    }
  }
})();

// =============================================================================
// Neo-Glass White Theme Effects — Glass Grid + Parallax Tilt
// =============================================================================
(function glassEffects(){
  const GRID_SIZE = 60;
  const DOT_R     = 2.2;

  function isLight(){ return document.documentElement.getAttribute('data-theme') === 'light'; }

  // ── Glass Grid Canvas ──────────────────────────────────────────────────────
  let gridCanvas = null, gridCtx = null, gridRaf = null;
  let gridScroll = 0;

  function createGridCanvas(){
    if (gridCanvas) return;
    gridCanvas = document.createElement('canvas');
    gridCanvas.id = 'glassGrid';
    gridCanvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0;transition:opacity 0.6s ease;';
    document.body.insertBefore(gridCanvas, document.body.firstChild);
    gridCtx = gridCanvas.getContext('2d');
    resizeGrid();
    window.addEventListener('resize', resizeGrid);
    window.addEventListener('scroll', onGridScroll, { passive: true });
  }

  function resizeGrid(){
    if (!gridCanvas) return;
    gridCanvas.width  = window.innerWidth;
    gridCanvas.height = window.innerHeight;
  }

  function onGridScroll(){ gridScroll = window.scrollY; }

  function drawGrid(){
    if (!gridCtx || !gridCanvas) return;
    const w = gridCanvas.width, h = gridCanvas.height;
    gridCtx.clearRect(0, 0, w, h);

    const offset = (gridScroll * 0.08) % GRID_SIZE;

    // Grid lines
    gridCtx.strokeStyle = 'rgba(0,0,0,0.045)';
    gridCtx.lineWidth   = 1;
    gridCtx.beginPath();
    for (let x = (offset % GRID_SIZE); x < w + GRID_SIZE; x += GRID_SIZE){
      gridCtx.moveTo(x, 0); gridCtx.lineTo(x, h);
    }
    for (let y = (offset % GRID_SIZE); y < h + GRID_SIZE; y += GRID_SIZE){
      gridCtx.moveTo(0, y); gridCtx.lineTo(w, y);
    }
    gridCtx.stroke();

    // Neon red intersection dots
    gridCtx.fillStyle = 'rgba(200,30,30,0.18)';
    const startX = offset % GRID_SIZE;
    const startY = offset % GRID_SIZE;
    for (let x = startX; x < w + GRID_SIZE; x += GRID_SIZE){
      for (let y = startY; y < h + GRID_SIZE; y += GRID_SIZE){
        gridCtx.beginPath();
        gridCtx.arc(x, y, DOT_R, 0, Math.PI * 2);
        gridCtx.fill();
      }
    }
  }

  function gridLoop(){
    if (!isLight()){ gridRaf = null; return; }
    drawGrid();
    gridRaf = requestAnimationFrame(gridLoop);
  }

  function startGrid(){
    createGridCanvas();
    if (gridCanvas) gridCanvas.style.opacity = '1';
    if (!gridRaf) gridLoop();
  }

  function stopGrid(){
    if (gridCanvas) gridCanvas.style.opacity = '0';
    if (gridRaf){ cancelAnimationFrame(gridRaf); gridRaf = null; }
  }

  // ── 3D Parallax Tilt ──────────────────────────────────────────────────────
  const TILT_MAX   = 12;   // degrees
  const TILT_SCALE = 1.03;

  const TILT_SELECTORS = [
    '.card', '.hero-card', '.stat-card', '.about-profile-card',
    '.about-stat', '.contact-form-card', '.contact-info-card',
    '.chat-bubble-wrap', '#aboutPhoto3d'
  ].join(',');

  function getTiltTargets(){
    return Array.from(document.querySelectorAll(TILT_SELECTORS));
  }

  function applyTilt(el, e){
    const rect = el.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rx   =  dy * TILT_MAX;  // tilt around X axis (vertical mouse → pitch)
    const ry   = -dx * TILT_MAX;  // tilt around Y axis (horizontal mouse → yaw)

    // Depth shadow reacts to cursor
    const shadowX = dx * 10;
    const shadowY = dy * 10;

    el.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${TILT_SCALE})`;
    el.style.boxShadow  =
      `${shadowX}px ${shadowY}px 40px rgba(255,42,42,0.22),` +
      `0 0 0 1px rgba(255,82,82,0.38),` +
      `0 20px 60px rgba(0,0,0,0.12)`;
    el.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear';
  }

  function resetTilt(el){
    el.style.transform  = '';
    el.style.boxShadow  = '';
    el.style.transition = 'transform 0.5s cubic-bezier(.2,.9,.3,1), box-shadow 0.5s cubic-bezier(.2,.9,.3,1)';
  }

  const tiltHandlers = new WeakMap();

  function bindTilt(el){
    if (tiltHandlers.has(el)) return;
    const onMove  = e => applyTilt(el, e);
    const onLeave = () => resetTilt(el);
    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);
    tiltHandlers.set(el, { onMove, onLeave });
    el.style.willChange = 'transform';
  }

  function unbindTilt(el){
    const h = tiltHandlers.get(el);
    if (!h) return;
    el.removeEventListener('mousemove',  h.onMove);
    el.removeEventListener('mouseleave', h.onLeave);
    tiltHandlers.delete(el);
    el.style.willChange  = '';
    el.style.transform   = '';
    el.style.boxShadow   = '';
    el.style.transition  = '';
  }

  function enableTilt(){
    getTiltTargets().forEach(bindTilt);
  }

  function disableTilt(){
    getTiltTargets().forEach(unbindTilt);
  }

  // Watch for dynamically added cards (e.g. chat messages)
  let cardObserver = null;
  function watchNewCards(){
    if (cardObserver) return;
    cardObserver = new MutationObserver(mutations => {
      if (!isLight()) return;
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches && node.matches(TILT_SELECTORS)) bindTilt(node);
          node.querySelectorAll && node.querySelectorAll(TILT_SELECTORS).forEach(bindTilt);
        });
      });
    });
    cardObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopWatchingCards(){
    if (cardObserver){ cardObserver.disconnect(); cardObserver = null; }
  }

  // ── Theme Observer ────────────────────────────────────────────────────────
  function onThemeChange(light){
    if (light){
      startGrid();
      enableTilt();
      watchNewCards();
    } else {
      stopGrid();
      disableTilt();
      stopWatchingCards();
    }
  }

  const themeObserver = new MutationObserver(() => {
    onThemeChange(isLight());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── Boot ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    if (isLight()) onThemeChange(true);
  });
})();
