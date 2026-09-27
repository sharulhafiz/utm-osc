document.getElementById('year').textContent = new Date().getFullYear();

// --- Mobile hamburger menu ---
const navToggle = document.querySelector('.nav-toggle');
const topNav = document.querySelector('.top-nav');
if (navToggle && topNav) {
  const setMenu = (open) => {
    topNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(!topNav.classList.contains('open')));
  topNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });
}

// --- Scroll Spy (nav highlight) ---
const links = Array.from(document.querySelectorAll('.top-nav a[href^="#"]'));
const sections = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 }
  );
  sections.forEach((section) => observer.observe(section));
}

// --- Reveal animations ---
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('show'));
}

// --- Accordion toggle ---
document.querySelectorAll('.accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    const panel = header.nextElementSibling;
    const isOpen = panel.classList.contains('open');

    // Close all accordions in the same group
    const group = header.closest('.accordion-group');
    if (group) {
      group.querySelectorAll('.accordion-panel.open').forEach((p) => {
        if (p !== panel) {
          p.classList.remove('open');
          p.style.maxHeight = null;
          p.previousElementSibling.classList.remove('active');
        }
      });
    }

    // Toggle this one
    if (isOpen) {
      panel.classList.remove('open');
      panel.style.maxHeight = null;
      header.classList.remove('active');
    } else {
      panel.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
      header.classList.add('active');
    }
  });
});

// --- User pathway buttons ---
document.querySelectorAll('.path-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.path;

    // Toggle active state
    document.querySelectorAll('.path-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Show relevant content with fade
    document.querySelectorAll('.path-content').forEach((el) => {
      el.style.display = el.dataset.path === target ? 'block' : 'none';
    });
  });
});

// --- Operating Model tab switching ---
document.querySelectorAll('.model-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    document.querySelectorAll('.model-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.model-panel').forEach((p) => {
      p.classList.remove('active');
      if (p.id === 'model-' + target) {
        p.classList.add('active');
      }
    });
  });
});
