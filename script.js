/* =========================================================
   TRAZO OCULTO · script.js
   ========================================================= */

// Fecha y hora de inicio del evento (hora de Buenos Aires, UTC-3).
// ⚠️ Cambiá el año si hace falta.
const EVENT_START = new Date("2027-11-14T17:00:00-03:00");
const EVENT_END   = new Date("2027-11-17T23:59:00-03:00");

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHeroImage();
  initCountdown();
  initTabs();
  initReveal();
  initStickerParallax();
});

/* ---------- Navegación ---------- */
function initNav() {
  const nav    = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu   = document.getElementById("navMenu");

  // Fondo sólido al scrollear
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menú mobile
  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- Imagen del hero (muestra un placeholder si falta) ---------- */
function initHeroImage() {
  const img = document.getElementById("heroImg");
  const fig = document.getElementById("collageFigure");
  if (!img || !fig) return;

  const markMissing = () => fig.classList.add("is-missing");
  if (img.complete && img.naturalWidth === 0) markMissing();
  img.addEventListener("error", markMissing);
}

/* ---------- Cuenta regresiva ---------- */
function initCountdown() {
  const box = document.getElementById("countdown");
  if (!box) return;

  const el = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
  };
  const pad = (n) => String(n).padStart(2, "0");

  const showMessage = (text) => {
    box.innerHTML = `<p class="countdown__msg">${text}</p>`;
  };

  const tick = () => {
    const now = new Date();

    if (now >= EVENT_END)   { showMessage("¡Gracias por venir! Nos vemos el año que viene"); return false; }
    if (now >= EVENT_START) { showMessage("¡Estamos pintando! Vení al circuito");            return false; }

    const diff = EVENT_START - now;
    el.d.textContent = pad(Math.floor(diff / 86400000));
    el.h.textContent = pad(Math.floor(diff / 3600000) % 24);
    el.m.textContent = pad(Math.floor(diff / 60000) % 60);
    el.s.textContent = pad(Math.floor(diff / 1000) % 60);
    return true;
  };

  if (tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }
}

/* ---------- Pestañas de la agenda ---------- */
function initTabs() {
  const tabs   = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const day = tab.dataset.day;

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });

      panels.forEach((p) => {
        const active = p.dataset.panel === day;
        p.hidden = !active;
        p.classList.toggle("is-active", active);
      });
    });
  });
}

/* ---------- Aparición al hacer scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Pequeño escalonado entre elementos hermanos
      const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 80}ms`;
      el.classList.add("is-visible");
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  items.forEach((el) => io.observe(el));
}

/* ---------- Stickers que siguen el mouse ---------- */
function initStickerParallax() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduce || !finePointer) return;

  const hero = document.querySelector(".hero");
  const stickers = hero.querySelectorAll("[data-depth]");
  let frame = null;

  hero.addEventListener("mousemove", (e) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;

      stickers.forEach((s) => {
        const depth = parseFloat(s.dataset.depth) * 30;
        s.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
      frame = null;
    });
  });

  hero.addEventListener("mouseleave", () => {
    stickers.forEach((s) => (s.style.transform = ""));
  });
}
