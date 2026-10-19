/* =========================================================
   RASDEV V2 — interaksi halaman
   Navbar, scroll spy, reveal, filter properti, kontak
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Navbar: sticky shadow + hamburger ---------- */
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const menu = $('#nav-menu');

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!header.contains(e.target)) setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll spy: tandai menu aktif ---------- */
  const navLinks = $$('.nav-links a[href^="#"]:not(.btn)');
  const spySections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.removeAttribute('aria-current'));
        const active = navLinks.find((link) => link.getAttribute('href') === '#' + entry.target.id);
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach((section) => spy.observe(section));
  }

  /* ---------- Scroll reveal (sekali per elemen) ---------- */
  $$('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--d', i));
  });

  const reveals = $$('.reveal');
  const show = (el) => {
    el.classList.add('is-visible');
    // lepas delay stagger setelah animasi masuk, supaya hover tetap responsif
    setTimeout(() => el.style.removeProperty('--d'), 1200);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach(show);
  }

  /* ---------- Search / filter properti ---------- */
  const searchForm = $('#search-form');
  const cards = $$('.property-card');
  const countEl = $('#results-count');
  const emptyEl = $('#empty-state');

  const applyFilter = () => {
    const { location, type, status } = Object.fromEntries(new FormData(searchForm));
    let visible = 0;

    cards.forEach((card) => {
      const match =
        (!location || card.dataset.location === location) &&
        (!type || card.dataset.type === type) &&
        (!status || card.dataset.status === status);
      card.hidden = !match;
      if (match) visible += 1;
    });

    countEl.textContent = visible === 1 ? 'Showing 1 property' : `Showing ${visible} properties`;
    emptyEl.hidden = visible !== 0;
  };

  searchForm.addEventListener('change', applyFilter);
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilter();
    $('#properties').scrollIntoView();
  });

  $$('[data-reset]').forEach((btn) => btn.addEventListener('click', () => {
    searchForm.reset();
    applyFilter();
  }));

  /* ---------- Contact: View Details mengisi pesan ---------- */
  const messageEl = $('#message');
  let autoMessage = '';

  $$('[data-detail]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('.property-card');
    const name = $('h3', card).textContent.trim();
    const place = $('.location', card).textContent.trim();
    const text = `Hello RASDEV, I'm interested in "${name}" (${place}). Could you share more details?`;

    // jangan timpa pesan yang sudah diketik sendiri oleh pengunjung
    if (!messageEl.value.trim() || messageEl.value === autoMessage) {
      messageEl.value = text;
      autoMessage = text;
      refreshWhatsApp();
    }
    $('#contact').scrollIntoView();
  }));

  /* ---------- Contact: WhatsApp (nomor diisi di data-number pada index.html) ---------- */
  const waBtn = $('#wa-button');
  const waNote = $('#wa-note');
  const waNumber = (waBtn.dataset.number || '').replace(/\D/g, '');

  function refreshWhatsApp() {
    if (!waNumber) return;
    const text = messageEl.value.trim() || 'Hello RASDEV, I would like to ask about your properties.';
    waBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  }

  if (waNumber) {
    refreshWhatsApp();
    messageEl.addEventListener('input', refreshWhatsApp);
  } else {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      waNote.hidden = false;
    });
  }

  /* ---------- Contact: form demo (belum terhubung ke layanan pengiriman) ---------- */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent =
      'Thanks for trying it out. This is a demo form and is not connected to any message service yet, so your message was not sent.';
    formStatus.hidden = false;
  });

  /* ---------- Footer: tahun otomatis ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();