/* Generuje SVG placeholdery dla obrazów hero/captain (zanim user dostarczy finalne).
   Każdy SVG to heraldyczna kompozycja z barwami + nazwą bitwy + datą rzymską.
   Uruchom: node scripts/generate-placeholders.js */

const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf-8'));

const outDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function heroSvg(slide, idx) {
  // Each hero gets a unique gradient + heraldic motif
  const palettes = [
    ['#1A2A4A', '#7E1414', '#D4A537'],   // Kircholm — granat/krew/złoto
    ['#3A2818', '#8B4513', '#D4A537'],   // Hastings — earth tones
    ['#1A2A4A', '#FAF1D9', '#B22222'],   // Grunwald — biało-czerwony
    ['#5A4A35', '#D4A537', '#FAF1D9'],   // Agincourt — autumn
    ['#1A2A4A', '#D4A537', '#F2C94C'],   // Vienna — gold-blue
    ['#0F1A30', '#8B4513', '#F2C94C']    // Constantinople — Byzantine gold
  ];
  const [bg, accent, gold] = palettes[idx] || palettes[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g${idx}" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="${gold}" stop-opacity=".25"/>
      <stop offset="60%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <linearGradient id="grass${idx}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg}" stop-opacity="0"/>
      <stop offset="100%" stop-color="#3D2817" stop-opacity=".7"/>
    </linearGradient>
    <pattern id="hatch${idx}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="${gold}" stroke-width=".5" stroke-opacity=".15"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#g${idx})"/>
  <rect width="1920" height="1080" fill="url(#hatch${idx})"/>
  <rect x="0" y="700" width="1920" height="380" fill="url(#grass${idx})"/>

  <!-- horizon and silhouettes — hills + spear-points -->
  <path d="M0 720 Q480 660 960 700 Q1440 740 1920 690 L1920 1080 L0 1080 Z" fill="#2A1810" opacity=".4"/>
  <path d="M0 760 Q500 720 960 750 Q1420 780 1920 730 L1920 1080 L0 1080 Z" fill="#0A0805" opacity=".5"/>

  <!-- spears and banners silhouettes -->
  ${Array.from({length: 28}, (_, i) => {
    const x = 100 + i * 65;
    const h = 80 + (i * 13) % 60;
    return `<line x1="${x}" y1="${720 - h}" x2="${x}" y2="780" stroke="#1A0E08" stroke-width="1.5" opacity=".7"/>
            ${i % 4 === 0 ? `<rect x="${x - 12}" y="${720 - h}" width="20" height="14" fill="${accent}" opacity=".75"/>` : ''}
            ${i % 5 === 0 ? `<polygon points="${x - 4},${720 - h - 8} ${x + 4},${720 - h - 8} ${x},${720 - h - 18}" fill="${gold}" opacity=".8"/>` : ''}`;
  }).join('\n')}

  <!-- sun / golden orb -->
  <circle cx="1500" cy="280" r="120" fill="${gold}" opacity=".4"/>
  <circle cx="1500" cy="280" r="60" fill="${gold}" opacity=".7"/>

  <!-- ornamental cartouche with label -->
  <g transform="translate(960 480)">
    <ellipse cx="0" cy="0" rx="380" ry="100" fill="${bg}" opacity=".55" stroke="${gold}" stroke-width="2"/>
    <ellipse cx="0" cy="0" rx="370" ry="90" fill="none" stroke="${gold}" stroke-width=".8" stroke-dasharray="4 4"/>
    <text x="0" y="-15" text-anchor="middle" font-family="Cinzel, serif" font-size="64" font-weight="700" fill="${gold}" letter-spacing="6">${slide.name_pl}</text>
    <text x="0" y="35" text-anchor="middle" font-family="Cinzel, serif" font-size="28" fill="${gold}" letter-spacing="10">${slide.year_roman} · ${slide.year}</text>
  </g>

  <!-- tag -->
  <text x="960" y="640" text-anchor="middle" font-family="EB Garamond, serif" font-style="italic" font-size="22" fill="${gold}" opacity=".85">"${slide.tag_pl}"</text>

  <!-- watermark -->
  <text x="60" y="60" font-family="Inter, sans-serif" font-size="14" fill="${gold}" opacity=".5" letter-spacing="3">PLACEHOLDER · ${slide.key.toUpperCase()}</text>
  <text x="60" y="1050" font-family="Inter, sans-serif" font-size="10" fill="${gold}" opacity=".4">Replace with MJ-generated key visual per BRIEF_GRAFICZNY.md §3.${idx + 1}</text>
</svg>`;
}

function captainSvg(captain, idx) {
  const palettes = [
    ['#1A2A4A', '#D4A537'],
    ['#7E1414', '#F2C94C'],
    ['#3D2817', '#D4A537'],
    ['#1A4A2A', '#F2C94C'],
    ['#5A2818', '#F2C94C']
  ];
  const [bg, gold] = palettes[idx % palettes.length];
  const initial = captain.name_pl.split(' ').map(n => n[0]).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs>
    <radialGradient id="cg${idx}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${gold}" stop-opacity=".25"/>
      <stop offset="100%" stop-color="${bg}"/>
    </radialGradient>
  </defs>
  <rect width="600" height="800" fill="url(#cg${idx})"/>
  <!-- heraldic frame -->
  <rect x="30" y="30" width="540" height="740" fill="none" stroke="${gold}" stroke-width="3"/>
  <rect x="40" y="40" width="520" height="720" fill="none" stroke="${gold}" stroke-width="1" opacity=".6"/>
  <!-- shield on top -->
  <g transform="translate(300 80)">
    <path d="M-30 -30 Q-30 -40 -20 -40 L20 -40 Q30 -40 30 -30 L30 5 Q30 30 0 40 Q-30 30 -30 5 Z" fill="${gold}" opacity=".7" stroke="${bg}" stroke-width="1"/>
    <text x="0" y="6" text-anchor="middle" font-family="Cinzel, serif" font-size="16" fill="${bg}">${initial}</text>
  </g>
  <!-- silhouette portrait -->
  <ellipse cx="300" cy="360" rx="160" ry="180" fill="${bg}" stroke="${gold}" stroke-width="2"/>
  <!-- helm/head -->
  <circle cx="300" cy="320" r="80" fill="${bg}" opacity=".6" stroke="${gold}" stroke-width="1.5"/>
  <!-- shoulders/armor -->
  <path d="M180 480 Q300 420 420 480 L420 540 Q300 510 180 540 Z" fill="${gold}" opacity=".25" stroke="${gold}" stroke-width="1.5"/>
  <!-- cape suggestion -->
  <path d="M150 530 Q300 510 450 530 L470 700 L130 700 Z" fill="${bg}" opacity=".5" stroke="${gold}" stroke-width="1"/>
  <!-- name and motto -->
  <text x="300" y="640" text-anchor="middle" font-family="Cinzel, serif" font-size="22" font-weight="600" fill="${gold}" letter-spacing="2">${captain.name_pl.toUpperCase()}</text>
  <text x="300" y="675" text-anchor="middle" font-family="EB Garamond, serif" font-size="14" font-style="italic" fill="${gold}" opacity=".85">${captain.title_pl}</text>
  <text x="300" y="720" text-anchor="middle" font-family="Cinzel, serif" font-size="16" fill="${gold}" letter-spacing="3">${captain.motto}</text>
  <!-- watermark -->
  <text x="40" y="780" font-family="Inter, sans-serif" font-size="9" fill="${gold}" opacity=".4">PLACEHOLDER · per BRIEF_GRAFICZNY.md §3.7-3.10</text>
</svg>`;
}

