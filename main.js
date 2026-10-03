/* ============================================================
   Finance For Movement — site script
   1. Content hydration (CMS)   4. Site search
   2. 3D money hero             5. Footer year
   3. Mobile nav
   ============================================================ */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ============================================================
   1. CONTENT HYDRATION
      Editable content lives in content/*.json (managed through
      the /admin Decap CMS panel). The HTML ships with the same
      content baked in as a fallback; when the JSON loads, the
      sections below are re-rendered from it.
   ============================================================ */
let contentPromise = null;
function loadContent() {
  contentPromise = contentPromise || (async () => {
    try { const site = await (await fetch('content/site.json', { cache: 'no-cache' })).json(); return { site }; }
    catch { return { site: null }; }
  })();
  return contentPromise;
}

function hydrate(root, { site }) {
  if (site) {
    // Impact stats
    const stats = root.querySelector('#impact .stats__grid');
    if (stats && site.stats?.length) {
      stats.innerHTML = site.stats.map((s) =>
        `<div class="stat"><span class="stat__num">${esc(s.number)}</span><span class="stat__label">${esc(s.label)}</span></div>`
      ).join('');
    }

    // About: intro / mission / SDG
    if (site.about) {
      ['intro', 'mission', 'sdg'].forEach((k) => {
        const el = root.querySelector(`[data-about="${k}"]`);
        if (el && site.about[k]) el.textContent = site.about[k];
      });
    }

    // Events (list)
    const eventsList = root.querySelector('#events .events-list');
    if (eventsList && site.events?.length) {
      eventsList.innerHTML = site.events.map((e) => `
        <div class="event">
          <div class="event__date"><span class="event__month">${esc(e.month)}</span><span class="event__day">${esc(e.day)}</span></div>
          <div class="event__body"><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p></div>
        </div>`).join('');
    }

    // Partners
    const partners = root.querySelector('#partners .partners-grid');
    if (partners && site.partners?.length) {
      partners.innerHTML = site.partners.map((p) => {
        const inner = p.logo
          ? `<img src="${esc(p.logo)}" alt="${esc(p.name)} logo" />`
          : `<span class="partner__name">${esc(p.name)}</span>`;
        return p.link
          ? `<a class="partner" href="${esc(p.link)}" target="_blank" rel="noopener">${inner}</a>`
          : `<div class="partner">${inner}</div>`;
      }).join('');
    }

    // Literacy Kits page
    if (site.literacyKits) {
      const kit = site.literacyKits;
      const intro = root.querySelector('[data-kit="intro"]');
      if (intro && kit.intro) intro.textContent = kit.intro;
      const includes = root.querySelector('[data-kit="includes"]');
      if (includes && kit.includes?.length) {
        includes.innerHTML = kit.includes.map((i) => `<li>${esc(i)}</li>`).join('');
      }
      const formBox = root.querySelector('[data-kit="form"]');
      if (formBox) {
        formBox.innerHTML = kit.formEmbedUrl
          ? `<iframe class="kit-iframe" src="${esc(kit.formEmbedUrl)}" title="Literacy kit request form" loading="lazy">Loading…</iframe>`
          : `<p>Our request form will be available here shortly. In the meantime, email us and we'll get a kit on the way.</p>
             <a class="btn btn--primary" href="mailto:financeformovement@gmail.com?subject=Literacy%20Kit%20Request">Email us to request a kit</a>`;
      }
    }

    // Site photos: about image, gallery, posters
    if (site.images) {
      const im = site.images;
      const aboutImg = root.querySelector('.about__media img');
      if (aboutImg && im.about) aboutImg.setAttribute('src', im.about);
      const gallery = root.querySelector('#gallery .gallery');
      if (gallery && im.gallery?.length) {
        gallery.innerHTML = im.gallery.map((g) =>
          `<img src="${esc(g.image)}" alt="Finance For Movement in the community" />`
        ).join('');
      }
      const cells = root.querySelectorAll('.socialgrid__cell');
      if (cells.length >= 2 && im.posters?.length >= 2) {
        cells[0].innerHTML = `<img src="${esc(im.posters[0].image)}" alt="Finance For Movement poster" />`;
        cells[1].innerHTML = `<a href="contact.html"><img src="${esc(im.posters[1].image)}" alt="Join us poster" /></a>`;
      }
    }

    // Testimonials
    const testi = root.querySelector('.testi-grid');
    if (testi && site.testimonials?.length) {
      testi.innerHTML = site.testimonials.map((t) => `
        <figure class="testi">
          <blockquote>“${esc(t.quote)}”</blockquote>
          <figcaption><strong>${esc(t.name)}</strong> · ${esc(t.grade)}</figcaption>
        </figure>`).join('');
    }

    // FAQ
    const faq = root.querySelector('.faq');
    if (faq && site.faq?.length) {
      faq.innerHTML = site.faq.map((f) =>
        `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`
      ).join('');
    }

    // Contact page
    const c = site.contact || {};
    const email = root.querySelector('.contact__email');
    if (email && c.email) { email.textContent = c.email; email.href = `mailto:${c.email}`; }
    const socials = root.querySelectorAll('#get-in-touch .contact__socials a');
    if (socials[0] && c.instagram) socials[0].href = c.instagram;
    if (socials[1] && c.tiktok) socials[1].href = c.tiktok;
  }
}

