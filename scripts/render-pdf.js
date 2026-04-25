/* Renderuje landing do PDF + full-page PNG.
   Stawia lokalny serwer statyczny, otwiera w Playwright/Puppeteer, zapisuje do preview/.
   Wymaga: Playwright (preferowane) lub Puppeteer.
   Uruchom: node scripts/render-pdf.js
*/

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const PORT = 9921;
const PREVIEW = path.join(ROOT, 'preview');
if (!fs.existsSync(PREVIEW)) fs.mkdirSync(PREVIEW, { recursive: true });

// ---------- Static server ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
      const filePath = path.join(ROOT, urlPath);
      // Some served images may be SVG content saved as .jpg by placeholder generator
      // — sniff content if extension is jpg
      if (!fs.existsSync(filePath)) {
        res.writeHead(404); res.end('Not found: ' + urlPath); return;
      }
      const ext = path.extname(filePath).toLowerCase();
      let mime = MIME[ext] || 'application/octet-stream';
      const buf = fs.readFileSync(filePath);
      // Detect SVG inside .jpg-named placeholder
      if (ext === '.jpg' && buf.slice(0, 100).toString().includes('<svg')) {
        mime = 'image/svg+xml; charset=utf-8';
      }
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
      res.end(buf);
    });
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[server] http://127.0.0.1:${PORT}/`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

// ---------- Render via Playwright (preferred) ----------
async function renderWithPlaywright() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (e) {
    console.log('[playwright] not installed, falling back to puppeteer...');
    return false;
  }

  const browser = await chromium.launch({ headless: true });
  try {
    // 1) Long full-page PNG (desktop viewport, full scroll)
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1.5
    });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/?pdf=1&lang=pl`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__landingReady === true, { timeout: 8000 });
    // Auto-trigger lazy/in-viewport reveals by scrolling once
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let total = 0;
        const dist = 600;
        const t = setInterval(() => {
          window.scrollBy(0, dist);
          total += dist;
          if (total >= document.body.scrollHeight) {
            clearInterval(t);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 80);
      });
    });
    await page.waitForTimeout(800);

    const pngPath = path.join(PREVIEW, 'preview-fullpage.png');
    await page.screenshot({ path: pngPath, fullPage: true, type: 'png' });
    console.log('[playwright] PNG written:', pngPath);

    // 2) Long pinwise PDF (single tall page) — set printable height to actual document
    const dimensions = await page.evaluate(() => ({
      h: document.documentElement.scrollHeight,
      w: document.documentElement.scrollWidth
    }));

    // Long PDF — single page with computed height (max ~14400 by Chromium spec)
    const pageHeightPx = Math.min(dimensions.h, 14400);
    const pdfLongPath = path.join(PREVIEW, 'bitewy-korony-landing-long.pdf');
    await page.pdf({
      path: pdfLongPath,
      width: '1280px',
      height: pageHeightPx + 'px',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    console.log('[playwright] long PDF written:', pdfLongPath, `(${dimensions.h}px → ${pageHeightPx}px)`);

    // 3) A4 paginated PDF — for "regular" preview
    const pdfA4Path = path.join(PREVIEW, 'bitewy-korony-landing-preview.pdf');
    await page.pdf({
      path: pdfA4Path,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    console.log('[playwright] A4 paginated PDF written:', pdfA4Path);

    await ctx.close();
  } finally {
    await browser.close();
  }
  return true;
}

async function renderWithPuppeteer() {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch (e) {
    console.log('[puppeteer] not installed either. Install one:\n  npm i playwright\n  or:  npm i puppeteer');
    return false;
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
    await page.goto(`http://127.0.0.1:${PORT}/?pdf=1&lang=pl`, { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.__landingReady === true', { timeout: 8000 });
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let t = 0;
        const i = setInterval(() => {
          window.scrollBy(0, 600);
          t += 600;
          if (t >= document.body.scrollHeight) { clearInterval(i); window.scrollTo(0, 0); resolve(); }
        }, 80);
      });
    });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(PREVIEW, 'preview-fullpage.png'), fullPage: true });
    console.log('[puppeteer] PNG written.');

    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.pdf({
      path: path.join(PREVIEW, 'bitewy-korony-landing-long.pdf'),
      width: '1280px',
      height: Math.min(h, 14400) + 'px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    await page.pdf({
      path: path.join(PREVIEW, 'bitewy-korony-landing-preview.pdf'),
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    console.log('[puppeteer] PDFs written.');
  } finally { await browser.close(); }
  return true;
}

// ---------- Main ----------
(async () => {
  const server = await startServer();
  try {
    const ok = await renderWithPlaywright();
    if (!ok) await renderWithPuppeteer();
  } catch (e) {
    console.error('[render] FAIL:', e);
    process.exitCode = 1;
  } finally {
    server.close();
    console.log('[server] closed.');
  }
})();
