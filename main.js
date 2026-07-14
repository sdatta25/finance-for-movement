/* ============================================================
   Finance For Movement — site script
   1. Content hydration (CMS)   4. Site search
   2. 3D hero                   5. Footer year
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

    // About: mission / vision / SDG
    if (site.about) {
      ['mission', 'vision', 'sdg'].forEach((k) => {
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

    // Testimonials
    const testi = root.querySelector('.testi-grid');
    if (testi && site.testimonials?.length) {
      testi.innerHTML = site.testimonials.map((t) => `
        <figure class="testi">
          <blockquote>“${esc(t.quote)}”</blockquote>
          <figcaption><strong>${esc(t.name)}</strong> · ${esc(t.grade)}</figcaption>
        </figure>`).join('');
    }

    // Instagram posts (first two cells of the 2x2 social grid)
    const igCells = root.querySelectorAll('.socialgrid__cell');
    if (igCells.length >= 2 && site.instagramPosts?.length >= 2) {
      site.instagramPosts.slice(0, 2).forEach((p, i) => {
        const url = p.url.replace(/\/?$/, '/');
        igCells[i].innerHTML = `
          <blockquote class="instagram-media" data-instgrm-permalink="${esc(url)}?utm_source=ig_embed" data-instgrm-version="14">
            <a href="${esc(url)}">View this post on Instagram</a>
          </blockquote>`;
      });
    }

    // Join cards
    const joinCards = root.querySelectorAll('#join .join__card');
    [site.board, site.internship].forEach((card, i) => {
      if (!joinCards[i] || !card) return;
      joinCards[i].innerHTML = `
        <h3>${esc(card.title)}</h3>
        <ul class="join__meta">
          ${(card.items || []).map((it) => `<li><span>${esc(it.label)}</span> ${esc(it.value)}</li>`).join('')}
        </ul>
        <a class="btn btn--light" href="${esc(card.link)}" target="_blank" rel="noopener">${esc(card.buttonText)}</a>`;
    });

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
  // (Re-)render Instagram embeds once their script is available.
  let tries = 0;
  const tick = setInterval(() => {
    if (window.instgrm?.Embeds) { window.instgrm.Embeds.process(); clearInterval(tick); }
    else if (++tries > 40) clearInterval(tick);
  }, 250);
})();

/* ============================================================
   2. 3D HERO — floating navy coins & rings (home page only).
   ============================================================ */
(async function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const THREE = await import('three');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.add(new THREE.AmbientLight(0x5b7fc4, 0.7));
  const key = new THREE.DirectionalLight(0xeaf1ff, 1.4);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x2f5fae, 2.2, 60);
  rim.position.set(-8, -4, 8);
  scene.add(rim);

  const steelMat  = new THREE.MeshStandardMaterial({ color: 0x2f5fae, metalness: 0.85, roughness: 0.3 });
  const lightMat  = new THREE.MeshStandardMaterial({ color: 0x9db8e6, metalness: 0.7,  roughness: 0.35 });
  const navyMat   = new THREE.MeshStandardMaterial({ color: 0x14305f, metalness: 0.5,  roughness: 0.5 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xdfe8f7, metalness: 0.9,  roughness: 0.25 });

  const group = new THREE.Group();
  scene.add(group);

  const coinGeo = new THREE.CylinderGeometry(1, 1, 0.18, 48);
  const torusGeo = new THREE.TorusGeometry(0.85, 0.16, 16, 40);
  const icoGeo = new THREE.IcosahedronGeometry(0.7, 0);

  const coinMats = [steelMat, lightMat, silverMat];
  const objects = [];
  const COUNT = window.innerWidth < 680 ? 9 : 16;
  for (let i = 0; i < COUNT; i++) {
    let mesh;
    const r = Math.random();
    if (r < 0.6) {
      mesh = new THREE.Mesh(coinGeo, coinMats[Math.floor(Math.random() * coinMats.length)]);
      mesh.rotation.x = Math.PI / 2;
    } else if (r < 0.82) {
      mesh = new THREE.Mesh(torusGeo, lightMat);
    } else {
      mesh = new THREE.Mesh(icoGeo, navyMat);
    }
    mesh.scale.setScalar(0.6 + Math.random() * 0.9);
    mesh.position.set(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10 - 2
    );
    mesh.userData = {
      rotSpeed: (Math.random() - 0.5) * 0.012,
      floatSpeed: 0.4 + Math.random() * 0.6,
      floatAmp: 0.4 + Math.random() * 0.7,
      baseY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
    };
    group.add(mesh);
    objects.push(mesh);
  }

  const target = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5);
    target.y = (e.clientY / window.innerHeight - 0.5);
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    objects.forEach((m) => {
      m.rotation.z += m.userData.rotSpeed;
      m.rotation.y += m.userData.rotSpeed * 0.6;
      m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatSpeed + m.userData.phase) * m.userData.floatAmp;
    });
    camera.position.x += (target.x * 2.4 - camera.position.x) * 0.04;
    camera.position.y += (-target.y * 1.6 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(animate);
  }
  animate();
  if (reduceMotion) renderer.render(scene, camera);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
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

  const PAGES = ['index.html', 'literacy-kits.html', 'contact.html'];
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
