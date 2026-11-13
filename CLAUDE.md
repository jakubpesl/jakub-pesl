# Jakub Pešl — personal website & CVs

Personal brand site of Jakub Pešl, MBA (European Marketing Communications Manager, Panasonic Marketing Europe).
Static HTML, no build step, no backend. Hosted on **GitHub Pages from `main`** → https://jakubpesl.github.io/jakub-pesl/ (repo is **public**).

## Files

| Path | What |
|---|---|
| `index.html` | English site (single file: HTML + CSS + JS) |
| `cs/index.html` | Czech site — same structure, paths prefixed `../`. **Always edit EN and CZ together.** |
| `llms.txt` | Plain-text profile for AI assistants (linked from both pages, CV and JSON-LD) |
| `sitemap.xml` | EN + CZ pages, llms.txt, CV PDFs |
| `cv-source.html` / `cv-source-cs.html` | **Classic CV** → `Jakub-Pesl-CV.pdf` / `Jakub-Pesl-CV-CZ.pdf` (3 fixed A4 pages), linked in the footer as "Classic CV". Keep its facts in sync with the article fact sheet and llms.txt. |
| `clanek-source-cs.html` / `clanek-source-en.html` | **PRIMARY CV** — CV as a news article: **Pešlovinky.cz** → `Jakub-Pesl-CV-clanek.pdf`, **SPešlNews.com** → `Jakub-Pesl-CV-article.pdf` (3 A4 pages; page 3 = structured "Candidate fact sheet" for recruiters/AI: level, team, figures, languages, career table, competencies). Linked from the "CV ↓" button. |
| `og-source.html` → `og.png` | Social share image |
| `img/work/` | Project photos: `<key>-N.webp`, `-thumb.webp` (fans), `-wall.webp` (photo wall) |
| `img/personal/` | "The whole picture" photos |
| `img/clanek/` | JPEGs for the article PDFs (webp/PNG bloat Chromium PDFs) |
| `img/cv-photo.jpg` | CV photo |
| `picture2/` | Original photos (gitignored) |
| `tools/` | PDF build, image conversion, PDF text check |

## Site structure (both languages)
Hero → stats → About bento (+ languages line) → **Highlights** (6 project cards with photo fans + "Behind the work" photo wall marquee) → Journey timeline (scroll-driven fill) → Learning (course marquee) + **Now card** (updated Nov 2026, "Happy to talk about" strip) → The whole picture (personal) → testimonial → contact (+ "Ask an AI about me": ChatGPT / Claude / Perplexity links pointing at llms.txt).

Features: View Transitions (thumbnail → lightbox morph, EN⇄CZ cross-fade), CSS scroll-driven animations with `@supports` fallback, Inter variable font, dark mode via `data-theme`, `prefers-reduced-motion` respected. Marquee copies are cloned in JS (not in HTML) so crawlers read text once; gallery clicks are delegated on `document`.

## Content rules (agreed with Jakub)
- **Positioning: manager, not director.** He is not looking for a director role — never stylise him as Head/Director; no target role on the site. llms.txt and CV page 3 state "Level: manager".
- **No sales/business results in public** (volumes, revenue, budget size). Technics only qualitatively: "four generations of TWS — EAH-AZ60, AZ60M2, AZ80, AZ100".
- Public figures OK: 19 years at Panasonic, 20+ markets, strategy for marketing teams in **6 main European offices**, local **CEEG team of 5** (retail & trade marketing), **8–10 specialised agencies**, Fire TV × Amazon ("Watch your favourites. Control your home.") **500M impressions in 6 countries**, 200+ product videos/year, CES & IFA, big projects on lean budgets.
- Current focus: **DACH, Norway and the Netherlands** (user's "PNO" meant NO + NL). **Working language English.** German basic.
- Internal slides: only `tv-4` (TV 3-pillar strategy) is allowed, and only in the TV card gallery — never in the photo wall. Technics agenda/survey slides are out.
- Czech texts: `&nbsp;` after one-letter prepositions/conjunctions (v, s, z, k, o, u, a, i).
- Tone: factual, premium, Apple-like. Changes are approved step by step; visual check before showing.
- Not wanted: own AI chat on the site (would need Vercel/backend), reminders to update the Now card, public link to Retail Price Monitor.

## PDFs
```bash
npm install                       # sharp, playwright, pdf-lib, pdfjs-dist
npm run pdf          # all four PDFs   (pdf:cv / pdf:article for a subset)
npm run check:pdf    # read PDFs like an AI agent: metadata, spaced-letter words, key facts
```
- Pages are fixed A4 with hidden overflow — the build warns if content runs past a page edge; trim text, don't shrink fonts.
- Keep heading `letter-spacing` ≤ ~0.05em, otherwise PDF text extraction splits words into letters ("C OR E …").
- After a new CV: **bump `?v=` on all CV links** (nav + footer) in both `index.html` files (GitHub Pages caches 10 min, browsers longer). Current: `?v=20261113`.
- New photos: `node tools/make-images.cjs picture2/<file>.jpg img/work/<key>-<n>` (also `--jpeg` for `img/clanek/`).

**WSL Playwright workaround** (no sudo): Playwright 1.56's own Chromium may be missing; use the installed headless shell and fetch missing libs locally:
```bash
mkdir -p /tmp/pwlibs/debs && cd /tmp/pwlibs/debs
apt-get download libnspr4 libnss3=2:3.98-1build1 libasound2t64   # ubuntu0.2 of libnss3 returns 404
for d in *.deb; do dpkg -x "$d" /tmp/pwlibs/root; done
export LD_LIBRARY_PATH=$(find /tmp/pwlibs/root -name '*.so*' -printf '%h\n' | sort -u | tr '\n' ':')
export CHROME=~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

## Deploy
Feature branch → PR → **Jakub merges** (`! gh pr merge <n> --merge --delete-branch`; Claude may not merge) → Pages builds in ~1 min. Commit only when asked; author `Jakub <jkoudy@seznam.cz>`. Backups of earlier states: `~/dev2/jakub-pesl-backup/`.

## AI-agent audit (2026-11-12)
Simulated AI recruiter (manager-level role): **6/10 → 7/10, "shortlist: yes"** after adding level, figures, languages, JSON-LD.
Remaining gaps it names: business outcomes (not publishable), digital/performance metrics, single employer, only one testimonial.

## Open / next
- [ ] Jakub will collect **LinkedIn recommendations** → add as testimonials (site, CV, llms.txt, article PDFs).
- [ ] Public app for the "Building" tile in the Now card → add link when one exists.
- [ ] Re-run the AI-recruiter check after the next content change.
- [ ] Update the Now card (and its date, CV page 3, llms.txt) when focus changes.
