/**
 * ArcNexus.gg - Main JavaScript
 * Version: 1.0.0
 * Production-ready, vanilla JS only
 */

'use strict';

/* ── Page Loader ────────────────────────────────────────────── */
(function initPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 200);
  });
})();

/* ── Navbar ─────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll effect
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const links = navbar.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentPath) link.classList.add('active');
  });

  // Mobile menu toggle
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuBg = document.getElementById('mobileMenuBg');

  if (toggle && mobileMenu) {
    function toggleMenu(open) {
      mobileMenu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      toggleMenu(!isOpen);
    });

    mobileMenuBg?.addEventListener('click', () => toggleMenu(false));

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') toggleMenu(false);
    });
  }
})();

/* ── Smooth Scroll ──────────────────────────────────────────── */
document.addEventListener('click', e => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const target = document.querySelector(anchor.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
  window.scrollTo({ top: target.offsetTop - navH - 16, behavior: 'smooth' });
});

/* ── Scroll Reveal ──────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), Number(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ── Hero Counter Animation ─────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    function update(ts) {
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ── FAQ Accordion ──────────────────────────────────────────── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => i.classList.remove('open'));
      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); question.click(); }
    });
  });
})();

/* ── Marketplace Filters ────────────────────────────────────── */
(function initFilters() {
  const options = document.querySelectorAll('.filter-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      opt.classList.toggle('active');
      filterListings();
    });
  });

  const clearBtn = document.querySelector('.filter-clear');
  clearBtn?.addEventListener('click', () => {
    options.forEach(o => o.classList.remove('active'));
    filterListings();
  });

  // Mobile filter toggle
  const filterToggle = document.getElementById('filterToggle');
  const filterSidebar = document.querySelector('.filter-sidebar');
  filterToggle?.addEventListener('click', () => {
    filterSidebar?.classList.toggle('show');
  });
})();

/* ── Sort & Filter Logic ────────────────────────────────────── */
function filterListings() {
  const listings = document.querySelectorAll('.listing-card[data-category]');
  if (!listings.length) return;

  const activeCategories = Array.from(document.querySelectorAll('.filter-option.active[data-category]'))
    .map(o => o.dataset.category);

  listings.forEach(card => {
    const cat = card.dataset.category;
    const show = !activeCategories.length || activeCategories.includes(cat);
    card.style.display = show ? '' : 'none';
  });

  // Update count
  const countEl = document.querySelector('.listings-count strong');
  if (countEl) {
    const visible = Array.from(listings).filter(c => c.style.display !== 'none').length;
    countEl.textContent = visible;
  }
}

/* ── Sort Listings ──────────────────────────────────────────── */
(function initSort() {
  const sortSelect = document.querySelector('.sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', () => {
    const grid = document.querySelector('.listings-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.listing-card'));

    cards.sort((a, b) => {
      const val = sortSelect.value;
      if (val === 'price-asc')  return parseFloat(a.dataset.price||0) - parseFloat(b.dataset.price||0);
      if (val === 'price-desc') return parseFloat(b.dataset.price||0) - parseFloat(a.dataset.price||0);
      if (val === 'newest')     return parseInt(b.dataset.date||0) - parseInt(a.dataset.date||0);
      if (val === 'popular')    return parseInt(b.dataset.views||0) - parseInt(a.dataset.views||0);
      return 0;
    });

    cards.forEach(c => grid.appendChild(c));
  });
})();

/* ── Search ─────────────────────────────────────────────────── */
(function initSearch() {
  const searchInput = document.getElementById('heroSearch');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      const category = document.getElementById('heroCategory')?.value || '';
      if (query) {
        const params = new URLSearchParams({ q: query, cat: category });
        window.location.href = `marketplace.html?${params.toString()}`;
      }
    }
  });

  // Populate search from URL params
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const cat = params.get('cat');
  if (q) {
    const mp = document.getElementById('marketSearch');
    if (mp) mp.value = q;
  }
  if (cat) {
    const cs = document.getElementById('marketCategory');
    if (cs) cs.value = cat;
  }
})();

