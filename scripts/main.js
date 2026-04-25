/* Bitwy Korony — landing page bootstrap.
   Ładuje config.json i renderuje wszystkie dynamiczne sekcje.
   Brak frameworka — vanilla JS, działa offline po build, renderuje się w PDF. */

(async function () {
  const cfg = await fetch('./config.json').then(r => r.json());
  const lang = (new URLSearchParams(location.search).get('lang') || cfg.meta.lang_default || 'pl');
  const t = (obj, key) => obj[`${key}_${lang}`] ?? obj[`${key}_pl`] ?? obj[key] ?? '';

  // ---------- HERO carousel ----------
  const carousel = document.getElementById('heroCarousel');
  const dots = document.getElementById('heroDots');
  const slides = cfg.hero_carousel;
  slides.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.dataset.idx = i;
    slide.dataset.prompt = s.prompt;
    // Use generated image if available, else SVG-rendered placeholder
    slide.style.backgroundImage = `url('assets/images/${s.img}'), linear-gradient(135deg, hsl(${(i * 47) % 360}, 30%, 25%), hsl(${(i * 47 + 30) % 360}, 25%, 15%))`;
    carousel.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = i === 0 ? 'active' : '';
    dot.dataset.idx = i;
    dot.title = s.name_pl;
    dot.addEventListener('click', () => goToSlide(i));
    dots.appendChild(dot);
  });

  let currentSlide = 0;
  const slideEls = carousel.querySelectorAll('.hero-slide');
  const dotEls = dots.querySelectorAll('button');
  function goToSlide(i) {
    slideEls.forEach(e => e.classList.remove('active'));
    dotEls.forEach(e => e.classList.remove('active'));
    slideEls[i].classList.add('active');
    dotEls[i].classList.add('active');
    currentSlide = i;
  }
  let autoplay = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);

  // ---------- HERO copy (lang) ----------
  document.getElementById('heroBadge').textContent =
    `Anno Domini ${cfg.brand.year} · ${t(cfg.brand, 'launch_quarter')}`;
  document.getElementById('heroTitle').textContent = lang === 'pl' ? cfg.brand.name_pl : cfg.brand.name_en;
  document.getElementById('heroSubtitle').textContent = lang === 'pl' ? cfg.brand.subtitle_pl : cfg.brand.subtitle_en;
  document.getElementById('heroTagMain').textContent = `"${t(cfg.tagline, 'main')}"`;
  document.getElementById('heroTagEmo').textContent = t(cfg.tagline, 'emotional');

  // ---------- STORY ----------
  document.getElementById('storyLogline').textContent = `"${t(cfg.story, 'logline')}"`;

  const captainsGrid = document.getElementById('captainsGrid');
  cfg.story.captains.forEach(c => {
    const card = document.createElement('div');
    card.className = 'captain-card';
    card.innerHTML = `
      <div class="captain-img" style="background-image:url('assets/images/${c.img}')" data-prompt="${c.name_pl}, heraldic portrait, oil painting, illuminated frame">
        <div class="captain-name">${c.name_pl}${c.note ? ` <span style="font-size:.7em;opacity:.6">${c.note}</span>` : ''}</div>
      </div>
      <div class="captain-body">
        <div class="role">${c.title_pl}</div>
        <div class="battle">${c.battle}</div>
        <p class="blurb">${t(c, 'blurb')}</p>
        <div class="motto">${c.motto}</div>
      </div>`;
    captainsGrid.appendChild(card);
  });

  const arcsGrid = document.getElementById('arcsGrid');
  cfg.story.arcs.forEach(a => {
    const card = document.createElement('div');
    card.className = 'arc-card';
    card.innerHTML = `
      <div class="arc-period">${a.period}</div>
      <h3>${t(a, 'title')}</h3>
      <div class="arc-battles">${a.battles}</div>
      <p>${t(a, 'blurb')}</p>`;
    arcsGrid.appendChild(card);
  });

  const questionsRow = document.getElementById('questionsRow');
  cfg.story.questions.forEach(q => {
    const div = document.createElement('div');
    div.className = 'question';
    div.textContent = q[lang] || q.pl;
    questionsRow.appendChild(div);
  });

  // ---------- BATTLES grid ----------
  const battlesGrid = document.getElementById('battlesGrid');
  cfg.battles_world.forEach(b => {
    const tile = document.createElement('div');
    tile.className = 'battle-tile';
    tile.innerHTML = `
      <div class="year-roman">${b.year_roman}</div>
      <div class="year">${b.year}</div>
      <div class="name">${b.name}</div>
      <div class="sides">${b.sides}</div>
      <div class="force">${b.force}</div>
      <div class="motto">"${b.motto}"</div>`;
    battlesGrid.appendChild(tile);
  });

  // ---------- MECHANICS ----------
  document.getElementById('mechHook').textContent = `"${t(cfg.mechanics, 'hook')}"`;
  const mechGrid = document.getElementById('mechGrid');
  cfg.mechanics.systems.forEach(s => {
    const card = document.createElement('div');
    card.className = 'mech-card';
    card.innerHTML = `
      <div class="icon-wrap">${iconFor(s.icon)}</div>
      <h4>${t(s, 'name')}</h4>
      <p>${t(s, 'desc')}</p>`;
    mechGrid.appendChild(card);
  });

  function iconFor(name) {
    const map = {
      banner: '⚐', lances: '⚔', hills: '⛰', eye: '◉',
      mace: '✦', wagon: '⚙', shield: '⛨', crown: '♛'
    };
    return map[name] || '✦';
  }

  // ---------- PERSONALIZATION ----------
  document.getElementById('personalTitle').textContent = t(cfg.personalization, 'title');
  document.getElementById('personalLead').textContent = t(cfg.personalization, 'lead');
  const personalFeatures = document.getElementById('personalFeatures');
  cfg.personalization.features.forEach(f => {
    const div = document.createElement('div');
    div.className = 'personal-feature';
    div.innerHTML = `<h4>${t(f, 'title')}</h4><p>${t(f, 'desc')}</p>`;
    personalFeatures.appendChild(div);
  });

  // shield builder
  const ctlTL = document.getElementById('ctlTL');
  const ctlTR = document.getElementById('ctlTR');
  const ctlCharge = document.getElementById('ctlCharge');
  const ctlMotto = document.getElementById('ctlMotto');
  const shieldMotto = document.getElementById('shieldMotto');
  function updateShield() {
    const tl = ctlTL.value, tr = ctlTR.value;
    document.getElementById('qTL').setAttribute('fill', tl);
    document.getElementById('qBR').setAttribute('fill', tl);
    document.getElementById('qTR').setAttribute('fill', tr);
    document.getElementById('qBL').setAttribute('fill', tr);
    document.getElementById('charge').textContent = ctlCharge.value;
    shieldMotto.textContent = `— ${ctlMotto.value} —`;
  }
  [ctlTL, ctlTR, ctlCharge, ctlMotto].forEach(c => c.addEventListener('change', updateShield));

  // ---------- COMPONENTS ----------
  const tabletopList = document.getElementById('tabletopList');
  cfg.components.tabletop.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${t(item, 'name')}</strong><small>${t(item, 'desc')}</small>`;
    tabletopList.appendChild(li);
  });
  const digitalList = document.getElementById('digitalList');
  cfg.components.digital.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${t(item, 'name')}</strong><small>${t(item, 'desc')}</small>`;
    digitalList.appendChild(li);
  });

  // ---------- STRETCH GOALS ----------
  const stretchPyramid = document.getElementById('stretchPyramid');
  cfg.stretch_goals.goals.forEach(g => {
    const row = document.createElement('div');
    row.className = `stretch-row ${g.status}`;
    row.innerHTML = `
      <div class="stretch-amount">${g.amount}</div>
      <div class="stretch-label">${t(g, 'label')}</div>
      <div class="stretch-status">${g.status === 'funded' ? '✓ Funded' : g.status === 'current' ? 'Current' : 'Future'}</div>`;
    stretchPyramid.appendChild(row);
  });

  // ---------- TIERS ----------
  const tiersGrid = document.getElementById('tiersGrid');
  cfg.tiers.forEach(tier => {
    const card = document.createElement('div');
    card.className = 'tier-card' + (tier.highlighted ? ' highlighted' : '');
    let limitedHtml = tier.limited ? `<span class="tier-limited">Limited ${tier.limited} sztuk</span>` : '';
    let notes = tier.note ? `<small style="opacity:.55;font-style:italic">${tier.note}</small>` : '';
    card.innerHTML = `
      ${limitedHtml}
      <div class="tier-name">${t(tier, 'name')}</div>
      <div class="tier-price">${tier.price}</div>
      <div class="tier-tagline">${t(tier, 'tagline')}</div>
      <ul class="tier-items">
        ${(tier[`items_${lang}`] || tier.items_pl).map(i => `<li>${i}</li>`).join('')}
      </ul>
      ${notes}
      <a href="${cfg.brand.ks_url}" class="tier-cta">Wybierz tier</a>`;
    tiersGrid.appendChild(card);
  });

  // ---------- TEAM ----------
  const teamGrid = document.getElementById('teamGrid');
  cfg.team.forEach(member => {
    const initial = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
      <div class="team-portrait" data-prompt="${member.name}, heraldic portrait">${initial}</div>
      <h4>${member.name}</h4>
      <div class="role">${t(member, 'role')}</div>
      <p class="why">"${t(member, 'why')}"</p>`;
    teamGrid.appendChild(card);
  });

  // consultants
  document.getElementById('consultants').textContent = ' ' + cfg.consultants.map(c => c.name).join(' · ');

  // ---------- MONEY ----------
  document.getElementById('moneyTitle').textContent = t(cfg.money_breakdown, 'title');
  document.getElementById('moneyNote').textContent = `"${t(cfg.money_breakdown, 'note')}"`;
  const moneyBars = document.getElementById('moneyBars');
  cfg.money_breakdown.items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'money-bar';
    row.innerHTML = `
      <div class="money-label">${t(it, 'label')}</div>
      <div class="money-track"><div class="money-fill" style="width:${it.pct}%"></div></div>
      <div class="money-pct">${it.pct}%</div>`;
    moneyBars.appendChild(row);
  });

  // ---------- FAQ ----------
  const faqList = document.getElementById('faqList');
  cfg.faq.forEach((qa, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    const qText = lang === 'pl' ? qa.q_pl : qa.q_en;
    const aText = lang === 'pl' ? qa.a_pl : qa.a_en;
    item.innerHTML = `
      <button class="faq-q" type="button">${qText}</button>
      <div class="faq-a"><p>${aText}</p></div>`;
    faqList.appendChild(item);
    item.querySelector('.faq-q').addEventListener('click', () => {
      item.classList.toggle('open');
    });
    if (i === 0) item.classList.add('open');
  });

  // ---------- LANGUAGE TOGGLE ----------
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === lang) return;
      const url = new URL(location.href);
      url.searchParams.set('lang', newLang);
      location.href = url.toString();
    });
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // ---------- FADE-IN ANIMATIONS ----------
  if ('IntersectionObserver' in window && !document.body.classList.contains('pdf-mode')) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  }

  // ---------- PDF MODE ----------
  // Activate when ?pdf=1 — disables animations, autoplay, ensures everything visible
  if (new URLSearchParams(location.search).get('pdf') === '1') {
    document.body.classList.add('pdf-mode');
    clearInterval(autoplay);
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.faq-item').forEach(el => el.classList.add('open'));
    // signal to outside scripts that page is "ready" for PDF capture
    setTimeout(() => { window.__landingReady = true; }, 1500);
  } else {
    setTimeout(() => { window.__landingReady = true; }, 800);
  }

  console.log('[Bitwy Korony] Landing rendered. Lang:', lang, 'Hero slides:', slides.length, 'Battles:', cfg.battles_world.length, 'Captains:', cfg.story.captains.length);
})();