function battleSvg(battle, idx) {
  const palettes = [
    ['#1A2A4A', '#D4A537'],
    ['#7E1414', '#F2C94C'],
    ['#3D2817', '#D4A537']
  ];
  const [bg, gold] = palettes[idx % palettes.length];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}"/>
  <rect x="30" y="30" width="540" height="540" fill="none" stroke="${gold}" stroke-width="3"/>
  <rect x="40" y="40" width="520" height="520" fill="none" stroke="${gold}" stroke-width="1" opacity=".6"/>
  <!-- heraldic shield central -->
  <g transform="translate(300 300)">
    <path d="M-100 -120 Q-100 -130 -90 -130 L90 -130 Q100 -130 100 -120 L100 30 Q100 130 0 170 Q-100 130 -100 30 Z" fill="${gold}" opacity=".25" stroke="${gold}" stroke-width="2"/>
    <text x="0" y="-30" text-anchor="middle" font-family="Cinzel, serif" font-size="50" font-weight="700" fill="${gold}">${battle.year}</text>
    <text x="0" y="20" text-anchor="middle" font-family="Cinzel, serif" font-size="32" font-weight="700" fill="${gold}" letter-spacing="2">${battle.name.toUpperCase()}</text>
    <text x="0" y="60" text-anchor="middle" font-family="EB Garamond, serif" font-size="13" font-style="italic" fill="${gold}" opacity=".85">${battle.sides}</text>
  </g>
  <!-- crossed swords decorative -->
  <g transform="translate(300 100)" opacity=".5">
    <line x1="-30" y1="-25" x2="30" y2="25" stroke="${gold}" stroke-width="2"/>
    <line x1="30" y1="-25" x2="-30" y2="25" stroke="${gold}" stroke-width="2"/>
  </g>
  <text x="300" y="540" text-anchor="middle" font-family="EB Garamond, serif" font-size="16" font-style="italic" fill="${gold}">"${battle.motto}"</text>
</svg>`;
}

// Generate hero placeholders
console.log('Generating hero placeholders...');
cfg.hero_carousel.forEach((slide, i) => {
  const fname = slide.img.replace('.jpg', '.svg');
  fs.writeFileSync(path.join(outDir, fname), heroSvg(slide, i));
  // also write a JPG-named symlink-style copy (browser tries .jpg, will pick .svg as fallback)
  fs.writeFileSync(path.join(outDir, slide.img), heroSvg(slide, i));
  console.log(`  ${slide.img} (placeholder for ${slide.name_pl})`);
});

// Generate captain placeholders
console.log('Generating captain placeholders...');
cfg.story.captains.forEach((c, i) => {
  fs.writeFileSync(path.join(outDir, c.img), captainSvg(c, i));
  console.log(`  ${c.img} (placeholder for ${c.name_pl})`);
});

// Generate battle placeholders
console.log('Generating battle placeholders...');
cfg.battles_world.forEach((b, i) => {
  const slug = b.name.toLowerCase().replace(/[^a-z]/g, '');
  const fname = `battle-${slug}.jpg`;
  fs.writeFileSync(path.join(outDir, fname), battleSvg(b, i));
  console.log(`  ${fname} (placeholder for ${b.name})`);
});

console.log('\nDone. ' + (cfg.hero_carousel.length + cfg.story.captains.length + cfg.battles_world.length) + ' placeholder SVG/JPG files generated.');
console.log('Next: replace each with MJ-generated PNG/JPG per BRIEF_GRAFICZNY.md');
