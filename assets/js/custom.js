document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetFiltersBtn");
  const filtersForm = document.getElementById("filtersForm");

  if (resetBtn && filtersForm) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const selects = filtersForm.querySelectorAll("select");
      if (!selects.length) return;

      selects.forEach((select) => {
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

  function initSwipers() {
    if (typeof Swiper === "undefined") return;

    const swipers = document.querySelectorAll(".swiper");
    if (!swipers.length) return;

    swipers.forEach((root) => {
      if (!root || root.dataset.swiperInited === "1") return;
      root.dataset.swiperInited = "1";

      const nextEl = root.querySelector(".swiper-button-next");
      const prevEl = root.querySelector(".swiper-button-prev");
      const pagEl = root.querySelector(".swiper-pagination");

      new Swiper(root, {
        loop: true,
        spaceBetween: 24,
        slidesPerView: 3,
        navigation: nextEl && prevEl ? { nextEl, prevEl } : undefined,
        pagination: pagEl ? { el: pagEl, clickable: true } : undefined,
        breakpoints: {
          0: { slidesPerView: 1, spaceBetween: 14 },
          768: { slidesPerView: 1, spaceBetween: 18 },
          1200: { slidesPerView: 2, spaceBetween: 24 },
          1400: { slidesPerView: 3, spaceBetween: 24 },
        },
      });
    });
  }

  initSwipers();

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

    function render() {
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
    }

    render();

    const timer = setInterval(() => {
      total--;
      if (total <= 0) {
        total = 0;
        clearInterval(timer);
      }
      render();
    }, 1000);
  }

  document.querySelectorAll(".countdown").forEach((el) => {
    startCountdown(el, 5, 0, 0);
  });

  (function galleryTabs() {
    const tabs = document.querySelectorAll("#galleryTabs .gallery-tab");
    const items = document.querySelectorAll("#galleryGrid .gallery-item");
    const select = document.getElementById("galleryCategorySelect");
    const emptyBlock = document.getElementById("galleryEmpty");

    if (!items.length) return;

    const defaultCategory = "all";
    const allowed = new Set(["all"]);

    tabs.forEach((b) => b.dataset.category && allowed.add(b.dataset.category));
    items.forEach((it) => it.dataset.category && allowed.add(it.dataset.category));

    function normalize(c) {
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

      let visible = 0;

      items.forEach((item) => {
        const show = cat === "all" || item.dataset.category === cat;
        item.classList.toggle("d-none", !show);
        if (show) visible++;
      });

      if (emptyBlock) emptyBlock.classList.toggle("d-none", visible !== 0);
      if (select) select.value = cat;
    }

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!btn.dataset.category) return;
        setActive(btn.dataset.category);
      });
    });

    if (select) {
      select.addEventListener("change", () => setActive(select.value));
    }

    setActive(location.hash?.slice(1));
  })();

  (function fontScaler() {
    const sliders = document.querySelectorAll("#fontSlider");
    const increaseBtns = document.querySelectorAll("#increase");
    const decreaseBtns = document.querySelectorAll("#decrease");

    if (!sliders.length) return;

    let step = parseInt(localStorage.getItem("fontStep")) || 0;
    const MIN = -5;
    const MAX = 5;

    function apply(v) {
      step = Math.max(MIN, Math.min(MAX, v));

      sliders.forEach((s) => (s.value = step));

      const base = 16;
      document.documentElement.style.fontSize = base * (1 + step * 0.1) + "px";

      localStorage.setItem("fontStep", step);
    }

    apply(step);

    sliders.forEach((s) => s.addEventListener("input", () => apply(parseInt(s.value))));
    increaseBtns.forEach((b) => b.addEventListener("click", () => apply(step + 1)));
    decreaseBtns.forEach((b) => b.addEventListener("click", () => apply(step - 1)));
  })();

  (function sectionHashObserver() {
    const sections = document.querySelectorAll("main section[id]");
    if (!sections.length) return;

    const galleryTabs = document.querySelectorAll("#galleryTabs .gallery-tab");
    const galleryCats = new Set(["all"]);

    galleryTabs.forEach((t) => t.dataset.category && galleryCats.add(t.dataset.category));

    let activeId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const hash = location.hash.slice(1);
        if (galleryCats.has(hash)) return;

        const id = visible.target.id;
        if (id && id !== activeId) {
          activeId = id;
          history.replaceState(null, "", `#${id}`);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-20% 0px -55% 0px",
      },
    );

    sections.forEach((sec) => observer.observe(sec));
  })();

  (function mobileSearchOverlay() {
    const openBtn = document.getElementById("openSearch");
    const closeBtn = document.getElementById("closeSearch");
    const overlay = document.getElementById("mobileSearchOverlay");
    const input = document.getElementById("mobileSearchInput");

    if (!openBtn || !closeBtn || !overlay || !input) return;

    openBtn.addEventListener("click", () => {
      overlay.style.display = "flex";
      input.focus();
    });

    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.style.display = "none";
    });
  })();
});