(async function initContent() {
  const data = await loadContent();
  hydrate(document, data);
  animateStats();
})();

/* ============================================================
   1b. Impact stats — count up on scroll + gentle float
   ============================================================ */
function animateStats() {
  const nums = document.querySelectorAll('.stat__num');
  if (!nums.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  nums.forEach((el, i) => {
    if (!reduceMotion) {
      el.closest('.stat')?.classList.add('stat--float');
      el.closest('.stat')?.style.setProperty('--float-delay', `${i * 0.55}s`);
    }
  });
  if (reduceMotion) return;

  const fmt = (n) => n.toLocaleString('en-US');
  const run = (el) => {
    const raw = el.textContent.trim();               // e.g. "14,000+"
    const goal = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    if (!goal) return;
    const suffix = raw.replace(/[0-9,.\s]/g, '');    // keep "+", "%" etc.
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(goal * eased)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  nums.forEach((n) => io.observe(n));
}

/* ============================================================
   2. 3D HERO — floating money objects behind the headline.

   Nothing is placed in raw world coordinates. Each object stores a
   position as a FRACTION of the visible frustum (-1..1), and on every
   resize we convert that to world units and clamp it by the object's
   own radius. That is what guarantees nothing is ever cut off, on any
   screen shape, from a phone to an ultrawide monitor.
   ============================================================ */
(async function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = window.innerWidth < 680;
  const isTouch = window.matchMedia('(hover: none)').matches;

  const THREE = await import('three');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true,
    antialias: !isPhone,
    powerPreference: isPhone ? 'low-power' : 'default',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isPhone ? 1.5 : 2));

  scene.add(new THREE.AmbientLight(0x7c9ad4, 0.9));
  const key = new THREE.DirectionalLight(0xf4f8ff, 1.45);
  key.position.set(4, 7, 9);
  scene.add(key);
  const rim = new THREE.PointLight(0x4f8bd0, 1.8, 60);
  rim.position.set(-9, -4, 7);
  scene.add(rim);

  /* ---- textures drawn on a canvas (no extra network requests) ---- */
  const tex = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  };
  const coinFace = tex(160, 160, (x) => {
    x.fillStyle = '#e4edfa'; x.beginPath(); x.arc(80, 80, 80, 0, 7); x.fill();
    x.strokeStyle = '#8db2e2'; x.lineWidth = 6;
    x.beginPath(); x.arc(80, 80, 62, 0, 7); x.stroke();
    x.fillStyle = '#14407e'; x.font = 'bold 92px Georgia, serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('$', 80, 86);
  });
  const billFace = tex(256, 136, (x, w, h) => {
    x.fillStyle = '#1d4480';
    x.fillRect(0, 0, w, h);
    x.strokeStyle = '#9dc1ed'; x.lineWidth = 5;
    x.strokeRect(10, 10, w - 20, h - 20);
    x.beginPath(); x.arc(w / 2, h / 2, 31, 0, 7); x.stroke();
    x.fillStyle = '#dceafc'; x.font = 'bold 42px Georgia, serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('$', w / 2, h / 2 + 2);
    x.lineWidth = 4;
    [34, w - 34].forEach((cx) => { x.beginPath(); x.arc(cx, h / 2, 13, 0, 7); x.stroke(); });
  });

  const edgeMat  = new THREE.MeshStandardMaterial({ color: 0xa9c4e6, metalness: 0.95, roughness: 0.32 });
  const faceMat  = new THREE.MeshStandardMaterial({ map: coinFace, metalness: 0.5, roughness: 0.42 });
  const billMat  = new THREE.MeshStandardMaterial({ map: billFace, metalness: 0.22, roughness: 0.72 });
  const ringMat  = new THREE.MeshStandardMaterial({ color: 0x8fb4e4, metalness: 0.85, roughness: 0.3 });

  const coinGeo = new THREE.CylinderGeometry(1, 1, 0.15, 44);
  const billGeo = new THREE.BoxGeometry(1.95, 1.04, 0.05);
  const ringGeo = new THREE.TorusGeometry(0.72, 0.15, 14, 36);
  [coinGeo, billGeo, ringGeo].forEach((g) => g.computeBoundingSphere());

  /* ---- build the objects: fx/fy are FRACTIONS of the frustum ---- */
  const LAYOUT = isPhone
    ? [[-0.68,  0.62, -3, 'coin', 0.60], [ 0.70,  0.70, -5, 'bill', 0.62],
       [ 0.74, -0.40, -2, 'coin', 0.50], [-0.72, -0.62, -6, 'ring', 0.68],
       [ 0.30, -0.78, -7, 'coin', 0.44], [-0.34,  0.84, -8, 'bill', 0.50]]
    : [[-0.72,  0.52, -2, 'coin', 0.95], [ 0.74,  0.60, -4, 'bill', 1.00],
       [ 0.80, -0.34, -1, 'coin', 0.80], [-0.78, -0.56, -5, 'ring', 1.05],
       [ 0.36, -0.74, -6, 'coin', 0.70], [-0.40,  0.80, -7, 'bill', 0.85],
       [ 0.56,  0.14, -8, 'ring', 0.72], [-0.20, -0.86, -9, 'coin', 0.60],
       [ 0.12,  0.88,-10, 'bill', 0.66], [-0.58,  0.06,-11, 'coin', 0.55]];

  const objects = [];
  for (const [fx, fy, z, kind, scale] of LAYOUT) {
    let mesh;
    if (kind === 'coin')      mesh = new THREE.Mesh(coinGeo, [edgeMat, faceMat, faceMat]);
    else if (kind === 'bill') mesh = new THREE.Mesh(billGeo, billMat);
    else                      mesh = new THREE.Mesh(ringGeo, ringMat);

    mesh.scale.setScalar(scale);
    mesh.position.z = z;
    if (kind === 'coin') mesh.rotation.x = Math.PI / 2;   // face the viewer
    mesh.rotation.z = Math.random() * Math.PI;

    const floatAmp = 0.28 + Math.random() * 0.35;
    mesh.userData = {
      fx, fy, floatAmp,
      radius: mesh.geometry.boundingSphere.radius * scale,
      floatSpeed: 0.32 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      spinX: (Math.random() - 0.5) * 0.0035,
      spinY: (Math.random() - 0.5) * 0.006,
      spinZ: (Math.random() - 0.5) * 0.0045,
      y: 0,
    };
    scene.add(mesh);
    objects.push(mesh);
  }

  /* ---- parallax (pointer devices only) ---- */
  const PARALLAX_X = isTouch ? 0 : 0.9;
  const PARALLAX_Y = isTouch ? 0 : 0.6;
  const aim = { x: 0, y: 0 };
  if (!isTouch) {
    window.addEventListener('pointermove', (e) => {
      aim.x = e.clientX / window.innerWidth - 0.5;
      aim.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
  }

  /* ---- size + keep every object inside the visible frustum ---- */
  function layout() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);

    const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    for (const o of objects) {
      const dist  = camera.position.z - o.position.z;
      const halfH = Math.tan(halfFov) * dist;
      const halfW = halfH * camera.aspect;
      const d = o.userData;
      // headroom: the object's own radius, plus how far the camera can drift,
      // plus (vertically) the float travel
      const limX = Math.max(0, halfW - d.radius - PARALLAX_X);
      const limY = Math.max(0, halfH - d.radius - PARALLAX_Y - d.floatAmp);
      o.position.x = THREE.MathUtils.clamp(d.fx * halfW, -limX, limX);
      d.y          = THREE.MathUtils.clamp(d.fy * halfH, -limY, limY);
      o.position.y = d.y;
    }
  }
  // Re-sync whenever the canvas box actually changes. Checked every frame
  // (two cheap property reads) rather than relying only on ResizeObserver,
  // so the scene self-corrects even if an observer callback is missed.
  let lastW = 0, lastH = 0;
  function syncSize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    if (w !== lastW || h !== lastH) { lastW = w; lastH = h; layout(); }
  }
  syncSize();
  new ResizeObserver(syncSize).observe(canvas);

  /* ---- render loop, paused when off screen or tab hidden ---- */
  const clock = new THREE.Clock();
  function draw() {
    syncSize();
    const t = clock.getElapsedTime();
    for (const o of objects) {
      const d = o.userData;
      o.rotation.x += d.spinX;
      o.rotation.y += d.spinY;
      o.rotation.z += d.spinZ;
      o.position.y = d.y + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
    }
    camera.position.x += (aim.x * PARALLAX_X - camera.position.x) * 0.045;
    camera.position.y += (-aim.y * PARALLAX_Y - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  if (reduceMotion) { draw(); return; }

  let raf = null, onScreen = true;
  const loop = () => {
    if (!onScreen || document.hidden) { raf = null; return; }
    draw();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (raf === null) raf = requestAnimationFrame(loop); };
  const stop  = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    onScreen ? start() : stop();
  }, { threshold: 0 }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  start();
})();

