document.addEventListener("DOMContentLoaded", () => {
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

  if (typeof Swiper !== "undefined") {
    const swiperEl = document.querySelector(".swiper");
    if (swiperEl) {
      new Swiper(".swiper", {
        loop: true,
        spaceBetween: 24,
        slidesPerView: 3,

        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },

        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },

        breakpoints: {
          0: { slidesPerView: 1, spaceBetween: 14 },
          768: { slidesPerView: 1, spaceBetween: 18 },
          1200: { slidesPerView: 3, spaceBetween: 24 },
        },
      });
    }
  } else {
  }

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
  }

  const countdownEl = document.getElementById("countdown");
  if (countdownEl) startCountdown(countdownEl, 5, 0, 0);

  (function galleryTabs() {
    const tabs = Array.from(
      document.querySelectorAll("#galleryTabs .gallery-tab"),
    );
    const items = Array.from(
      document.querySelectorAll("#galleryGrid .gallery-item"),
    );
    if (!tabs.length || !items.length) return;

    const defaultCategory = "outdoor";

    function setActive(category) {
      tabs.forEach((btn) => {
        const isActive = btn.dataset.category === category;
        btn.classList.toggle("active", isActive);
        btn.classList.toggle("text-primary", isActive);
        btn.classList.toggle("text-dark", !isActive);
      });

      items.forEach((item) => {
        const show = item.dataset.category === category;
        item.classList.toggle("d-none", !show);
      });
    }

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        if (!category) return;

        setActive(category);
        history.replaceState(null, "", "#" + category);
      });
    });

    const hashCategory = (location.hash || "").replace("#", "").trim();
    setActive(hashCategory || defaultCategory);
  })();

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
    const baseSizes = new Map();
    const DOWN_FACTOR = 0.5;
    const SOFT_FLOOR = 0.85;

    const slider = document.getElementById("fontSlider");
    const increase = document.getElementById("increase");
    const decrease = document.getElementById("decrease");
    if (!(slider && increase && decrease)) return;

    slider.min = "-5";
    slider.max = "5";
    slider.step = "1";

    Object.keys(tags).forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        const prev = el.style.fontSize;
        el.style.fontSize = "";
        baseSizes.set(el, parseFloat(getComputedStyle(el).fontSize));
        el.style.fontSize = prev;
      });
    });

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
      const s = Math.max(-5, Math.min(5, step | 0));
      slider.value = String(s);
      applyFontScalingByStep(s);
      localStorage.setItem("fontStep", String(s));
    }

    const saved = Number(localStorage.getItem("fontStep"));
    const start = Number.isFinite(saved) ? Math.max(-5, Math.min(5, saved)) : 0;

    slider.value = String(start);
    applyFontScalingByStep(start);

    slider.addEventListener("input", () =>
      setStepAndSave(Number(slider.value)),
    );
    increase.addEventListener("click", () =>
      setStepAndSave(Number(slider.value) + 1),
    );
    decrease.addEventListener("click", () =>
      setStepAndSave(Number(slider.value) - 1),
    );
  })();

  (function sectionHashObserver() {
    const sections = document.querySelectorAll("main section[id]");
    if (!sections.length) return;

    let activeId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

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
});

document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname;

  const navLinks = document.querySelectorAll(".nav-container a");

  navLinks.forEach((link) => {
    link.classList.remove("active");

    const linkPath = link.getAttribute("href");

    if (linkPath && currentPath.includes(linkPath.replace("./", "/"))) {
      link.classList.add("active");
    }

    if (currentPath === "/" || currentPath === "/index.html") {
      if (
        link.getAttribute("href") === "./index.html" ||
        link.getAttribute("href") === "/"
      ) {
        link.classList.add("active");
      }
    }
  });

  const mobileLinks = document.querySelectorAll(".mobile-menu__link");
  mobileLinks.forEach((link) => {
    link.classList.remove("active");
    const linkHref = link.getAttribute("href");
    if (linkHref && currentPath.includes(linkHref.replace("./", "/"))) {
      link.classList.add("active");
    }
  });
});
