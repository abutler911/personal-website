// ─── Theme ───
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("ab-theme") || "light";
root.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("ab-theme", next);
});

// ─── Text scramble ───
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#";

function scrambleText(element, delay) {
  const isLast = element.classList.contains("name-last");
  const finalText = element.textContent;

  const chars = finalText.split("").map((char) => ({
    final: char,
    isSpace: char === " ",
    resolved: false,
    el: null,
  }));

  const fragment = document.createDocumentFragment();

  chars.forEach((c) => {
    const span = document.createElement("span");
    span.className = "scramble-char" + (c.isSpace ? " space" : "");
    span.textContent = c.isSpace
      ? "\u00A0"
      : CHARS[Math.floor(Math.random() * CHARS.length)];
    span.style.opacity = "0";
    c.el = span;
    fragment.appendChild(span);
  });

  element.innerHTML = "";
  element.appendChild(fragment);

  setTimeout(() => {
    chars.forEach((c, i) => {
      setTimeout(() => {
        c.el.style.opacity = "1";
      }, i * 25);
    });

    const scrambleInterval = setInterval(() => {
      chars.forEach((c) => {
        if (!c.resolved && !c.isSpace) {
          c.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      });
    }, 55);

    const resolveStart = chars.length * 25 + 150;

    chars.forEach((c, i) => {
      setTimeout(
        () => {
          c.resolved = true;
          c.el.textContent = c.isSpace ? "\u00A0" : c.final;
          if (isLast) {
            c.el.style.fontStyle = "italic";
            c.el.style.color = "var(--accent)";
          }
          if (i === chars.length - 1) clearInterval(scrambleInterval);
        },
        resolveStart + i * 48,
      );
    });
  }, delay);
}

document.querySelectorAll("[data-scramble]").forEach((el) => {
  scrambleText(el, parseInt(el.dataset.delay) || 0);
});

// ─── Navbar scroll ───
const navbar = document.getElementById("navbar");
window.addEventListener(
  "scroll",
  () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  },
  { passive: true },
);

// ─── Mobile nav ───
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
function closeNav() {
  navLinks.classList.remove("open");
}

// ─── Scroll reveal ───
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".reveal, .project")
  .forEach((el) => observer.observe(el));

// ─── Animate progress bars ───
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const width = el.dataset.width;
        if (width) {
          setTimeout(() => {
            el.style.width = width + "%";
          }, 200);
        }
        barObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 },
);

document
  .querySelectorAll(".vc-bar-fill")
  .forEach((el) => barObserver.observe(el));

// ─── Smooth anchor scroll ───
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