document.addEventListener("DOMContentLoaded", () => {
  const searchWrapper = document.querySelector(".top-bar__search");
  if (!searchWrapper) return;

  const input = searchWrapper.querySelector("input");
  const button = searchWrapper.querySelector("button");

  if (!input || !button) return;

  button.addEventListener("click", () => {
    input.focus();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("newsGrid");
  const paginationWrap = document.getElementById("newsPagination");

  if (!grid || !paginationWrap) return;

  const items = Array.from(grid.querySelectorAll(":scope > .col-12.col-md-6.col-lg-4"));

  if (!items.length) {
    paginationWrap.style.display = "none";
    return;
  }

  const perPage = 6;
  const totalPages = Math.ceil(items.length / perPage);

  if (totalPages <= 1) {
    paginationWrap.style.display = "none";
    return;
  }

  function getPageFromUrl() {
    try {
      const url = new URL(window.location.href);
      const p = parseInt(url.searchParams.get("page") || "1", 10);
      return Math.min(Math.max(p || 1, 1), totalPages);
    } catch {
      return 1;
    }
  }

  function setPageToUrl(page) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("page", String(page));
      window.history.pushState({}, "", url);
    } catch {}
  }

  function renderPage(page) {
    const start = (page - 1) * perPage;
    const end = start + perPage;

    items.forEach((el, idx) => {
      if (!el) return;
      el.style.display = idx >= start && idx < end ? "" : "none";
    });
  }

  function renderPagination(currentPage) {
    const ul = document.createElement("ul");
    ul.className = "pagination pagination-sm justify-content-start mb-0";

    const addBtn = (label, page, disabled = false, active = false, aria = "") => {
      const li = document.createElement("li");
      li.className = "page-item";

      if (disabled) li.classList.add("disabled");
      if (active) li.classList.add("active");

      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = label;

      if (aria) a.setAttribute("aria-label", aria);
      if (!disabled && !active) a.dataset.page = String(page);

      li.appendChild(a);
      ul.appendChild(li);
    };

    addBtn("‹", currentPage - 1, currentPage === 1, false, "Previous page");

    for (let p = 1; p <= totalPages; p++) {
      addBtn(String(p), p, false, p === currentPage, `Page ${p}`);
    }

    addBtn("›", currentPage + 1, currentPage === totalPages, false, "Next page");

    paginationWrap.innerHTML = "";
    paginationWrap.appendChild(ul);

    ul.addEventListener("click", (e) => {
      const link = e.target.closest("a.page-link");
      if (!link) return;

      e.preventDefault();

      const page = parseInt(link.dataset.page || "", 10);
      if (!Number.isFinite(page)) return;

      goToPage(page);
    });
  }

  function goToPage(page) {
    const safePage = Math.min(Math.max(page, 1), totalPages);

    renderPage(safePage);
    renderPagination(safePage);
    setPageToUrl(safePage);

    if (grid.scrollIntoView) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  goToPage(getPageFromUrl());

  window.addEventListener("popstate", () => {
    goToPage(getPageFromUrl());
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const collapses = document.querySelectorAll(".collapse");

  if (collapses.length) {
    collapses.forEach((el) => {
      if (!el || !el.id) return;

      const id = el.id;

      const update = () => {
        const isOpen = el.classList.contains("show");

        const buttons = document.querySelectorAll(`[data-bs-target="#${id}"]`);
        if (!buttons.length) return;

        buttons.forEach((btn) => {
          const row = btn.closest(".files-row");
          const icon = row?.querySelector(".files-toggle__chev");
          if (!icon) return;

          icon.classList.remove("bi-chevron-right", "bi-chevron-down");
          icon.classList.add(isOpen ? "bi-chevron-down" : "bi-chevron-right");
        });
      };

      el.addEventListener("shown.bs.collapse", update);
      el.addEventListener("hidden.bs.collapse", update);

      update();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const menuLinks = document.querySelectorAll(".top-bar__menu a[href]");
  if (!menuLinks.length) return;

  menuLinks.forEach((a) => {
    const href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (href && href === current) {
      a.classList.add("active");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const tabsWrap = document.getElementById("staffTabs");
  if (!tabsWrap) return;

  const tabs = Array.from(tabsWrap.querySelectorAll(".nav-link[data-filter]"));
  const items = Array.from(document.querySelectorAll(".staff-item"));
  const empty = document.getElementById("staffEmpty");
  const searchInput = document.getElementById("staffSearch");

  if (!tabs.length || !items.length) return;

  const DEFAULT_FILTER = (tabs[0]?.dataset.filter || "administration").toLowerCase();
  const validFilters = new Set(tabs.map((t) => (t.dataset.filter || "").toLowerCase()));

  function setActiveTab(filter) {
    tabs.forEach((btn) => {
      const f = (btn.dataset.filter || "").toLowerCase();
      btn.classList.toggle("active", f === filter);
    });
  }

  function applyFilter(filter) {
    const q = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const category = (item.dataset.category || "").toLowerCase();
      const text = (item.dataset.name || item.innerText || "").toLowerCase();

      const okCategory = category === filter;
      const okSearch = q === "" || text.includes(q);

      const show = okCategory && okSearch;

      item.classList.toggle("d-none", !show);
      if (show) visibleCount++;
    });

    if (empty) {
      empty.classList.toggle("d-none", visibleCount !== 0);
    }
  }

  function getFilterFromHash() {
    const raw = (window.location.hash || "").replace("#", "").trim().toLowerCase();
    return validFilters.has(raw) ? raw : DEFAULT_FILTER;
  }

  function goToFilter(filter, updateHash) {
    if (!validFilters.has(filter)) filter = DEFAULT_FILTER;

    setActiveTab(filter);
    applyFilter(filter);

    if (updateHash) {
      history.replaceState(null, "", `#${filter}`);
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.dataset.filter || "").toLowerCase();
      goToFilter(filter, true);
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      goToFilter(getFilterFromHash(), false);
    });
  }

  window.addEventListener("hashchange", () => {
    goToFilter(getFilterFromHash(), false);
  });

  goToFilter(getFilterFromHash(), false);
});

document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetSchedule");
  const grade = document.getElementById("schGrade");
  const curator = document.getElementById("schCurator");
  const subject = document.getElementById("schSubject");

  const weekBtn = document.getElementById("viewWeekBtn");
  const dayBtn = document.getElementById("viewDayBtn");

  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (grade) grade.selectedIndex = 0;
      if (curator) curator.selectedIndex = 0;
      if (subject) subject.selectedIndex = 0;
    });
  }

  function setActive(btnOn, btnOff) {
    btnOn.classList.add("active");
    btnOff.classList.remove("active");
  }

  if (weekBtn && dayBtn) {
    weekBtn.addEventListener("click", () => setActive(weekBtn, dayBtn));
    dayBtn.addEventListener("click", () => setActive(dayBtn, weekBtn));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const gradeFilter = document.getElementById("gradeFilter");
  const curatorFilter = document.getElementById("curatorFilter");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  const tableBody = document.getElementById("studentsTableBody");
  const rows = tableBody ? tableBody.querySelectorAll("tr") : [];
  const currentGradeTitle = document.getElementById("currentGradeTitle");
  const currentCuratorName = document.getElementById("currentCuratorName");
  const emptyState = document.getElementById("studentsEmptyState");

  if (!gradeFilter || !curatorFilter || !tableBody || !rows.length) return;

  function formatGradeTitle(value) {
    return value === "all" ? "All Grades" : `${value} Grade`;
  }

  function formatCuratorName(value) {
    if (value === "jane-henderson") return "Jane Henderson";
    if (value === "michael-brown") return "Michael Brown";
    return "All curators";
  }

  function filterStudentsTable() {
    const selectedGrade = gradeFilter.value;
    const selectedCurator = curatorFilter.value;
    let visibleCount = 0;

    rows.forEach((row) => {
      const rowGrade = row.dataset.grade;
      const rowCurator = row.dataset.curator;

      const gradeMatch = selectedGrade === "all" || rowGrade === selectedGrade;
      const curatorMatch = selectedCurator === "all" || rowCurator === selectedCurator;

      if (gradeMatch && curatorMatch) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    if (currentGradeTitle) {
      currentGradeTitle.textContent = formatGradeTitle(selectedGrade);
    }

    if (currentCuratorName) {
      currentCuratorName.textContent = formatCuratorName(selectedCurator);
    }

    if (emptyState) {
      emptyState.classList.toggle("d-none", visibleCount !== 0);
    }
  }

  gradeFilter.addEventListener("change", filterStudentsTable);
  curatorFilter.addEventListener("change", filterStudentsTable);

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      gradeFilter.value = "all";
      curatorFilter.value = "all";
      filterStudentsTable();
    });
  }

  filterStudentsTable();
});

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
  const storageKey = "activeProfileTab";

  const savedTab = localStorage.getItem(storageKey);
  if (savedTab) {
    const trigger = document.querySelector(`[data-bs-toggle="tab"][data-bs-target="${savedTab}"]`);

    if (trigger) {
      const tab = new bootstrap.Tab(trigger);
      tab.show();
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("shown.bs.tab", (event) => {
      const target = event.target.getAttribute("data-bs-target");
      if (target) {
        localStorage.setItem(storageKey, target);
      }
    });
  });
});
const viewButtons = document.querySelectorAll(".view-mode-btn");

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    viewButtons.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
  });
});
document.querySelectorAll(".lesson-item").forEach((lesson) => {
  const editBtn = lesson.querySelector(".lesson-edit-btn");
  const saveBtn = lesson.querySelector(".lesson-save-btn");
  const cancelBtn = lesson.querySelector(".lesson-cancel-btn");

  const viewMode = lesson.querySelector(".lesson-view-mode");
  const editForm = lesson.querySelector(".lesson-edit-form");

  const titleTextTop = lesson.querySelector(".lesson-title-text");
  const viewTitle = lesson.querySelector(".lesson-view-title");
  const viewDescription = lesson.querySelector(".lesson-view-description");
  const viewDate = lesson.querySelector(".lesson-view-date");

  const inputTitle = lesson.querySelector(".lesson-input-title");
  const inputDescription = lesson.querySelector(".lesson-input-description");
  const inputDate = lesson.querySelector(".lesson-input-date");

  let originalData = {
    title: inputTitle.value,
    description: inputDescription.value,
    date: inputDate.value,
  };

  editBtn.addEventListener("click", () => {
    viewMode.classList.add("d-none");
    editForm.classList.remove("d-none");
  });

  cancelBtn.addEventListener("click", () => {
    inputTitle.value = originalData.title;
    inputDescription.value = originalData.description;
    inputDate.value = originalData.date;

    editForm.classList.add("d-none");
    viewMode.classList.remove("d-none");
  });

  saveBtn.addEventListener("click", () => {
    const newTitle = inputTitle.value.trim();
    const newDescription = inputDescription.value.trim();
    const newDate = inputDate.value;

    viewTitle.textContent = newTitle;
    viewDescription.textContent = newDescription;
    viewDate.textContent = newDate;
    titleTextTop.textContent = newTitle;

    originalData = {
      title: newTitle,
      description: newDescription,
      date: newDate,
    };

    editForm.classList.add("d-none");
    viewMode.classList.remove("d-none");
  });
});
document.querySelectorAll(".lesson-item").forEach((lesson) => {
  const editBtn = lesson.querySelector(".lesson-edit-btn");
  const collapse = lesson.querySelector(".collapse");

  const viewMode = lesson.querySelector(".lesson-view-mode");
  const editForm = lesson.querySelector(".lesson-edit-form");

  editBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapse);

    if (!collapse.classList.contains("show")) {
      bsCollapse.show();
    }

    viewMode.classList.add("d-none");
    editForm.classList.remove("d-none");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  let currentDate = new Date();

  const prevBtn = document.getElementById("prevBtn");
  const monthDisplay = document.getElementById("monthDisplay");

  /* FIX: create function */
  function updateMonthDisplay() {
    if (!monthDisplay) return;

    monthDisplay.textContent = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  updateMonthDisplay();

  /* FIX: check if button exists */
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      updateMonthDisplay();
    });
  }

  const gradeSelect = document.getElementById("grade");
  const subjectSelect = document.getElementById("subject");
  const teacherSelect = document.getElementById("teacher");
  const curatorSelect = document.getElementById("curator");
  const resetBtn = document.getElementById("resetFiltersBtn");

  const rows = document.querySelectorAll(".schedule-table tbody tr");

  function applyFilters() {
    if (!gradeSelect || !subjectSelect || !teacherSelect) return;

    const gradeVal = gradeSelect.value.trim().toLowerCase();
    const subjectVal = subjectSelect.value.trim().toLowerCase();
    const teacherVal = teacherSelect.value.trim().toLowerCase();

    const hasGrade = gradeVal !== "";
    const hasSubject = subjectVal !== "";
    const hasTeacher = teacherVal !== "";

    if (!hasGrade && !hasSubject && !hasTeacher) {
      rows.forEach((row) => {
        if (!row.classList.contains("lunch-row")) {
          row.style.display = "";
        }
      });
      return;
    }

    rows.forEach((row) => {
      if (row.classList.contains("lunch-row")) return;

      const cells = row.querySelectorAll("td:not(.time-cell)");
      let shouldShow = false;

      for (const cell of cells) {
        const text = cell.innerText.toLowerCase().trim();
        let matches = true;

        if (hasGrade) {
          const gradeSpan = cell.querySelector(".grade");

          if (gradeSpan) {
            if (!gradeSpan.innerText.toLowerCase().includes(gradeVal)) {
              matches = false;
            }
          } else if (!text.includes(gradeVal)) {
            matches = false;
          }
        }

        if (hasSubject && !text.includes(subjectVal)) matches = false;
        if (hasTeacher && !text.includes(teacherVal)) matches = false;

        if (matches) {
          shouldShow = true;
          break;
        }
      }

      row.style.display = shouldShow ? "" : "none";
    });
  }

  if (gradeSelect) gradeSelect.addEventListener("change", applyFilters);
  if (subjectSelect) subjectSelect.addEventListener("change", applyFilters);
  if (teacherSelect) teacherSelect.addEventListener("change", applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (gradeSelect) gradeSelect.value = "";
      if (subjectSelect) subjectSelect.value = "";
      if (teacherSelect) teacherSelect.value = "";

      applyFilters();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const chatItems = document.querySelectorAll("#chatList a");
  const headerName = document.getElementById("headerName");
  const headerRole = document.getElementById("headerRole");
  const headerAvatar = document.getElementById("headerAvatar");
  const messagesContainer = document.getElementById("messagesContainer");

  function loadChat(chatId) {
    const template = document.getElementById("chat-" + chatId);
    if (template) {
      messagesContainer.innerHTML = template.innerHTML;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      messagesContainer.innerHTML = '<div class="text-center text-muted my-5 py-5">No messages yet</div>';
    }
  }

  chatItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      chatItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      headerName.textContent = item.dataset.name;
      headerRole.textContent = item.dataset.role + " • Online";
      headerAvatar.src = item.dataset.avatar;

      loadChat(item.dataset.chat);
    });
  });

  const activeItem = document.querySelector("#chatList a.active");
  if (activeItem) {
    loadChat(activeItem.dataset.chat);
  }
});

