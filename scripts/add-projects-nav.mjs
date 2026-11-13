// One-time helper: adds the "Projects" tab to the site header.
// Run from the project root:  node scripts/add-projects-nav.mjs
// Safe to run twice — it does nothing if the tab is already there.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/layouts/BaseLayout.astro';
let src = readFileSync(file, 'utf8');

if (src.includes('href="/projects"')) {
  console.log('Projects tab is already in the header — nothing to do.');
  process.exit(0);
}

const navAnchor = /^([ \t]*)<a href="\/quotes"/m;
if (!navAnchor.test(src)) {
  console.error('Could not find the Quotes link in ' + file + ' — no changes made.');
  process.exit(1);
}
src = src.replace(navAnchor, (m, indent) =>
  `${indent}<a href="/projects"    class={active === 'projects'   ? 'active' : ''}>Projects</a>\n${m}`);

// Let pages pass active="projects" (type only; harmless if the pattern isn't found).
src = src.replace(`'essays' | 'quotes'`, `'essays' | 'projects' | 'quotes'`);

writeFileSync(file, src);
console.log('Added the Projects tab to ' + file);
