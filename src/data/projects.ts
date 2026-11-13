// Projects shown on /projects. Each one is a self-contained page that lives at
// public/projects/{slug}/index.html, with a thumbnail at src/images/projects/{slug}.jpg.
// To add one: drop in those two files and add an entry here (order = display order).
export interface Project {
  slug: string;
  title: string;
  kind: string;      // small label above the title
  summary: string;
}

export const projects: Project[] = [
  {
    slug: 'cosmic-distance-ladder',
    title: 'Cosmic Distance Ladder',
    kind: 'Astronomy · Interactive',
    summary: "Nine rungs, from Eratosthenes' shadow to the edge of the observable universe. Each measurement you make becomes the ruler for the next.",
  },
  {
    slug: 'weighing-the-earth',
    title: 'Weighing the Earth',
    kind: 'Physics · 3D explainer',
    summary: "Cavendish's 1798 torsion-balance experiment in 3D: the apparatus, the derivation of G, and a calculator to run the numbers yourself.",
  },
  {
    slug: 'homestake-deficit',
    title: 'The Homestake Deficit',
    kind: 'Physics · Animated explainer',
    summary: "A 16-minute animated walk through Ray Davis's solar neutrino experiment, from the Sun's core to a tank of cleaning fluid a mile underground, and the missing neutrinos it found.",
  },
  {
    slug: 'orbital-elements-lab',
    title: 'Orbital Elements Lab',
    kind: 'Spaceflight · Interactive',
    summary: 'A 3D Earth and satellite with a slider for each of the six Keplerian elements, real-orbit presets, and live period, altitude and drift readouts.',
  },
  {
    slug: 'penrose-tiling',
    title: 'Penrose Tiling',
    kind: 'Mathematics · Interactive',
    summary: 'Kites and darts: two tiles that cover the plane forever without ever repeating. Pan, zoom and dive into the pattern.',
  },
  {
    slug: 'seestar-shoot-planner',
    title: 'Seestar Shoot Planner',
    kind: 'Astrophotography · Tool',
    summary: 'Plans a night of deep-sky imaging with a Seestar smart telescope: what is up, when it clears the horizon, how the Moon and clouds interfere, and what to shoot in what order.',
  },
];