const EMOJIS = ["😄", "😂", "🔥", "🥳", "😎", "🤩", "😺", "✨", "💙", "🎉", "📎", "😮", "🙌", "👍", "🫶"];

document.querySelectorAll(".emoji-hover").forEach((btn) => {
  const content = btn.querySelector(".icon-content");
  const original = content.innerHTML;

  btn.addEventListener("mouseenter", () => {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    content.innerHTML = emoji;
    content.classList.add("emoji");
  });

  btn.addEventListener("mouseleave", () => {
    content.innerHTML = original;
    content.classList.remove("emoji");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get("page")) || 1;

  const allCards = document.querySelectorAll(".news-page");

  if (allCards.length) {
    allCards.forEach((card) => {
      if (!card || !card.dataset.page) return;

      card.style.display = parseInt(card.dataset.page) === currentPage ? "block" : "none";
    });
  }

  const pageLinks = document.querySelectorAll("#pagination .page-link");

  if (pageLinks.length) {
    pageLinks.forEach((link) => {
      const parentLi = link.parentElement;
      if (!parentLi) return;

      parentLi.classList.remove("active");

      if (link.textContent.trim() === String(currentPage)) {
        parentLi.classList.add("active");
      }
    });
  }

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) {
    prevBtn.classList.toggle("disabled", currentPage === 1);
  }

  if (nextBtn) {
    const totalPages = Math.max(...Array.from(allCards).map((c) => parseInt(c.dataset.page || 1)));

    nextBtn.classList.toggle("disabled", currentPage === totalPages);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const gradeButtons = document.querySelectorAll(".grade-btn");
  const gradeContents = document.querySelectorAll(".grade-content");

  function switchGrade(grade) {
    gradeContents.forEach((content) => {
      content.style.display = "none";
    });

    const activeContent = document.getElementById(`grade-${grade}`);
    if (activeContent) {
      activeContent.style.display = "block";
    }
  }

  gradeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const selectedGrade = this.getAttribute("data-grade");

      gradeButtons.forEach((btn) => {
        btn.classList.remove("active", "btn-primary");
        btn.classList.add("btn-outline-primary");
      });

      this.classList.add("active", "btn-primary");
      this.classList.remove("btn-outline-primary");

      switchGrade(selectedGrade);
    });
  });

  switchGrade(5);
});

