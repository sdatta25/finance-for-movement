/* ============================================================
   1. 3D HERO ANIMATION — floating navy/blue coins & shapes
      (only runs on pages that have the hero canvas; Three.js is
      loaded dynamically so the other pages don't download it)
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

  // Cool, navy-toned lighting (no warm/gold tint)
  scene.add(new THREE.AmbientLight(0x5b7fc4, 0.75));
  const key = new THREE.DirectionalLight(0xeaf1ff, 1.5);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x2f5fae, 2.4, 60);
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
    const s = 0.6 + Math.random() * 0.9;
    mesh.scale.setScalar(s);
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
   2. Navbar: scroll shadow + mobile toggle
   ============================================================ */
(function nav() {
  const header = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  header.querySelectorAll('.nav__links a').forEach((a) =>
    a.addEventListener('click', () => header.classList.remove('open'))
  );
})();

/* ============================================================
   3. Site search (client-side, beside Join Us)
   ============================================================ */
(function search() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;

  // Searchable index of the whole site
  const INDEX = [
    { title: 'About Us', sub: 'Our mission & who we serve', url: 'index.html#about', kw: 'about mission youth led k-8 title 1 gwinnett overconsumption' },
    { title: 'Why It Matters', sub: 'The financial literacy gap', url: 'index.html#problem', kw: 'why statistics teens credit debit confidence nefe gap' },
    { title: 'What We Do', sub: 'Workshops, resources & fundraising', url: 'index.html#programs', kw: 'programs workshops monthly resources community art fundraising' },
    { title: 'Student Voices', sub: 'Testimonials from students', url: 'index.html#testimonials', kw: 'testimonials students quotes reviews feedback samantha alex gabby' },
    { title: 'Gallery', sub: 'Photos from the community', url: 'index.html#gallery', kw: 'gallery photos booth crafts festival' },
    { title: 'Events', sub: 'Where to find us next', url: 'index.html#events', kw: 'events suwanee asian festival in person' },
    { title: 'Join Us', sub: 'Board & internship applications', url: 'index.html#join', kw: 'join volunteer internship executive board apply opportunities' },
    { title: 'FAQ', sub: 'Frequently asked questions', url: 'index.html#faq', kw: 'faq questions partner use utilize' },
    { title: 'Resource Hub', sub: 'Free K–8 lessons', url: 'resources.html', kw: 'resources hub canva lessons free' },
    { title: 'Needs vs. Wants', sub: 'Resource', url: 'resources.html', kw: 'needs wants resource lesson' },
    { title: 'Credit vs. Debit', sub: 'Resource', url: 'resources.html', kw: 'credit debit card resource lesson' },
    { title: 'What is a Receipt?', sub: 'Resource', url: 'resources.html', kw: 'receipt resource lesson' },
    { title: 'Why Saving Matters', sub: 'Resource', url: 'resources.html', kw: 'saving save money resource lesson' },
    { title: 'Contact Us', sub: 'Email & social links', url: 'contact.html', kw: 'contact email instagram tiktok message' },
    { title: 'Subscribe (It’s Free!)', sub: 'Get monthly resources', url: 'contact.html#subscribe', kw: 'subscribe newsletter form free monthly signup' },
  ];

  let selIndex = -1;
  let current = [];

  function render(q) {
    const query = q.trim().toLowerCase();
    current = query
      ? INDEX.filter((it) => (it.title + ' ' + it.kw).toLowerCase().includes(query))
      : INDEX.slice(0, 6);
    selIndex = -1;
    if (current.length === 0) {
      results.innerHTML = '<li class="search__empty">No results found.</li>';
      return;
    }
    results.innerHTML = current
      .map((it) => `<li><a href="${it.url}"><span class="sr-title">${it.title}</span><br><span class="sr-sub">${it.sub}</span></a></li>`)
      .join('');
  }

  function showResults() { results.hidden = false; }
  function hideResults() { results.hidden = true; }

  input.addEventListener('focus', () => { render(input.value); showResults(); });
  input.addEventListener('input', () => { render(input.value); showResults(); });

  input.addEventListener('keydown', (e) => {
    const links = [...results.querySelectorAll('a')];
    if (e.key === 'ArrowDown') { e.preventDefault(); selIndex = Math.min(selIndex + 1, links.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIndex = Math.max(selIndex - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); (links[selIndex] || links[0])?.click(); return; }
    else if (e.key === 'Escape') { hideResults(); input.blur(); return; }
    links.forEach((l, i) => l.classList.toggle('sel', i === selIndex));
  });

  document.addEventListener('click', (e) => {
    if (!results.hidden && !e.target.closest('.search')) hideResults();
  });
})();

/* ============================================================
   4. Scroll reveal
   ============================================================ */
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();

/* ============================================================
   5. Animated count-up for stats
   ============================================================ */
(function counters() {
  const nums = document.querySelectorAll('.stat__num');
  if (!nums.length) return;
  const fmt = (n) => n.toLocaleString('en-US');
  const run = (el) => {
    const goal = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
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
  }, { threshold: 0.5 });
  nums.forEach((n) => io.observe(n));
})();

/* ============================================================
   6. Footer year
   ============================================================ */
(function year() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();
