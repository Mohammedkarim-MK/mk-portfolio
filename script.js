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
      // Submit to Cloudflare Worker — secure backend, emails Mohammed on every submission
      const CONTACT_WORKER = 'https://mk-contact.mohammed-kareem7707.workers.dev'; // Cloudflare Worker — contact backend
      const res = await fetch(CONTACT_WORKER, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok){
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
