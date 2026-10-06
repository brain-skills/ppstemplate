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

    setActive(location.hash?.slice("all"));
  })();

     function initFontScaler() {
        const sliders = document.querySelectorAll("#fontSlider");
        const increaseBtns = document.querySelectorAll("#increase");
        const decreaseBtns = document.querySelectorAll("#decrease");
        const resetBtns = document.querySelectorAll("#resetFont");
        const fontSizeLabels = document.querySelectorAll("#fontSizeLabel");

        if (!sliders.length && !increaseBtns.length) return;

        const FONT_MAP = {
          80: 12,
          90: 14,
          100: 16,
          110: 18,
          125: 20,
          150: 22,
          175: 24,
          200: 28,
        };

        const ALL_STEPS = [80, 90, 100, 110, 125, 150, 175, 200];
        const DEFAULT_PERCENT = 100;
        const BASE_FONT_PX = 16;

        function getMaxPercent() {
          const width = window.innerWidth;

          if (width > 1920) return 200;
          if (width >= 1200) return 150;

          return 125;
        }

        function getAvailableSteps() {
          const maxPercent = getMaxPercent();

          return ALL_STEPS.filter((step) => step <= maxPercent);
        }

        let savedPercent = parseInt(localStorage.getItem("fontPercent"), 10);

        if (isNaN(savedPercent) || !(savedPercent in FONT_MAP)) {
          savedPercent = DEFAULT_PERCENT;
        }

        let savedInteractionScroll = null;

        function captureScrollPosition() {
          return {
            left: window.scrollX,
            top: window.scrollY,
            nested: Array.from(document.querySelectorAll(".offcanvas-body"), (element) => ({
              element,
              left: element.scrollLeft,
              top: element.scrollTop,
            })),
          };
        }

        document.addEventListener(
          "pointerdown",
          (event) => {
            if (event.target.closest(".scale-control, .scale-widget")) {
              savedInteractionScroll = captureScrollPosition();
            }
          },
          true,
        );

        document.addEventListener(
          "keydown",
          (event) => {
            const control = event.target.closest(".scale-control, .scale-widget");

            if (control && (event.key === "Enter" || event.key === " ")) {
              savedInteractionScroll = captureScrollPosition();
            }
          },
          true,
        );

        function rescaleIcons(currentPx) {
          const scale = currentPx / BASE_FONT_PX;

          const icons = document.querySelectorAll("svg, img[src*='icon'], img[src*='svg'], .scale-control img");

          icons.forEach((icon) => {
            if (!icon.dataset.baseWidth) {
              const rect = icon.getBoundingClientRect();

              const attrW = parseFloat(icon.getAttribute("width")) || rect.width || 16;

              const attrH = parseFloat(icon.getAttribute("height")) || rect.height || 16;

              icon.dataset.baseWidth = attrW;
              icon.dataset.baseHeight = attrH;
            }

            const baseW = parseFloat(icon.dataset.baseWidth);
            const baseH = parseFloat(icon.dataset.baseHeight);

            let newW;
            let newH;

            if (scale === 1) {
              newW = baseW;
              newH = baseH;
            } else {
              newW = Math.max(8, baseW * scale);
              newH = Math.max(8, baseH * scale);
            }

            icon.style.setProperty("width", `${newW}px`, "important");
            icon.style.setProperty("height", `${newH}px`, "important");
            icon.style.setProperty("max-width", "100%", "important");
            icon.style.setProperty("max-height", "100%", "important");
            icon.style.setProperty("flex-shrink", "0", "important");
          });
        }

        function updateUI(currentPercent) {
          const availableSteps = getAvailableSteps();
          const minStep = availableSteps[0];
          const maxStep = availableSteps[availableSteps.length - 1];

          fontSizeLabels.forEach((label) => {
            label.textContent = `${currentPercent}%`;
          });

          sliders.forEach((slider) => {
            slider.min = 0;
            slider.max = availableSteps.length - 1;
            slider.step = 1;
            slider.value = availableSteps.indexOf(currentPercent);
          });
        }

        function apply(targetPercent, preserveScrollPosition = false, anchorElement = null) {
          const availableSteps = getAvailableSteps();
          const minStep = availableSteps[0];
          const maxStep = availableSteps[availableSteps.length - 1];

          let currentPercent = Math.max(minStep, Math.min(maxStep, targetPercent));

          const scrollPosition = savedInteractionScroll || captureScrollPosition();

          savedInteractionScroll = null;

          const anchorTop = anchorElement?.getBoundingClientRect().top;
          const root = document.documentElement;
          const body = document.body;

          const previousScrollBehavior = root.style.scrollBehavior;
          const previousRootOverflowAnchor = root.style.overflowAnchor;
          const previousBodyOverflowAnchor = body.style.overflowAnchor;

          if (preserveScrollPosition) {
            root.style.scrollBehavior = "auto";
            root.style.overflowAnchor = "none";
            body.style.overflowAnchor = "none";
          }

          currentPercent = availableSteps.reduce((nearest, step) => (Math.abs(step - currentPercent) < Math.abs(nearest - currentPercent) ? step : nearest));

          const targetPx = FONT_MAP[currentPercent];

          root.style.fontSize = `${targetPx}px`;

          rescaleIcons(targetPx);

          localStorage.setItem("fontPercent", currentPercent);
          updateUI(currentPercent);

          if (preserveScrollPosition) {
            window.scrollTo(scrollPosition.left, scrollPosition.top);

            scrollPosition.nested.forEach(({ element, left, top }) => {
              element.scrollTo(left, top);
            });

            if (Number.isFinite(anchorTop) && anchorElement?.isConnected) {
              window.scrollBy(0, anchorElement.getBoundingClientRect().top - anchorTop);
            }

            root.style.scrollBehavior = previousScrollBehavior;
            root.style.overflowAnchor = previousRootOverflowAnchor;
            body.style.overflowAnchor = previousBodyOverflowAnchor;
          }

          return currentPercent;
        }

        savedPercent = apply(savedPercent);

        window.addEventListener("resize", () => {
          const currentPercent = parseInt(localStorage.getItem("fontPercent"), 10) || DEFAULT_PERCENT;

          savedPercent = apply(currentPercent, true);
        });

        function stepChange(direction, button) {
          const availableSteps = getAvailableSteps();
          const currentIndex = availableSteps.indexOf(savedPercent);

          let nextIndex = currentIndex === -1 ? availableSteps.indexOf(DEFAULT_PERCENT) : currentIndex + direction;

          if (nextIndex >= 0 && nextIndex < availableSteps.length) {
            savedPercent = apply(availableSteps[nextIndex], true, button);
          }
        }

        increaseBtns.forEach((button) => {
          button.addEventListener("mousedown", (event) => {
            event.preventDefault();
          });

          button.addEventListener("click", () => {
            stepChange(1, button);
          });
        });

        decreaseBtns.forEach((button) => {
          button.addEventListener("mousedown", (event) => {
            event.preventDefault();
          });

          button.addEventListener("click", () => {
            stepChange(-1, button);
          });
        });

        resetBtns.forEach((button) => {
          button.addEventListener("mousedown", (event) => {
            event.preventDefault();
          });

          button.addEventListener("click", () => {
            savedPercent = apply(DEFAULT_PERCENT, true, button);
          });
        });

        sliders.forEach((slider) => {
          slider.addEventListener("input", () => {
            const val = parseInt(slider.value, 10);
            const availableSteps = getAvailableSteps();
            savedPercent = apply(availableSteps[val], true, slider);
          });
        });
      }

  initFontScaler();
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

  function updateMonthDisplay() {
    if (!monthDisplay) return;

    monthDisplay.textContent = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  updateMonthDisplay();

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
  const EMOJIS = ["😄", "😂", "🔥", "🥳", "😎", "🤩", "😺", "✨", "💙", "🎉", "📎", "😮", "🙌", "👍", "🫶"];

  document.querySelectorAll(".emoji-hover").forEach((btn) => {
    const content = btn.querySelector(".icon-content");
    if (!content) return;

    const original = content.innerHTML;

    btn.addEventListener("mouseenter", () => {
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      content.innerHTML = emoji;
    });

    btn.addEventListener("mouseleave", () => {
      content.innerHTML = original;
    });
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

        if (!card) {
          return;
        }

        const titleElement = card.querySelector(".card-title");

        if (!titleElement) {
          return;
        }

        const productName = titleElement.textContent.trim();

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

document.querySelectorAll("section").forEach((section) => {
  const swiperEl = section.querySelector(".swiper");
  if (!swiperEl) return;

  const slides = parseInt(section.dataset.slides) || 3;
  const gap = parseInt(section.dataset.gap) || 24;

  new Swiper(swiperEl, {
    slidesPerView: slides,
    spaceBetween: gap,

    loop: true,

    navigation: {
      nextEl: section.querySelector(".swiper-button-next"),
      prevEl: section.querySelector(".swiper-button-prev"),
    },

    pagination: {
      el: section.querySelector(".swiper-pagination"),
      clickable: true,
    },

    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: gap,
      },
      768: {
        slidesPerView: Math.min(2, slides),
        spaceBetween: gap,
      },
      1200: {
        slidesPerView: slides,
        spaceBetween: gap,
      },
    },
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof GLightbox !== "undefined") {
    const lightbox = GLightbox({
      selector: ".glightbox",
      loop: true,
      zoomable: true,
      openEffect: "zoom",
      closeEffect: "fade",
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const chatWidget = document.getElementById("chatWidget");
  const closeChat = document.getElementById("closeChat");
  const chatToggle = document.getElementById("chatToggle");

  if (!chatWidget || !closeChat || !chatToggle) return;

  chatWidget.inert = true;
  let previousOverflow = null;

  chatToggle.addEventListener("click", () => {
    chatWidget.style.display = "flex";
    chatWidget.classList.add("open");
    chatWidget.inert = false;
    chatToggle.style.display = "none";
    chatToggle.setAttribute("aria-expanded", "true");

    if (window.innerWidth < 700) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    closeChat.focus({ preventScroll: true });
  });

  closeChat.addEventListener("click", () => {
    chatWidget.style.display = "none";
    chatWidget.classList.remove("open");
    chatWidget.inert = true;
    chatToggle.style.display = "flex";
    chatToggle.setAttribute("aria-expanded", "false");

    if (previousOverflow !== null) {
      document.body.style.overflow = previousOverflow;
      previousOverflow = null;
    }

    chatToggle.focus({ preventScroll: true });
  });

  chatWidget.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeChat.click();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationWindow = document.getElementById("notificationWindow");
  if (!notificationBtn || !notificationWindow) return;

  const list = document.querySelector("#NotificationsDiv > ul");
  const emptyTemplate = document.getElementById("tpl-empty-notification");
  if (list && emptyTemplate && !list.children.length) {
    list.appendChild(emptyTemplate.content.cloneNode(true));
  }

  notificationWindow.inert = true;
  function setNotificationsOpen(isOpen) {
    notificationWindow.classList.toggle("active", isOpen);
    notificationWindow.inert = !isOpen;
    notificationBtn.setAttribute("aria-expanded", String(isOpen));
  }

  notificationBtn.addEventListener("click", () => {
    setNotificationsOpen(!notificationWindow.classList.contains("active"));
  });
  document.addEventListener("click", (event) => {
    if (!notificationBtn.contains(event.target) && !notificationWindow.contains(event.target)) {
      setNotificationsOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && notificationWindow.classList.contains("active")) {
      setNotificationsOpen(false);
      notificationBtn.focus({ preventScroll: true });
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openSearch");
  const overlay = document.getElementById("headerSearchOverlay");
  const closeBtn = document.getElementById("closeSearch");
  const input = document.getElementById("headerSearchInput");

  if (!openBtn || !overlay) return;

  openBtn.addEventListener("click", function () {
    overlay.classList.add("active");
    setTimeout(() => input.focus(), 100);
  });

  closeBtn.addEventListener("click", function () {
    overlay.classList.remove("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".js-open-news");

  cards.forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
      window.location.href = "news-article-template.html";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateInput");
  const monthDisplay = document.getElementById("monthDisplay");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!dateInput || !monthDisplay || typeof flatpickr === "undefined") return;

  let currentDate = new Date();

  function updateMonthDisplay(date) {
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    monthDisplay.innerHTML = `${month} <span>${year}</span>`;
  }

  updateMonthDisplay(currentDate);

  const picker = flatpickr(dateInput, {
    dateFormat: "d.m.Y",
    defaultDate: currentDate,
    locale: "en",

    onChange: function (selectedDates) {
      if (!selectedDates.length) return;

      currentDate = selectedDates[0];
      updateMonthDisplay(currentDate);
    },
  });

  monthDisplay.addEventListener("click", () => {
    picker.open();
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);

      picker.setDate(currentDate, true);
      updateMonthDisplay(currentDate);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);

      picker.setDate(currentDate, true);
      updateMonthDisplay(currentDate);
    });
  }
});

document.querySelectorAll(".reset-filters-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const container = button.closest(".d-flex");

    container.querySelectorAll(".filter-select").forEach((select) => {
      select.selectedIndex = 0;
    });

    container.querySelectorAll(".filter-date").forEach((input) => {
      input.value = "";
    });
  });
});

(function () {
  function initializeBackToTop() {
    if (document.querySelector(".btn-to-top button")) return;

    const container = document.createElement("div");
    const button = document.createElement("button");
    const arrow = document.createElement("span");

    container.className = "btn-to-top";

    Object.assign(container.style, {
      position: "fixed",
      right: "1.25rem",
      bottom: "6.25rem",
      zIndex: "1050",
      opacity: "0",
      visibility: "hidden",
      transform: "translateY(15px)",
      transition:
        "opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease",
    });

    button.type = "button";
    button.className = "btn rounded-circle";
    button.setAttribute("aria-label", "Go to top");

    Object.assign(button.style, {
      width: "2.875rem",
      height: "2.875rem",
      padding: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#2f8ed9",
      border: "none",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(47, 142, 217, 0.35)",
      transition:
        "background-color 0.25s ease, box-shadow 0.25s ease",
      cursor: "pointer",
    });

    button.style.setProperty("transform", "none", "important");

    Object.assign(arrow.style, {
      width: "0.625rem",
      height: "0.625rem",
      borderTop: "0.125rem solid #fff",
      borderLeft: "0.125rem solid #fff",
      transform: "rotate(45deg) translate(0.125rem, 0.125rem)",
    });

    arrow.style.setProperty(
      "transform",
      "rotate(45deg) translate(0.125rem, 0.125rem)",
      "important"
    );

    arrow.style.transition = "none";

    button.addEventListener("mouseenter", function () {
      button.style.backgroundColor = "#247fc5";
      button.style.boxShadow =
        "0 8px 20px rgba(47, 142, 217, 0.45)";
    });

    button.addEventListener("mouseleave", function () {
      button.style.backgroundColor = "#2f8ed9";
      button.style.boxShadow =
        "0 4px 14px rgba(47, 142, 217, 0.35)";
    });

    button.appendChild(arrow);
    container.appendChild(button);
    document.body.appendChild(container);

    function updateVisibility() {
      const isVisible = window.scrollY >= 250;

      container.style.opacity = isVisible ? "1" : "0";
      container.style.visibility = isVisible ? "visible" : "hidden";
      container.style.transform = isVisible
        ? "translateY(0)"
        : "translateY(15px)";
    }

    window.addEventListener("scroll", updateVisibility, {
      passive: true,
    });

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    updateVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeBackToTop,
      { once: true }
    );
  } else {
    initializeBackToTop();
  }
})();


document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".school-header");
  if (!header) return;

  const nativeMenus = header.querySelectorAll("details");
  const dropdownButtons = header.querySelectorAll('[data-bs-toggle="dropdown"]');

  function closeOtherMenus(currentMenu) {
    nativeMenus.forEach((menu) => {
      if (menu !== currentMenu) menu.open = false;
    });

    dropdownButtons.forEach((button) => {
      if (button !== currentMenu) {
        window.bootstrap?.Dropdown.getInstance(button)?.hide();
      }
    });
  }

  nativeMenus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (menu.open) closeOtherMenus(menu);
    });
  });

  header.addEventListener("show.bs.dropdown", (event) => {
    closeOtherMenus(event.target);
  });

  document.addEventListener("click", (event) => {
    nativeMenus.forEach((menu) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const messagesBtn = document.getElementById("messagesBtn");
  const messagesWindow = document.getElementById("messagesWindow");
  if (!messagesBtn || !messagesWindow) return;

  messagesWindow.inert = true;
  function setMessagesOpen(isOpen) {
    messagesWindow.classList.toggle("active", isOpen);
    messagesWindow.inert = !isOpen;
    messagesBtn.setAttribute("aria-expanded", String(isOpen));
  }

  messagesBtn.addEventListener("click", () => {
    setMessagesOpen(!messagesWindow.classList.contains("active"));
  });
  document.addEventListener("click", (event) => {
    if (!messagesBtn.contains(event.target) && !messagesWindow.contains(event.target)) {
      setMessagesOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && messagesWindow.classList.contains("active")) {
      setMessagesOpen(false);
      messagesBtn.focus({ preventScroll: true });
    }
  });
});