/* ── Marketplace Search Live ────────────────────────────────── */
(function initMarketSearch() {
  const input = document.getElementById('marketSearch');
  if (!input) return;

  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const q = input.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.listing-card');
      cards.forEach(card => {
        const title = card.querySelector('.listing-card-title')?.textContent.toLowerCase() || '';
        card.style.display = (!q || title.includes(q)) ? '' : 'none';
      });
    }, 250);
  });
})();

/* ── Image Gallery (Listing Detail) ────────────────────────── */
(function initGallery() {
  const thumbs = document.querySelectorAll('.listing-thumb');
  const mainImg = document.getElementById('mainListingImg');
  if (!thumbs.length || !mainImg) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.src = thumb.src;
    });
  });
})();

/* ── Wishlist Toggle ────────────────────────────────────────── */
(function initWishlist() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-wishlist]');
    if (!btn) return;
    const active = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!active));
    btn.querySelector('.wish-icon')?.classList.toggle('active', !active);
    showToast(!active ? 'Added to wishlist' : 'Removed from wishlist', 'info');
  });
})();

/* ── Auth Forms ─────────────────────────────────────────────── */
(function initAuthForms() {
  // XSS sanitizer
  function sanitize(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validatePassword(pass) {
    return pass.length >= 8;
  }

  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const email = loginForm.querySelector('#email');
      const password = loginForm.querySelector('#password');

      if (!validateEmail(email.value)) {
        setError(email, 'Please enter a valid email address.');
        valid = false;
      } else clearError(email);

      if (!validatePassword(password.value)) {
        setError(password, 'Password must be at least 8 characters.');
        valid = false;
      } else clearError(password);

      if (valid) {
        const btn = loginForm.querySelector('[type=submit]');
        btn.disabled = true;
        btn.textContent = 'Signing in…';
        // Simulate API call
        setTimeout(() => {
          showToast('Login successful! Redirecting…', 'success');
          setTimeout(() => window.location.href = 'index.html', 1500);
        }, 1200);
      }
    });
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const username = registerForm.querySelector('#username');
      const email    = registerForm.querySelector('#email');
      const password = registerForm.querySelector('#password');
      const confirm  = registerForm.querySelector('#confirmPassword');
      const terms    = registerForm.querySelector('#termsCheck');

      if (!username.value.trim() || username.value.trim().length < 3) {
        setError(username, 'Username must be at least 3 characters.'); valid = false;
      } else clearError(username);

      if (!validateEmail(email.value)) {
        setError(email, 'Please enter a valid email.'); valid = false;
      } else clearError(email);

      if (!validatePassword(password.value)) {
        setError(password, 'Password must be at least 8 characters.'); valid = false;
      } else clearError(password);

      if (password.value !== confirm.value) {
        setError(confirm, 'Passwords do not match.'); valid = false;
      } else clearError(confirm);

      if (terms && !terms.dataset.checked) {
        showToast('Please accept the Terms of Service.', 'error'); valid = false;
      }

      if (valid) {
        const btn = registerForm.querySelector('[type=submit]');
        btn.disabled = true;
        btn.textContent = 'Creating account…';
        setTimeout(() => {
          showToast('Account created! Welcome to ArcNexus.gg!', 'success');
          setTimeout(() => window.location.href = 'index.html', 1500);
        }, 1400);
      }
    });
  }

  // Custom checkboxes
  document.querySelectorAll('.checkbox-group').forEach(group => {
    const checkbox = group.querySelector('.checkbox-custom');
    const input    = group.querySelector('input[type=checkbox]');
    if (!checkbox) return;

    function toggle() {
      const checked = checkbox.classList.toggle('checked');
      if (input) input.checked = checked;
      checkbox.dataset.checked = checked ? '1' : '';
      checkbox.setAttribute('aria-checked', String(checked));
    }

    group.addEventListener('click', e => {
      if (e.target.tagName === 'A') return;
      toggle();
    });
    group.addEventListener('keydown', e => {
      if (e.key === ' ') { e.preventDefault(); toggle(); }
    });
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('tabindex', '0');
  });

  function setError(input, msg) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.add('has-error');
    const err = group.querySelector('.form-error');
    if (err) err.textContent = msg;
  }

  function clearError(input) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.remove('has-error');
  }
})();

