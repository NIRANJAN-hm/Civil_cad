const header = document.getElementById("header");
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const navClose = document.getElementById("navClose");
const overlay = document.getElementById("overlay");
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const backToTop = document.getElementById("backToTop");
const dropdownToggles = document.querySelectorAll(".nav__dropdown-toggle");
const desktopQuery = window.matchMedia("(min-width: 992px)");

/* ---------- Mobile menu ---------- */
function openMenu() {
  nav.classList.add("is-open");
  overlay.classList.add("is-visible");
  hamburger.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
}

function closeMenu() {
  nav.classList.remove("is-open");
  overlay.classList.remove("is-visible");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}

function closeDropdowns(except) {
  dropdownToggles.forEach((btn) => {
    if (btn.parentElement === except) return;
    btn.parentElement.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  });
}

hamburger.addEventListener("click", openMenu);
navClose.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

desktopQuery.addEventListener("change", (e) => {
  if (e.matches) closeMenu();
  closeDropdowns();
});

/* ---------- Dropdowns ---------- */
dropdownToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    closeDropdowns(item);
    const isOpen = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
});

document.addEventListener("click", (e) => {
  if (desktopQuery.matches && !e.target.closest(".nav__item--dropdown")) {
    closeDropdowns();
  }
});

/* ---------- Search ---------- */
searchToggle.addEventListener("click", () => {
  const isOpen = searchBar.classList.toggle("is-open");
  searchToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) searchBar.querySelector("input").focus();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeMenu();
  closeDropdowns();
  searchBar.classList.remove("is-open");
  searchToggle.setAttribute("aria-expanded", "false");
});

/* ---------- Scroll effects ---------- */
function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
  backToTop.classList.toggle("is-visible", window.scrollY > 400);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- Stat counters ---------- */
const counters = document.querySelectorAll(".counter");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCounter(el) {
  const target = Number(el.dataset.target);
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window && !reduceMotion) {
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => {
    el.textContent = "0";
    counterObserver.observe(el);
  });
}

/* ---------- Course filter tabs ---------- */
const filterTabs = document.querySelectorAll(".filter-tab");
const courseCards = document.querySelectorAll(".course-card");

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    filterTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-pressed", String(active));
    });

    courseCards.forEach((card) => {
      card.classList.toggle("is-hidden", filter !== "all" && card.dataset.level !== filter);
    });
  });
});

/* ---------- Add to cart ---------- */
const cartLink = document.querySelector(".cart");
const cartCount = document.querySelector(".cart__count");
let cartItems = 0;

document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-added")) return;

    cartItems += 1;
    cartCount.textContent = cartItems;
    btn.classList.add("is-added");
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    btn.setAttribute("aria-label", `${btn.dataset.name} added to cart`);

    cartLink.classList.remove("bump");
    void cartLink.offsetWidth; // restart the animation
    cartLink.classList.add("bump");
  });
});

/* ---------- Testimonials slider ---------- */
const slider = document.querySelector(".slider");

if (slider) {
  const track = slider.querySelector(".slider__track");
  const slides = Array.from(track.children);
  const dotsWrap = slider.querySelector(".slider__dots");
  let autoplayId;
  let resizeId;

  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
  const perView = () => Math.max(1, Math.round(track.clientWidth / step()));
  const pageCount = () => slides.length - perView() + 1;
  const currentIndex = () => Math.round(track.scrollLeft / step());

  function goTo(index) {
    const max = pageCount() - 1;
    const target = index > max ? 0 : index < 0 ? max : index;
    track.scrollTo({ left: target * step() });
  }

  function updateDots() {
    const active = currentIndex();
    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
      dot.setAttribute("aria-current", String(i === active));
    });
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i < pageCount(); i++) {
      const dot = document.createElement("button");
      dot.className = "slider__dot";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    updateDots();
  }

  function stopAutoplay() {
    clearInterval(autoplayId);
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    autoplayId = setInterval(() => goTo(currentIndex() + 1), 5000);
  }

  slider.querySelector(".slider__btn--prev").addEventListener("click", () => goTo(currentIndex() - 1));
  slider.querySelector(".slider__btn--next").addEventListener("click", () => goTo(currentIndex() + 1));
  track.addEventListener("scroll", () => requestAnimationFrame(updateDots), { passive: true });

  track.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    goTo(currentIndex() + (e.key === "ArrowRight" ? 1 : -1));
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);
  slider.addEventListener("touchstart", stopAutoplay, { passive: true });

  window.addEventListener("resize", () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(buildDots, 150);
  });

  buildDots();
  startAutoplay();
}

/* ---------- Scroll reveal ---------- */
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealTargets = document.querySelectorAll(
    ".section__head, .category-card, .course-card, .product-card, .feature-card, .step, .slider"
  );

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => {
    const index = Array.from(el.parentElement.children).indexOf(el);
    el.style.transitionDelay = `${(index % 4) * 80}ms`;
    el.classList.add("reveal");

    // Drop reveal classes once done so hover transitions work normally
    el.addEventListener("transitionend", function cleanup(e) {
      if (e.target !== el || e.propertyName !== "opacity") return;
      el.classList.remove("reveal", "is-visible");
      el.style.transitionDelay = "";
      el.removeEventListener("transitionend", cleanup);
    });

    revealObserver.observe(el);
  });
}

/* ---------- Footer ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

const newsletterForm = document.getElementById("newsletterForm");
const newsletterMsg = document.getElementById("newsletterMsg");

newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // TODO: connect to your email service / backend
  newsletterMsg.textContent = "Thanks for subscribing! Check your inbox soon.";
  newsletterForm.reset();
});
