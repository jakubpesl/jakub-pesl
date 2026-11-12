// Reads PDFs the way an AI agent / ATS would and reports problems.
//
//   node tools/check-pdf-text.mjs Jakub-Pesl-CV.pdf Jakub-Pesl-CV-CZ.pdf
//
// Prints metadata, flags words broken into spaced letters (caused by wide
// letter-spacing in headings — keep it ≤ ~0.05em), and lists key facts found.
// Needs devDependency pdfjs-dist.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const FACTS = ['Jakub Pešl', 'DACH', '500', 'llms.txt', 'Panasonic', 'Technics', 'MBA'];

for (const f of process.argv.slice(2)) {
  const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(f)), verbosity: 0 }).promise;
  const { info } = await doc.getMetadata();
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const t = await (await doc.getPage(i)).getTextContent();
    text += t.items.map(x => x.str + (x.hasEOL ? '\n' : '')).join('') + '\n';
  }
  const spaced = text.match(/\b(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ] ){3,}[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\b/g) || [];
  console.log(`\n== ${f} — ${doc.numPages} pages`);
  console.log(`   Title: ${info.Title}\n   Author: ${info.Author} · Lang: ${info.Language}`);
  console.log(`   Spaced-letter words: ${spaced.length}${spaced.length ? ' → ' + spaced.slice(0, 3).join(' | ') : ''}`);
  console.log(`   Facts found: ${FACTS.filter(k => text.includes(k)).join(', ')}`);
  const missing = FACTS.filter(k => !text.includes(k));
  if (missing.length) console.log(`   Missing: ${missing.join(', ')}`);
}
