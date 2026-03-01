/* ==========================================================================
   custom.js — fixed version (safe + works with your current HTML)
   - No crashes if some elements are missing on other pages
   - Fixes multiple Swipers (scoped controls)
   - Fixes countdown (works for each .countdown)
   - Fixes duplicate IDs for font scaler by supporting BOTH footer + offcanvas
   - Keeps your schedule reset + week/day toggle
   - Keeps gallery tabs logic
   - Prevents gallery hash from being overwritten by section hash observer
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     1) Schedule filters reset
     ========================= */
  const resetBtn = document.getElementById("resetFiltersBtn");
  const filtersForm = document.getElementById("filtersForm");

  if (resetBtn && filtersForm) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filtersForm.querySelectorAll("select").forEach((select) => {
        select.selectedIndex = 0;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  /* =========================
     2) Week / Day toggle (schedule)
     ========================= */
  const weekBtn = document.getElementById("weekBtn");
  const dayBtn = document.getElementById("dayBtn");

  if (weekBtn && dayBtn) {
    weekBtn.addEventListener("click", () => {
      weekBtn.classList.add("active");
      dayBtn.classList.remove("active");
    });

    dayBtn.addEventListener("click", () => {
      dayBtn.classList.add("active");
      weekBtn.classList.remove("active");
    });
  }

  /* =========================
     3) Swiper init (MULTIPLE swipers)
     - scopes buttons/pagination inside each swiper block
     ========================= */
  function initSwipers() {
    if (typeof Swiper === "undefined") return;

    const swipers = document.querySelectorAll(".swiper");
    if (!swipers.length) return;

    swipers.forEach((root) => {
      // Avoid double-init if something calls it again
      if (root.dataset.swiperInited === "1") return;
      root.dataset.swiperInited = "1";

      const nextEl = root.querySelector(".swiper-button-next");
      const prevEl = root.querySelector(".swiper-button-prev");
      const pagEl = root.querySelector(".swiper-pagination");

      // If controls are missing on some swiper block, Swiper still works
      new Swiper(root, {
        loop: true,
        spaceBetween: 24,
        slidesPerView: 3,

        navigation: nextEl && prevEl ? { nextEl, prevEl } : undefined,

        pagination: pagEl ? { el: pagEl, clickable: true } : undefined,

        breakpoints: {
          0: { slidesPerView: 1, spaceBetween: 14 },
          768: { slidesPerView: 1, spaceBetween: 18 },
          1200: { slidesPerView: 3, spaceBetween: 24 },
        },
      });
    });
  }

  initSwipers();

  /* =========================
     4) Countdown (Events cards)
     - Works for each ".countdown" block
     ========================= */
  function startCountdown(el, hours, minutes, seconds) {
    if (!el) return;

    const hEl = el.querySelector('[data-part="h"]');
    const mEl = el.querySelector('[data-part="m"]');
    const sEl = el.querySelector('[data-part="s"]');
    if (!hEl || !mEl || !sEl) return;

    let total = hours * 3600 + minutes * 60 + seconds;

    const normalBg = "#2696DB33";
    const dangerBg = "#D34E4E33";
    const dangerThreshold = 4 * 60 * 60;

    const render = () => {
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;

      hEl.textContent = String(h).padStart(2, "0");
      mEl.textContent = String(m).padStart(2, "0");
      sEl.textContent = String(s).padStart(2, "0");

      const bg = total < dangerThreshold ? dangerBg : normalBg;
      hEl.style.backgroundColor = bg;
      mEl.style.backgroundColor = bg;
      sEl.style.backgroundColor = bg;
    };

    render();

    const timer = setInterval(() => {
      total -= 1;
      if (total <= 0) {
        total = 0;
        clearInterval(timer);
      }
      render();
    }, 1000);

    // Save timer reference if you ever want to stop it later
    el.dataset.timer = "1";
  }

  // Your HTML uses class="countdown" (not id="countdown")
  document.querySelectorAll(".countdown").forEach((el) => {
    // Example: 5 hours countdown (same as your old logic)
    // You can change per card later if you want
    startCountdown(el, 5, 0, 0);
  });

  /* =========================
     5) Gallery tabs + mobile select
     - Keeps your logic
     ========================= */
  (function galleryTabs() {
    const tabs = Array.from(
      document.querySelectorAll("#galleryTabs .gallery-tab"),
    );
    const items = Array.from(
      document.querySelectorAll("#galleryGrid .gallery-item"),
    );
    const select = document.getElementById("galleryCategorySelect");
    const emptyBlock = document.getElementById("galleryEmpty");

    if (!items.length) return;

    const defaultCategory = "all";

    const allowed = new Set(["all"]);
    tabs.forEach((b) => b.dataset.category && allowed.add(b.dataset.category));
    items.forEach(
      (it) => it.dataset.category && allowed.add(it.dataset.category),
    );

    function normalize(category) {
      const c = (category || "").trim();
      return allowed.has(c) ? c : defaultCategory;
    }

    function setActive(category) {
      const cat = normalize(category);

      tabs.forEach((btn) => {
        const isActive = btn.dataset.category === cat;
        btn.classList.toggle("active", isActive);
        btn.classList.toggle("text-primary", isActive);
        btn.classList.toggle("text-dark", !isActive);
      });

      let visibleCount = 0;

      items.forEach((item) => {
        const itemCat = item.dataset.category;
        const show = cat === "all" ? true : itemCat === cat;
        item.classList.toggle("d-none", !show);
        if (show) visibleCount++;
      });

      if (emptyBlock) emptyBlock.classList.toggle("d-none", visibleCount !== 0);
      if (select) select.value = cat;
    }

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        if (!category) return;
        setActive(category);
        // optional: set hash to category (only if you want)
        // history.replaceState(null, "", `#${category}`);
      });
    });

    if (select) {
      select.addEventListener("change", () => {
        setActive(select.value);
      });
    }

    // Read initial hash for category (only if matches allowed)
    const hashValue = (location.hash || "").slice(1);
    setActive(hashValue);
  })();

  /* =========================
     6) Font scaler (works even with DUPLICATE IDs)
     - Your HTML has two "decrease/increase/fontSlider"
     - This code supports ALL matching controls by selecting *all* of them.
     ========================= */
  (function fontScaler() {
    const tags = {
      h1: 1.5,
      h2: 1.3,
      h3: 1.1,
      h4: 0.9,
      h5: 0.7,
      p: 0.6,
      span: 0.4,
    };

    // Because IDs are duplicated, we select by CSS selector that matches both.
    const sliders = Array.from(document.querySelectorAll("#fontSlider"));
    const increases = Array.from(document.querySelectorAll("#increase"));
    const decreases = Array.from(document.querySelectorAll("#decrease"));

    // If you have no controls on this page, stop.
    if (!sliders.length || !increases.length || !decreases.length) return;

    const baseSizes = new Map();
    const DOWN_FACTOR = 0.5;
    const SOFT_FLOOR = 0.85;

    // Cache base sizes
    Object.keys(tags).forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        const prev = el.style.fontSize;
        el.style.fontSize = "";
        baseSizes.set(el, parseFloat(getComputedStyle(el).fontSize));
        el.style.fontSize = prev;
      });
    });

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const stepToPercent = (step) => 100 + step * 10;

    function applyFontScalingByStep(step) {
      const percent = stepToPercent(step);

      if (percent === 100) {
        baseSizes.forEach((base, el) => {
          el.style.fontSize = base + "px";
        });
        return;
      }

      const delta = (percent - 100) / 100;

      Object.entries(tags).forEach(([tag, mult]) => {
        const upCap = 1 + 0.5 * mult;

        document.querySelectorAll(tag).forEach((el) => {
          const base = baseSizes.get(el);
          if (!base) return;

          const effMult = delta < 0 ? mult * DOWN_FACTOR : mult;
          let scale = 1 + delta * effMult;

          if (scale < SOFT_FLOOR) scale = SOFT_FLOOR;
          if (scale > upCap) scale = upCap;

          el.style.fontSize = base * scale + "px";
        });
      });
    }

    function setStepAndSave(step) {
      const s = clamp(step | 0, -5, 5);

      // Update ALL sliders to same value (footer + offcanvas)
      sliders.forEach((sl) => {
        sl.min = "-5";
        sl.max = "5";
        sl.step = "1";
        sl.value = String(s);
      });

      applyFontScalingByStep(s);
      localStorage.setItem("fontStep", String(s));
    }

    const saved = Number(localStorage.getItem("fontStep"));
    const start = Number.isFinite(saved) ? clamp(saved, -5, 5) : 0;

    setStepAndSave(start);

    // Sliders input
    sliders.forEach((sl) => {
      sl.addEventListener("input", () => setStepAndSave(Number(sl.value)));
    });

    // Buttons
    increases.forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = Number(sliders[0].value || 0);
        setStepAndSave(current + 1);
      });
    });

    decreases.forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = Number(sliders[0].value || 0);
        setStepAndSave(current - 1);
      });
    });
  })();

  /* =========================
     7) Section hash observer (safe)
     - prevents fighting gallery hash categories
     ========================= */
  (function sectionHashObserver() {
    const sections = document.querySelectorAll("main section[id]");
    if (!sections.length) return;

    // If current hash looks like a gallery category, we don't override it
    // (because your gallery uses hashValue like #outdoor)
    const galleryTabs = document.querySelectorAll("#galleryTabs .gallery-tab");
    const galleryCats = new Set(["all"]);
    galleryTabs.forEach(
      (t) => t.dataset.category && galleryCats.add(t.dataset.category),
    );

    let activeId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        // If hash is a gallery category, don't replace it while user is filtering
        const currentHash = (location.hash || "").slice(1);
        if (galleryCats.has(currentHash)) return;

        const id = visible.target.id;
        if (id && id !== activeId) {
          activeId = id;
          history.replaceState(null, "", `#${id}`);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-20% 0px -55% 0px",
      },
    );

    sections.forEach((sec) => observer.observe(sec));
  })();

  /* =========================
     8) Active link highlighting (desktop + mobile)
     ========================= */
  (function activeNavLinks() {
    const currentPath = window.location.pathname;

    // Desktop nav items
    const navLinks = document.querySelectorAll(".nav-container a");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (!href) return;

      // Normalize ./page.html -> /page.html
      const normalized = href.startsWith("./") ? href.slice(1) : href;

      // Exact match is safer than includes()
      if (
        normalized === "/" &&
        (currentPath === "/" || currentPath.endsWith("/index.html"))
      ) {
        link.classList.add("active");
        return;
      }

      if (normalized !== "/" && currentPath.endsWith(normalized)) {
        link.classList.add("active");
      }
    });

    // Mobile menu links
    const mobileLinks = document.querySelectorAll(".mobile-menu__link");
    mobileLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (!href) return;

      const normalized = href.startsWith("./") ? href.slice(1) : href;

      if (normalized === "#" || normalized === "") return;

      if (
        normalized === "/" &&
        (currentPath === "/" || currentPath.endsWith("/index.html"))
      ) {
        link.classList.add("active");
        return;
      }

      if (normalized !== "/" && currentPath.endsWith(normalized)) {
        link.classList.add("active");
      }
    });
  })();

  /* =========================
     9) Mobile search overlay (safe)
     ========================= */
  (function mobileSearchOverlay() {
    const openBtn = document.getElementById("openSearch");
    const closeBtn = document.getElementById("closeSearch");
    const overlay = document.getElementById("mobileSearchOverlay");
    const input = document.getElementById("mobileSearchInput");

    if (!(openBtn && closeBtn && overlay && input)) return;

    openBtn.addEventListener("click", () => {
      overlay.style.display = "flex";
      input.focus();
    });

    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });

    // Optional: close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        overlay.style.display = "none";
      }
    });
  })();
});