const openBtn = document.getElementById("openSearch");
const closeBtn = document.getElementById("closeSearch");
const search = document.getElementById("mobileSearch");

openBtn.addEventListener("click", () => {
  search.classList.add("active");
  search.querySelector("input").focus();
});

closeBtn.addEventListener("click", () => {
  search.classList.remove("active");
});

search.addEventListener("click", (e) => {
  if (e.target === search) {
    search.classList.remove("active");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  function setActive(selector) {
    document.querySelectorAll(selector).forEach((link) => {
      const href = link.getAttribute("href")?.split("/").pop();

      if (href === currentPage) {
        link.classList.add("active");
      }
    });
  }

  setActive(".top-bar__menu a");

  setActive(".header_items a");
});

document.addEventListener("DOMContentLoaded", function () {
  const modalElement = document.getElementById("galleryModal");
  const modalImage = document.getElementById("modalImage");

  if (!modalElement || !modalImage || typeof bootstrap === "undefined") return;

  const modal = new bootstrap.Modal(modalElement);

  function openImageInModal(img) {
    if (!img) return;

    modalImage.src = img.src || "";
    modalImage.alt = img.alt || "Image";

    modal.show();
  }

  const galleryImgs = document.querySelectorAll(".gallery-img");
  const profileImgs = document.querySelectorAll(".profile-main-image");
  const certImgs = document.querySelectorAll(".certificate-card img");

  function bindImages(nodeList) {
    if (!nodeList.length) return;

    nodeList.forEach((img) => {
      if (!img) return;

      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openImageInModal(img));
    });
  }

  bindImages(galleryImgs);
  bindImages(profileImgs);
  bindImages(certImgs);
});

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".dropdown-item[data-tab]");
  const label = document.getElementById("mobileTabLabel");

  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const tabId = item.dataset.tab;
      if (!tabId) return;

      if (label) {
        label.textContent = item.textContent.trim();
      }

      const tabBtn = document.getElementById(tabId);

      if (tabBtn && typeof bootstrap !== "undefined") {
        const tab = new bootstrap.Tab(tabBtn);
        tab.show();
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const gradeEl = document.getElementById("filterGrade");
  const teacherEl = document.getElementById("filterTeacher");
  const subjectEl = document.getElementById("filterSubject");

  const getLessons = () => document.querySelectorAll(".lesson");

  function filterSchedule() {
    const grade = gradeEl.value;
    const teacher = teacherEl.value;
    const subject = subjectEl.value;

    getLessons().forEach((lesson) => {
      const matchGrade = grade === "all" || lesson.dataset.grade === grade;

      const matchTeacher = teacher === "all" || lesson.dataset.teacher === teacher;

      const matchSubject = subject === "all" || lesson.dataset.subject === subject;

      lesson.style.display = matchGrade && matchTeacher && matchSubject ? "block" : "none";
    });
  }

  if (gradeEl && teacherEl && subjectEl) {
    gradeEl.addEventListener("change", filterSchedule);
    teacherEl.addEventListener("change", filterSchedule);
    subjectEl.addEventListener("change", filterSchedule);
  }

  window.addEvent = function () {
    const subject = document.getElementById("eventSubject")?.value;
    const teacher = document.getElementById("eventTeacher")?.value;
    const grade = document.getElementById("eventGrade")?.value;
    const time = document.getElementById("eventTime")?.value;
    const day = document.getElementById("eventDay")?.value;

    if (!subject || !teacher || !grade) {
      alert("Please fill all fields");
      return;
    }

    const row = document.querySelector(`tr[data-row="${time}"]`);
    if (!row) return alert("Time slot not found");

    const cellIndex = parseInt(day);

    const cell = row.children[cellIndex];
    if (!cell) return;

    cell.innerHTML = `
      <div class="lesson p-3 bg-primary bg-opacity-10"
        data-subject="${subject}"
        data-grade="${grade}"
        data-teacher="${teacher}">
        
        <div class="fw-semibold text-primary">${subject}</div>
        <small class="d-block">${grade}</small>
        <small>${teacher}</small>
      </div>
    `;

    const modalEl = document.getElementById("addEventModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    filterSchedule();
  };
});

