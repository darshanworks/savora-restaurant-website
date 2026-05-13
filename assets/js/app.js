/* ============================================================
   app.js
   ============================================================ */

"use strict";

AOS.init({
  duration: 700,
  once: true,
  easing: "ease-out-cubic",
  offset: 60,
});

/* ============================================================
   NAVBAR: SCROLL EFFECT + ACTIVE NAV LINK
   ============================================================ */
(function initNavbar() {
  const nav = document.querySelector(".navbar");
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav-item .nav-link");

  function onScroll() {
    // Toggle scrolled class for glassmorphism
    if (document.documentElement.scrollTop > 50) {
      nav.classList.add("header-scrolled");
    } else {
      nav.classList.remove("header-scrolled");
    }

    // Scroll-to-top button visibility
    const scrollBtn = document.getElementById("scrollTopBtn");
    if (scrollBtn) {
      if (document.documentElement.scrollTop > 300) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    }

    // Active nav link highlight based on scroll position
    let currentSection = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href && href === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ============================================================
   NAVBAR: MOBILE COLLAPSE ON NAV LINK CLICK
   ============================================================ */
(function initMobileNav() {
  const navLinks = document.querySelectorAll(".nav-link");
  const navCollapse = document.querySelector(".navbar-collapse.collapse");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navCollapse && navCollapse.classList.contains("show")) {
        navCollapse.classList.remove("show");
      }
    });
  });
})();

/* ============================================================
   SCROLL TO TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ============================================================
   CART SYSTEM
   ============================================================ */
const cart = {
  items: [], // { name, price, qty }

  /* Open/close cart sidebar */
  openCart() {
    document.getElementById("cartSidebar").classList.add("open");
    document.getElementById("cartOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeCart() {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("active");
    document.body.style.overflow = "";
  },

  /* Add item — matches by name, increments qty if exists */
  addItem(name, price) {
    const existing = this.items.find((i) => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ name, price, qty: 1 });
    }
    this.render();
    this.updateCount();
    showToast(`${name} added to cart!`);
  },

  /* Remove item by name */
  removeItem(name) {
    this.items = this.items.filter((i) => i.name !== name);
    this.render();
    this.updateCount();
  },

  /* Update item quantity */
  updateQty(name, delta) {
    const item = this.items.find((i) => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(name);
    } else {
      this.render();
      this.updateCount();
    }
  },

  /* Render cart items list */
  render() {
    const list = document.getElementById("cartItemsList");
    const footer = document.getElementById("cartFooter");
    const totalEl = document.getElementById("cartTotal");

    if (!list) return;

    if (this.items.length === 0) {
      list.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-utensils"></i>
                    <p>Your cart is empty</p>
                </div>`;
      if (footer) footer.style.display = "none";
      return;
    }

    let total = 0;
    list.innerHTML = this.items
      .map((item) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        const safeName = item.name.replace(/'/g, "\\'");
        return `
                <div class="cart-item">
                    <span class="cart-item-name">${item.name}</span>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="cart.updateQty('${safeName}', -1)">−</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="qty-btn" onclick="cart.updateQty('${safeName}', 1)">+</button>
                    </div>
                    <span class="cart-item-price">₹${itemTotal}</span>
                    <button class="cart-item-remove" onclick="cart.removeItem('${safeName}')" aria-label="Remove item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>`;
      })
      .join("");

    if (totalEl) totalEl.textContent = `₹${total}`;
    if (footer) footer.style.display = "block";
  },

  /* Update cart count badge */
  updateCount() {
    const countEl = document.getElementById("cartCount");
    if (!countEl) return;
    const total = this.items.reduce((sum, i) => sum + i.qty, 0);
    countEl.textContent = total;
    // Bounce animation
    countEl.classList.remove("bounce");
    void countEl.offsetWidth; // reflow
    countEl.classList.add("bounce");
  },
};

/* Global add-to-cart function called from HTML onclick */
function addToCart(name, price, btnEl) {
  cart.addItem(name, price);

  // Button ripple animation
  if (btnEl) {
    btnEl.classList.add("btn-adding");
    setTimeout(() => btnEl.classList.remove("btn-adding"), 600);
  }
}

/* Cart sidebar open/close wiring */
(function initCartControls() {
  const openBtn = document.getElementById("openCartBtn");
  const closeBtn = document.getElementById("closeCart");
  const overlay = document.getElementById("cartOverlay");

  if (openBtn) openBtn.addEventListener("click", () => cart.openCart());
  if (closeBtn) closeBtn.addEventListener("click", () => cart.closeCart());
  if (overlay) overlay.addEventListener("click", () => cart.closeCart());
})();

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* ============================================================
   VANILLATILT — 3D TILT ON FOOD CARDS
   ============================================================ */
(function initTilt() {
  // VanillaTilt loaded via CDN; apply to food cards on desktop only
  if (window.VanillaTilt && window.innerWidth > 991) {
    VanillaTilt.init(document.querySelectorAll(".food-card"), {
      max: 6,
      speed: 400,
      glare: true,
      "max-glare": 0.08,
      scale: 1.03,
    });
  }
})();

/* ============================================================
   RESERVATION FORM SUBMISSION
   ============================================================ */
function submitReservation() {
  const name = document.getElementById("resName");
  const email = document.getElementById("resEmail");
  const guests = document.getElementById("resGuests");
  const date = document.getElementById("resDate");
  const time = document.getElementById("resTime");

  // Basic validation
  const fields = [name, email, guests, date, time];
  let valid = true;

  fields.forEach((field) => {
    if (!field) return;
    if (!field.value || field.value === "") {
      field.style.borderColor = "#ef4444";
      field.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.15)";
      valid = false;
    } else {
      field.style.borderColor = "#22c55e";
      field.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)";
    }
  });

  if (!valid) {
    showToast("Please fill all required fields.");
    return;
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email.value)) {
    email.style.borderColor = "#ef4444";
    showToast("Please enter a valid email address.");
    return;
  }

  // Success
  showToast(`Table reserved for ${name.value}! See you soon.`);

  // Reset fields
  fields.forEach((field) => {
    if (field) {
      field.value = "";
      field.style.borderColor = "";
      field.style.boxShadow = "";
    }
  });
}

/* ============================================================
   NEWSLETTER SUBSCRIPTION
   ============================================================ */
function subscribeNewsletter() {
  const emailEl = document.getElementById("newsletterEmail");
  if (!emailEl) return;

  const email = emailEl.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    emailEl.style.borderColor = "#ef4444";
    showToast("Please enter a valid email address.");
    return;
  }

  emailEl.style.borderColor = "#22c55e";
  emailEl.value = "";
  showToast("Successfully subscribed! Welcome aboard.");

  setTimeout(() => {
    emailEl.style.borderColor = "";
  }, 2000);
}

/* ============================================================
   CART COUNT BOUNCE ANIMATION (CSS class toggle)
   ============================================================ */
(function injectCartBounceStyle() {
  const style = document.createElement("style");
  style.textContent = `
        @keyframes cartBounce {
            0%   { transform: scale(1); }
            40%  { transform: scale(1.5); }
            70%  { transform: scale(0.85); }
            100% { transform: scale(1); }
        }
        .cart-count.bounce { animation: cartBounce 0.4s ease; }
    `;
  document.head.appendChild(style);
})();