/* ── Password Toggle ────────────────────────────────────────── */
(function initPasswordToggle() {
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    const targetId = btn.dataset.togglePassword;
    const input = document.getElementById(targetId);
    if (!input) return;
    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁️';
    });
  });
})();

/* ── Contact Form ───────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name    = form.querySelector('#contactName');
    const email   = form.querySelector('#contactEmail');
    const message = form.querySelector('#contactMessage');

    if (!name.value.trim()) {
      name.closest('.form-group').classList.add('has-error'); valid = false;
    } else name.closest('.form-group').classList.remove('has-error');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.closest('.form-group').classList.add('has-error'); valid = false;
    } else email.closest('.form-group').classList.remove('has-error');

    if (message.value.trim().length < 20) {
      message.closest('.form-group').classList.add('has-error'); valid = false;
    } else message.closest('.form-group').classList.remove('has-error');

    if (valid) {
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        showToast('Message sent! We\'ll reply within 24 hours.', 'success');
        form.reset();
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }, 1200);
    }
  });
})();

/* ── Admin Sidebar Tabs ──────────────────────────────────────── */
(function initAdminNav() {
  const navItems = document.querySelectorAll('.admin-nav-item[data-section]');
  const sections = document.querySelectorAll('.admin-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.add('hidden'));
      item.classList.add('active');
      document.getElementById('section-' + target)?.classList.remove('hidden');
    });
  });
})();

/* ── Profile Tabs ───────────────────────────────────────────── */
(function initProfileTabs() {
  const tabs    = document.querySelectorAll('.profile-tab[data-tab]');
  const panels  = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById('tab-' + target)?.classList.remove('hidden');
    });
  });
})();

/* ── Pagination ─────────────────────────────────────────────── */
(function initPagination() {
  const pageButtons = document.querySelectorAll('.page-btn[data-page]');
  pageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'prev' || page === 'next') return; // would handle API in production
      pageButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.scrollTo({ top: document.querySelector('.marketplace-layout')?.offsetTop - 100 || 0, behavior: 'smooth' });
    });
  });
})();

/* ── Toast System ────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

/* ── Listing Thumb Switcher ─────────────────────────────────── */
(function initThumbSwitcher() {
  const mainImg = document.getElementById('mainListingImg');
  const thumbs  = document.querySelectorAll('.listing-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.style.opacity = '0';
      mainImg.style.transition = 'opacity 0.2s';
      setTimeout(() => {
        mainImg.src = thumb.src;
        mainImg.style.opacity = '1';
      }, 200);
    });
  });
})();

/* ── Buy Button ─────────────────────────────────────────────── */
(function initBuyButton() {
  const buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;

  buyBtn.addEventListener('click', () => {
    buyBtn.disabled = true;
    buyBtn.textContent = 'Processing…';
    setTimeout(() => {
      showToast('Redirecting to secure checkout…', 'success');
      setTimeout(() => {
        buyBtn.disabled = false;
        buyBtn.textContent = '💳 Buy Now';
        // In production: redirect to checkout
      }, 2000);
    }, 800);
  });
})();

/* ── Admin Chart (Canvas Sparkline) ────────────────────────── */
(function initAdminCharts() {
  const charts = document.querySelectorAll('[data-sparkline]');
  charts.forEach(canvas => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const data = JSON.parse(canvas.dataset.sparkline || '[]');
    const isUp = canvas.dataset.trend !== 'down';
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const w = canvas.width, h = canvas.height;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * w,
      y: h - ((v - min) / range) * h * 0.8 - h * 0.1
    }));

    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const color = isUp ? 'rgba(0,230,118,' : 'rgba(255,68,68,';
    grad.addColorStop(0, color + '0.3)');
    grad.addColorStop(1, color + '0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length-1].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = isUp ? '#00e676' : '#ff4444';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  });
})();

/* ── Clipboard Copy ─────────────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const text = btn.dataset.copy;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
});

/* ── Lazy Load Images ───────────────────────────────────────── */
(function initLazyLoad() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => observer.observe(img));
})();

/* ── Misc Utilities ─────────────────────────────────────────── */
// Format price
function formatPrice(val) {
  return '$' + parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Debounce
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), ms); };
}

window.ArcNexus = { showToast, formatPrice, formatDate, debounce };
