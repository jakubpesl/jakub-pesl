// Renders the downloadable PDFs from their HTML sources and adds metadata.
//
//   node tools/build-pdfs.cjs            → all four PDFs
//   node tools/build-pdfs.cjs cv         → only the two CVs
//   node tools/build-pdfs.cjs article    → only the two article PDFs
//
// Needs devDependencies (npm install): playwright, pdf-lib.
// Uses Playwright's bundled Chromium; set CHROME=/path/to/chrome-headless-shell
// to use a specific binary (see CLAUDE.md for the WSL library workaround).
// After rebuilding a CV, bump the ?v= on the CV links in index.html and cs/index.html.

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');

const ROOT = path.resolve(__dirname, '..');

const CV_KW_EN = ['Jakub Pešl', 'CV', 'resume', 'marketing communications manager', 'European marketing', 'go-to-market', 'GTM', 'product marketing', 'campaign management', 'trade marketing', 'brand communication', 'P&L', 'marketing budget', 'ROI', 'agency management', 'event marketing', 'CES', 'IFA', 'Panasonic', 'Technics', 'LUMIX', 'consumer electronics', 'DACH', 'Norway', 'Netherlands', 'team leadership', 'AI agents', 'marketing automation', 'MBA', 'Prague'];
const CV_KW_CS = ['Jakub Pešl', 'životopis', 'CV', 'marketingová komunikace', 'evropský marketing', 'go-to-market', 'GTM', 'produktový marketing', 'řízení kampaní', 'trade marketing', 'brand komunikace', 'P&L', 'marketingový rozpočet', 'ROI', 'řízení agentur', 'event marketing', 'CES', 'IFA', 'Panasonic', 'Technics', 'LUMIX', 'spotřební elektronika', 'DACH', 'Norsko', 'Nizozemsko', 'vedení týmu', 'AI agenti', 'automatizace', 'MBA', 'Praha'];

const JOBS = {
  cv: [
    { src: 'cv-source.html', out: 'Jakub-Pesl-CV.pdf', lang: 'en', kw: CV_KW_EN,
      title: 'Jakub Pešl, MBA — CV — European Marketing Communications Manager',
      subject: 'CV of Jakub Pešl, MBA: European Marketing Communications Manager at Panasonic Marketing Europe (manager level); 19 years at Panasonic, 20+ European markets, European go-to-market, campaign management, trade marketing, P&L and budget ownership, CES and IFA, AI agents and automation.' },
    { src: 'cv-source-cs.html', out: 'Jakub-Pesl-CV-CZ.pdf', lang: 'cs', kw: CV_KW_CS,
      title: 'Jakub Pešl, MBA — životopis — European Marketing Communications Manager',
      subject: 'Životopis Jakuba Pešla, MBA: European Marketing Communications Manager v Panasonic Marketing Europe (manažerská pozice); 19 let v Panasonicu, 20+ evropských trhů, evropská go-to-market strategie, řízení kampaní, trade marketing, P&L a rozpočet, CES a IFA, AI agenti a automatizace.' },
  ],
  article: [
    { src: 'clanek-source-cs.html', out: 'Jakub-Pesl-CV-clanek.pdf', lang: 'cs',
      title: 'Pešlovinky.cz — Z call centra až na CES: Jakub Pešl řeší marketingovou komunikaci Panasonicu pro celou Evropu',
      subject: 'Životopis Jakuba Pešla, MBA (European Marketing Communications Manager, Panasonic Marketing Europe) ve formě novinového článku. Nejde o skutečné médium.',
      kw: ['Jakub Pešl', 'životopis', 'CV', 'článek', 'marketingová komunikace', 'Panasonic', 'Technics', 'LUMIX', 'CES', 'IFA', 'go-to-market', 'trade marketing', 'P&L', 'DACH', 'Norsko', 'Nizozemsko', 'AI agenti', 'MBA'] },
    { src: 'clanek-source-en.html', out: 'Jakub-Pesl-CV-article.pdf', lang: 'en',
      title: 'SPešlNews.com — From call centre to CES: Jakub Pešl takes on marketing communications for Panasonic across Europe',
      subject: 'CV of Jakub Pešl, MBA (European Marketing Communications Manager, Panasonic Marketing Europe) written as a news article. Not a real news outlet.',
      kw: ['Jakub Pešl', 'CV', 'resume', 'article', 'marketing communications', 'Panasonic', 'Technics', 'LUMIX', 'CES', 'IFA', 'go-to-market', 'trade marketing', 'P&L', 'DACH', 'Norway', 'Netherlands', 'AI agents', 'MBA'] },
  ],
};

(async () => {
  const which = process.argv[2];
  const jobs = which ? JOBS[which] : [...JOBS.cv, ...JOBS.article];
  if (!jobs) throw new Error('Unknown target: ' + which + ' (use cv or article)');

  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });

  for (const j of jobs) {
    await page.goto('file://' + path.join(ROOT, j.src), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    // Fixed A4 pages hide overflow, so check nothing runs past the bottom edge.
    const overflow = await page.evaluate(() => [...document.querySelectorAll('.page')].map(pg => {
      const limit = pg.getBoundingClientRect().bottom - parseFloat(getComputedStyle(pg).paddingBottom);
      let worst = -Infinity;
      pg.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (r.height > 0 && r.height < 400) worst = Math.max(worst, r.bottom - limit); });
      return Math.round(worst);
    }));

    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true, tagged: true, outline: true });
    const doc = await PDFDocument.load(pdf, { updateMetadata: false });
    doc.setTitle(j.title, { showInWindowTitleBar: true });
    doc.setAuthor('Jakub Pešl');
    doc.setSubject(j.subject);
    doc.setKeywords([j.kw.join(', ')]);   // pdf-lib joins with spaces; keep phrases intact
    doc.setLanguage(j.lang);
    doc.setCreator(j.src + ' · Chromium');
    doc.setProducer('pdf-lib');
    const bytes = await doc.save({ useObjectStreams: false });
    fs.writeFileSync(path.join(ROOT, j.out), bytes);

    const warn = overflow.some(v => v > 0) ? '  ⚠ content below page edge on page(s): ' + overflow.map((v, i) => v > 0 ? i + 1 : null).filter(Boolean).join(', ') : '';
    console.log(`${j.out}: ${doc.getPageCount()} pages, ${(bytes.length / 1024).toFixed(0)} KB${warn}`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