document.addEventListener("DOMContentLoaded", () => {
  const monthDisplay = document.getElementById("monthDisplay");
  const input = document.getElementById("dateInput");

  if (!monthDisplay || !input || typeof flatpickr === "undefined") return;

  const fp = flatpickr(input, {
    dateFormat: "F Y",
    defaultDate: new Date(),
    onChange: (selectedDates) => {
      if (!selectedDates.length) return;

      const date = selectedDates[0];

      const month = date.toLocaleString("en", { month: "long" });
      const year = date.getFullYear();

      monthDisplay.innerHTML = `${month} <span>${year}</span>`;
    },
  });

  monthDisplay.addEventListener("click", () => {
    fp.open();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const gradeSelect = document.getElementById("grade");
  const subjectSelect = document.getElementById("subject");
  const teacherSelect = document.getElementById("teacher");
  const curatorSelect = document.getElementById("curator");
  const resetBtn = document.getElementById("resetFiltersBtn");

  const rows = document.querySelectorAll(".schedule-table tbody tr:not(.lunch-row)");

  function applyFilters() {
    const gradeVal = gradeSelect.value.trim();
    const subjectVal = subjectSelect.value.toLowerCase().trim();
    const teacherVal = teacherSelect.value.toLowerCase().trim();

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td:not(.time-cell)");
      let rowMatches = false;

      cells.forEach((cell) => {
        const text = cell.innerText.toLowerCase();
        const gradeSpan = cell.querySelector(".grade");
        const cellGrade = gradeSpan ? gradeSpan.innerText : "";

        const matchesGrade = !gradeVal || cellGrade.includes(gradeVal);
        const matchesSubject = !subjectVal || text.includes(subjectVal);
        const matchesTeacher = !teacherVal || text.includes(teacherVal);

        if (matchesGrade && matchesSubject && matchesTeacher && text.trim() !== "") {
          rowMatches = true;
        }
      });

      row.style.display = rowMatches ? "" : "none";
    });
  }

  [gradeSelect, subjectSelect, teacherSelect, curatorSelect].forEach((select) => {
    if (select) select.addEventListener("change", applyFilters);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      [gradeSelect, subjectSelect, teacherSelect, curatorSelect].forEach((s) => (s.selectedIndex = 0));
      applyFilters();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  function initSizeSelection() {
    const sizeBadges = document.querySelectorAll(".size-badge");

    sizeBadges.forEach((badge) => {
      badge.addEventListener("click", function () {
        const parentCard = this.closest(".product-card");
        parentCard.querySelectorAll(".size-badge").forEach((b) => {
          b.classList.remove("active");
        });

        this.classList.add("active");
      });
    });
  }

  function initColorSwatches() {
    const colorDots = document.querySelectorAll(".color-dot");

    colorDots.forEach((dot) => {
      dot.addEventListener("click", function () {
        const parentCard = this.closest(".product-card");
        parentCard.querySelectorAll(".color-dot").forEach((d) => {
          d.classList.remove("active");
        });

        this.classList.add("active");
      });
    });
  }

  function initAddToCart() {
    const addToCartButtons = document.querySelectorAll(".btn-primary");

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const card = this.closest(".product-card");
        const productName = card.querySelector(".card-title").textContent.trim();

        this.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Adding...
                `;
        this.disabled = true;

        setTimeout(() => {
          alert(`✅ ${productName} has been added to your cart!`);

          this.innerHTML = "Add to cart";
          this.disabled = false;
        }, 800);
      });
    });
  }

  function initCardHover() {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-8px)";
        card.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
        card.style.boxShadow = "";
      });
    });
  }

  initSizeSelection();
  initColorSwatches();
  initAddToCart();
  initCardHover();
});

function changeImage(el) {
  document.getElementById("mainImage").src = el.src;
  document.querySelectorAll(".thumbnail-img").forEach((img) => img.classList.remove("active"));
  el.classList.add("active");
}

function selectColor(el) {
  document.querySelectorAll(".color-swatch").forEach((c) => (c.style.borderColor = "#fff"));
  el.style.borderColor = "#000";
}

function selectSize(el) {
  document.querySelectorAll(".size-badge").forEach((s) => s.classList.remove("active"));
  el.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function () {
  const showMoreBtn = document.getElementById("show-more-comments");
  const hiddenComments = document.getElementById("hidden-comments");
  let commentsShown = false;

  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", function () {
      if (!commentsShown) {
        hiddenComments.classList.remove("d-none");
        this.textContent = "Show less comments";
        commentsShown = true;
      } else {
        hiddenComments.classList.add("d-none");
        this.textContent = "Show 120 more comments";
        commentsShown = false;
      }
    });
  }
});

function toggleAudio(btn) {
  const icon = btn.querySelector("i");
  const waveform = btn.parentElement.querySelector(".audio-waveform");

  if (icon.classList.contains("bi-play-fill")) {
    icon.classList.replace("bi-play-fill", "bi-pause-fill");
    waveform.classList.add("playing");
  } else {
    icon.classList.replace("bi-pause-fill", "bi-play-fill");
    waveform.classList.remove("playing");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const carouselEl = document.getElementById("mainCarousel");

  if (carouselEl) {
    const carousel = new bootstrap.Carousel(carouselEl);
    const thumbnails = document.querySelectorAll(".thumbnail");

    carouselEl.addEventListener("slid.bs.carousel", function (e) {
      const activeIndex = e.to;
      thumbnails.forEach((thumb) => {
        thumb.classList.toggle("active", parseInt(thumb.getAttribute("data-bs-slide-to")) === activeIndex);
      });
    });

    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbnails.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        carousel.to(parseInt(thumb.getAttribute("data-bs-slide-to")));
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("cartTable");
  const grandTotalEl = document.getElementById("grand-total");
  const totalItemsEl = document.getElementById("total-items");
  const payBtn = document.getElementById("pay-btn");

  function calculateTotals() {
    if (!table) return;
    if (!grandTotalEl || !totalItemsEl || !payBtn) return;

    let grandTotal = 0;
    let itemCount = 0;

    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const price = parseFloat(row.dataset.price || 0);
      const qtyEl = row.querySelector(".quantity");

      if (!qtyEl) return;

      const qty = parseInt(qtyEl.textContent || 0);
      const itemTotalEl = row.querySelector(".item-total");

      const itemTotal = price * qty;

      if (itemTotalEl) {
        itemTotalEl.textContent = "$" + itemTotal.toFixed(2);
      }

      grandTotal += itemTotal;
      itemCount += qty;
    });

    grandTotalEl.textContent = "$" + grandTotal.toFixed(2);
    totalItemsEl.textContent = itemCount + " items — $" + grandTotal.toFixed(2);
    payBtn.textContent = "Pay $" + grandTotal.toFixed(2);
  }

  if (table) {
    table.addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row) return;

      if (e.target.classList.contains("increase")) {
        const qtyEl = row.querySelector(".quantity");
        if (!qtyEl) return;

        qtyEl.textContent = parseInt(qtyEl.textContent) + 1;
        calculateTotals();
      }

      if (e.target.classList.contains("decrease")) {
        const qtyEl = row.querySelector(".quantity");
        if (!qtyEl) return;

        let qty = parseInt(qtyEl.textContent);
        if (qty > 1) {
          qtyEl.textContent = qty - 1;
          calculateTotals();
        }
      }

      if (e.target.closest(".remove-item")) {
        if (confirm("Remove this item from cart?")) {
          row.remove();
          calculateTotals();
        }
      }
    });

    calculateTotals();
  }
});
