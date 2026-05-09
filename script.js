/* ================================================================
   PORTFOLIO — script.js
================================================================ */

/* ── Theme Toggle ─────────────────────────────────────────────── */
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

themeToggleBtn.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

/* ── Navbar: scroll state + active link ───────────────────────── */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  /* Scrolled class */
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  /* Active nav link */
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Mobile hamburger ─────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('nav-list');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navList.classList.toggle('open');
  document.body.style.overflow = navList.classList.contains('open') ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navList.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll Reveal ────────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      /* Stagger siblings inside same parent */
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Typed / animated hero subtitle ──────────────────────────── */
(function initTyped() {
  const phrases = [
    'precise digital solutions.',
    'full-stack web apps.',
    'clean user experiences.',
  ];

  const heroSub = document.querySelector('.hero-sub');
  if (!heroSub) return;

  const prefix = 'I build ';
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pause = false;

  function type() {
    if (pause) { setTimeout(type, 1600); pause = false; return; }

    const current = phrases[phraseIdx];
    heroSub.textContent = prefix + current.slice(0, charIdx);

    if (!deleting && charIdx === current.length) {
      pause = true; deleting = true; setTimeout(type, 1600); return;
    }
    if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }

    charIdx += deleting ? -1 : 1;
    setTimeout(type, deleting ? 40 : 75);
  }

  /* Start after the reveal animation */
  setTimeout(type, 1200);
})();

/* ── Smooth counter animation for About stats ─────────────────── */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const suffix = el.textContent.replace(/\d+/, '');

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat-num');
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const match = el.textContent.match(/(\d+)/);
      if (match) animateCounter(el, parseInt(match[1]));
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statsObserver.observe(el));

/* ── Contact form — EmailJS integration ───────────────────────── */
// ┌─────────────────────────────────────────────────────────┐
// │ SETUP STEPS (do once):                                  │
// │ 1. Go to https://www.emailjs.com → sign up free         │
// │ 2. Add an Email Service (Gmail / Outlook)               │
// │ 3. Create an Email Template using these variables:      │
// │      {{from_name}}, {{from_email}},                     │
// │      {{subject}}, {{message}}                           │
// │ 4. Paste your real IDs into the 3 constants below       │
// └─────────────────────────────────────────────────────────┘
const EMAILJS_PUBLIC_KEY = 'OmsYpCfkBOF2HkCry';   // Account → API Keys
const EMAILJS_SERVICE_ID = 'service_lxeryyo';   // Email Services
const EMAILJS_TEMPLATE_ID = 'template_1cfilsb';  // Email Templates

if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const formError = document.getElementById('form-error');

function showMsg(el, text) {
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 7000);
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  formSuccess.classList.remove('show');
  formError.classList.remove('show');

  btn.textContent = 'Sending…';
  btn.disabled = true;

  // ── Real send via EmailJS ───────────────────────────────
  try {
    await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
    btn.textContent = original;
    btn.disabled = false;
    form.reset();
    showMsg(formSuccess, '✓ Message sent! Krish will be in touch soon.');
  } catch (err) {
    console.error('EmailJS error:', err);
    btn.textContent = original;
    btn.disabled = false;
    showMsg(formError, '✗ Could not send. Please email directly at krish@example.com');
  }
});

/* ── Skill tag ripple ─────────────────────────────────────────── */
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute; border-radius:50%; background:rgba(255,255,255,0.5);
      width:60px; height:60px;
      left:${e.clientX - rect.left - 30}px;
      top:${e.clientY - rect.top - 30}px;
      transform:scale(0); animation:ripple 0.5s ease-out forwards;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

/* Inject ripple keyframes */
const style = document.createElement('style');
style.textContent = `@keyframes ripple { to { transform:scale(3); opacity:0; } }`;
document.head.appendChild(style);

/* ── Parallax hero text (subtle) ─────────────────────────────── */
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const y = window.scrollY;
  const content = hero.querySelector('.hero-content');
  if (content) content.style.transform = `translateY(${y * 0.18}px)`;
  const si = document.getElementById('scroll-indicator');
  if (si) si.style.opacity = Math.max(0, 1 - y / 300);
}, { passive: true });

/* ── Page load progress bar ───────────────────────────────────── */
(function initLoader() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed; top:0; left:0; height:3px; width:0;
    background:var(--accent); z-index:99999;
    transition:width 0.4s ease, opacity 0.4s ease;
  `;
  document.body.prepend(bar);

  let w = 0;
  const iv = setInterval(() => {
    w = Math.min(w + Math.random() * 15, 85);
    bar.style.width = w + '%';
  }, 200);

  window.addEventListener('load', () => {
    clearInterval(iv);
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; }, 400);
    setTimeout(() => bar.remove(), 800);
  });
})();

/* ── Keyboard nav: skip to main ───────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hamburger.classList.remove('open');
    navList.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── Back to Top Button ───────────────────────────────────────── */
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('%c KP. Portfolio ', 'background:#e04e2a;color:#fff;font-weight:900;font-size:14px;padding:6px 10px;border-radius:4px;');
console.log('%c Built with ❤️ and vanilla JS ', 'color:#555;font-size:11px;');