/* ============================================================
   3. Navbar: mobile toggle
   ============================================================ */
(function nav() {
  const header = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  if (!header || !toggle) return;
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  header.querySelectorAll('.nav__links a').forEach((a) =>
    a.addEventListener('click', () => header.classList.remove('open'))
  );
})();

/* ============================================================
   4. Site search — matches the real text content of all pages
      (after CMS hydration). Results appear only while typing.
   ============================================================ */
(function search() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;

  const PAGES = ['index.html', 'about.html', 'literacy-kits.html', 'faq.html', 'contact.html'];
  let index = null;
  let building = null;

  function sectionsOf(doc, page) {
    const out = [];
    doc.querySelectorAll('section[id]').forEach((sec) => {
      const heading = sec.querySelector('.section__head h2') || sec.querySelector('h1, h2, h3');
      const title = sec.dataset.searchTitle ||
        (heading ? heading.textContent.trim() : page);
      const text = sec.textContent.replace(/\s+/g, ' ').trim();
      if (text) out.push({ title, url: `${page}#${sec.id}`, text });
    });
    return out;
  }

  async function buildIndex() {
    const data = await loadContent();
    const out = [];
    for (const page of PAGES) {
      try {
        const here = location.pathname.endsWith(page) ||
          (page === 'index.html' && /\/$/.test(location.pathname));
        if (here) {
          out.push(...sectionsOf(document, page));
        } else {
          const res = await fetch(page, { cache: 'no-cache' });
          const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
          hydrate(doc, data);            // index the CMS-edited content, not the baked-in fallback
          out.push(...sectionsOf(doc, page));
        }
      } catch { /* page unavailable — skip */ }
    }
    return out;
  }

  // Snippet of the section text around the first match, query highlighted.
  function snippet(text, query) {
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return '';
    const start = Math.max(0, i - 40);
    const end = Math.min(text.length, i + query.length + 60);
    const pre = (start > 0 ? '…' : '') + esc(text.slice(start, i));
    const hit = esc(text.slice(i, i + query.length));
    const post = esc(text.slice(i + query.length, end)) + (end < text.length ? '…' : '');
    return `${pre}<mark>${hit}</mark>${post}`;
  }

  let selIndex = -1;

  async function run(query) {
    if (!index) {
      building = building || buildIndex();
      index = await building;
    }
    const q = query.trim();
    if (q.length < 2) { results.hidden = true; results.innerHTML = ''; return; }
    const hits = index.filter((s) => s.text.toLowerCase().includes(q.toLowerCase()));
    selIndex = -1;
    results.innerHTML = hits.length
      ? hits.map((h) =>
          `<li><a href="${h.url}"><span class="sr-title">${esc(h.title)}</span><span class="sr-snippet">${snippet(h.text, q)}</span></a></li>`
        ).join('')
      : '<li class="search__empty">No matches found.</li>';
    results.hidden = false;
  }

  input.addEventListener('input', () => run(input.value));

  input.addEventListener('keydown', (e) => {
    const links = [...results.querySelectorAll('a')];
    if (e.key === 'ArrowDown') { e.preventDefault(); selIndex = Math.min(selIndex + 1, links.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIndex = Math.max(selIndex - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); (links[selIndex] || links[0])?.click(); return; }
    else if (e.key === 'Escape') { results.hidden = true; input.blur(); return; }
    links.forEach((l, i) => l.classList.toggle('sel', i === selIndex));
  });

  document.addEventListener('click', (e) => {
    if (!results.hidden && !e.target.closest('.search')) results.hidden = true;
  });
})();

/* ============================================================
   5. Footer year
   ============================================================ */
(function year() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();
