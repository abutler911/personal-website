// ─── Text scramble effect ───
const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

function scrambleText(element, delay) {
  // Get the plain text, ignoring HTML tags
  const finalText = element.textContent;
  const isItalic = element.querySelector('.italic') !== null;

  // Build character spans
  const chars = finalText.split('').map((char, i) => ({
    final: char,
    isSpace: char === ' ',
    resolved: false,
    el: null,
  }));

  // Clear element and insert character spans
  const wrapper = isItalic
    ? document.createElement('em')
    : document.createDocumentFragment();
  if (isItalic) wrapper.className = 'italic';

  chars.forEach((c) => {
    const span = document.createElement('span');
    span.className = 'scramble-char' + (c.isSpace ? ' space' : '');
    span.textContent = c.isSpace
      ? '\u00A0'
      : CHARS[Math.floor(Math.random() * CHARS.length)];
    span.style.opacity = '0';
    c.el = span;
    wrapper.appendChild(span);
  });

  element.innerHTML = '';
  element.appendChild(wrapper);

  // Phase 1: Stagger-reveal all chars as random glyphs
  setTimeout(() => {
    chars.forEach((c, i) => {
      setTimeout(() => {
        c.el.style.opacity = '1';
        if (!c.isSpace) {
          c.el.classList.add('scrambling');
        }
      }, i * 30);
    });

    // Phase 2: Scramble loop — randomize unresolved chars
    const scrambleInterval = setInterval(() => {
      chars.forEach((c) => {
        if (!c.resolved && !c.isSpace) {
          c.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      });
    }, 50);

    // Phase 3: Resolve chars left-to-right
    const resolveStart = chars.length * 30 + 200;
    chars.forEach((c, i) => {
      setTimeout(
        () => {
          c.resolved = true;
          c.el.textContent = c.isSpace ? '\u00A0' : c.final;
          c.el.classList.remove('scrambling');
          c.el.classList.add('resolved');

          // Stop interval after last char resolves
          if (i === chars.length - 1) {
            clearInterval(scrambleInterval);
          }
        },
        resolveStart + i * 60
      );
    });
  }, delay);
}

// Init scramble on all marked elements
document.querySelectorAll('[data-scramble]').forEach((el) => {
  const delay = parseInt(el.dataset.delay, 10) || 0;
  scrambleText(el, delay);
});

// ─── Navbar scroll effect ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── Mobile nav toggle ───
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

function closeNav() {
  navLinks.classList.remove('open');
}

// ─── Scroll reveal ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => observer.observe(el));

// ─── Smooth anchor scroll ───
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
