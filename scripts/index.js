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
  // We get the raw text, but we will apply the <em> styling via CSS/JS
  // to avoid the <em> tag being deleted by .textContent updates.
  const isLast = element.classList.contains("name-last");
  const finalText = element.textContent.trim();

  const chars = finalText.split("").map((char) => ({
    final: char,
    isSpace: char === " ",
    resolved: false,
    el: null,
  }));

  element.innerHTML = "";

  chars.forEach((c) => {
    const span = document.createElement("span");
    span.className = "scramble-char" + (c.isSpace ? " space" : "");
    span.style.opacity = "0";
    // Apply the "Butler" styling to each individual character span
    if (isLast && !c.isSpace) {
      span.style.fontStyle = "italic";
      span.style.color = "var(--accent)";
    }
    c.el = span;
    element.appendChild(span);
  });

  setTimeout(() => {
    // 1. Fade in the scrambled characters
    chars.forEach((c, i) => {
      setTimeout(() => {
        c.el.style.opacity = "1";
      }, i * 25);
    });

    // 2. Continuous scrambling loop
    const scrambleInterval = setInterval(() => {
      chars.forEach((c) => {
        if (!c.resolved && !c.isSpace) {
          c.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      });
    }, 55);

    // 3. Resolve characters one by one
    const resolveStart = chars.length * 25 + 150;
    chars.forEach((c, i) => {
      setTimeout(
        () => {
          c.resolved = true;
          c.el.textContent = c.isSpace ? "\u00A0" : c.final;

          if (i === chars.length - 1) {
            clearInterval(scrambleInterval);
          }
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

// ─── CONFIG ───────────────────────────────────────────────────────

const TICKERS = ["NVDA", "SPY", "AAPL"];

const BOOT_LINES = [
  { text: "AFB DATA TERMINAL  v3.1.4", cls: "" },
  { text: "────────────────────────────", cls: "dim" },
  { text: "SYS  ....  OK", cls: "ok" },
  { text: "NET  ....  OK", cls: "ok" },
  { text: "CONNECTING TO MARKET FEED...", cls: "" },
  { text: "STREAM ESTABLISHED", cls: "ok" },
  { text: "LOADING EQUITY DATA...", cls: "" },
  { text: "────────────────────────────", cls: "dim" },
  { text: "READY.", cls: "" },
];

// ─── BOOT SEQUENCE ────────────────────────────────────────────────
function runBootSequence() {
  const bootEl = document.getElementById("bootLines");
  const overlay = document.getElementById("termBoot");
  const body = document.getElementById("termBody");

  if (!bootEl || !overlay || !body) return;

  let delay = 120;

  BOOT_LINES.forEach((item) => {
    setTimeout(() => {
      const line = document.createElement("div");
      line.className = "boot-line" + (item.cls ? ` ${item.cls}` : "");
      line.textContent = item.text;
      bootEl.appendChild(line);
    }, delay);
    delay += 170;
  });

  // Fade out boot, reveal terminal
  setTimeout(() => {
    overlay.classList.add("hidden");
    body.style.opacity = "1";
    // First data fetch
    fetchAllTickers();
  }, delay + 400);
}

// ─── LIVE CLOCK ───────────────────────────────────────────────────
function tickClock() {
  const el = document.getElementById("termClock");
  if (!el) return;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

setInterval(tickClock, 1000);
tickClock();

// ─── MARKET STATUS ────────────────────────────────────────────────
function refreshStatus() {
  const el = document.getElementById("termStatus");
  if (!el) return;

  const ny = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const d = new Date(ny);
  const day = d.getDay();
  const h = d.getHours();
  const m = d.getMinutes();

  const isOpen =
    day !== 0 && day !== 6 && (h > 9 || (h === 9 && m >= 30)) && h < 16;

  if (isOpen) {
    el.textContent = "● LIVE";
    el.className = "term-status live";
  } else {
    el.textContent = "○ CLOSED";
    el.className = "term-status offline";
  }
}

refreshStatus();
setInterval(refreshStatus, 30_000);

// ─── SPARKLINE ────────────────────────────────────────────────────
/**
 * Builds a sparkline SVG from a series of price points.
 * Uses a polyline + area fill + end-dot.
 */
function drawSparkline(svgId, prices, direction) {
  const svg = document.getElementById(svgId);
  if (!svg || !prices || prices.length < 2) return;

  svg.innerHTML = "";

  const W = 56,
    H = 18,
    PAD_X = 2,
    PAD_Y = 2;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pts = prices.map((p, i) => {
    const x = PAD_X + (i / (prices.length - 1)) * (W - PAD_X * 2);
    const y = H - PAD_Y - ((p - min) / range) * (H - PAD_Y * 2);
    return [x, y];
  });

  const ptStr = pts.map(([x, y]) => `${x},${y}`).join(" ");

  // Area
  const areaStr = `${PAD_X},${H} ${ptStr} ${W - PAD_X},${H}`;
  const areaColor =
    direction === "up"
      ? "#4caf50"
      : direction === "down"
        ? "#ef5350"
        : "#9b1c1c";

  const area = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon",
  );
  area.setAttribute("points", areaStr);
  area.setAttribute("class", "spark-area");
  area.setAttribute("fill", areaColor);
  svg.appendChild(area);

  // Line
  const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline",
  );
  line.setAttribute("points", ptStr);
  line.setAttribute("class", `spark-line ${direction}`);
  svg.appendChild(line);

  // End dot
  const [lx, ly] = pts[pts.length - 1];
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", lx);
  dot.setAttribute("cy", ly);
  dot.setAttribute("r", "1.8");
  dot.setAttribute("class", `spark-dot ${direction}`);
  svg.appendChild(dot);
}

/**
 * Since Finnhub free tier doesn't give candle history on a simple call,
 * we synthesize a plausible 12-point walk ending at currentPrice
 * that reflects changePercent directionally.
 */
function syntheticSparkData(currentPrice, changePct) {
  const N = 12;
  const startPrice = currentPrice / (1 + changePct / 100);
  const drift = (currentPrice - startPrice) / (N - 1);
  const volatility = Math.abs(changePct) * 0.006 * currentPrice;

  const pts = [startPrice];
  for (let i = 1; i < N - 1; i++) {
    const prev = pts[i - 1];
    const noise = (Math.random() - 0.45) * volatility;
    pts.push(prev + drift + noise);
  }
  pts.push(currentPrice);
  return pts;
}

// ─── PRICE DISPLAY ────────────────────────────────────────────────
function formatPrice(price) {
  if (price >= 1000) {
    return (
      "$" +
      price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return "$" + price.toFixed(2);
}

function formatChange(pct) {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function rowFlash(ticker, direction) {
  const row = document.querySelector(`.term-row[data-ticker="${ticker}"]`);
  if (!row) return;
  row.classList.remove("flash-up", "flash-down");
  // Force reflow so animation restarts
  void row.offsetWidth;
  row.classList.add(direction === "up" ? "flash-up" : "flash-down");
}

// ─── TICKER TAPE UPDATE ───────────────────────────────────────────
function updateTape() {
  const tape = document.getElementById("termTape");
  if (!tape) return;

  const segments = TICKERS.map((t) => {
    const price = document.getElementById(`price-${t}`)?.textContent ?? "···";
    const change = document.getElementById(`chg-${t}`)?.textContent ?? "";
    return `${t} ${price} ${change}`;
  });

  const content =
    segments.join("  ·  ") + "  ·  SLC UT · 40.76°N 111.89°W  ·  ";
  // Double it for seamless loop
  tape.textContent = content + content;
}

// ─── FETCH & RENDER ───────────────────────────────────────────────
async function fetchTicker(symbol) {
  const res = await fetch(`/.netlify/functions/quote?symbol=${symbol}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchAllTickers() {
  refreshStatus();

  for (const symbol of TICKERS) {
    try {
      const data = await fetchTicker(symbol);
      if (!data || !data.c) continue;

      const price = data.c;
      const pct = data.dp ?? 0;
      const dir = pct > 0.05 ? "up" : pct < -0.05 ? "down" : "neutral";

      // Update DOM
      const priceEl = document.getElementById(`price-${symbol}`);
      const chgEl = document.getElementById(`chg-${symbol}`);

      if (priceEl) priceEl.textContent = formatPrice(price);

      if (chgEl) {
        chgEl.textContent = formatChange(pct);
        chgEl.className = `term-chg ${dir}`;
      }

      // Flash row
      rowFlash(symbol, dir);

      // Draw sparkline
      const sparkData = syntheticSparkData(price, pct);
      drawSparkline(`spark-${symbol}`, sparkData, dir);
    } catch (err) {
      console.warn(`[terminal] ${symbol}:`, err.message);
    }
  }

  updateTape();
}

// ─── INIT ─────────────────────────────────────────────────────────
runBootSequence();

// Refresh data every 60 s
setInterval(fetchAllTickers, 60_000);
