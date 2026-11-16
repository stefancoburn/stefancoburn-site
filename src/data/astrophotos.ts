// Photos shown on /astrophotography. Listed oldest to newest; the page shows them newest first.
// To add one: put the image at src/images/astro/{slug}.jpg and add an entry
// at the END of this list.
export interface AstroPhoto {
  slug: string;
  name: string;          // common name, e.g. "Andromeda Galaxy"
  designation?: string;  // catalogue numbers, e.g. "M31 · NGC 224"
  type: string;          // e.g. "Spiral galaxy"
  constellation?: string;
  distance?: string;     // e.g. "2.5 million light-years"
  about: string;         // a short paragraph
  alt: string;           // describes the picture for screen readers
  capture?: string;      // optional: integration time, date, filter
}

export const astrophotos: AstroPhoto[] = [
  {
    slug: 'andromeda-galaxy',
    name: 'Andromeda Galaxy',
    designation: 'M31 · NGC 224',
    type: 'Spiral galaxy',
    constellation: 'Andromeda',
    distance: '2.5 million light-years',
    about: 'The nearest large galaxy to our own, and the most distant thing most people can see with the naked eye. Andromeda holds several hundred billion stars in a disc more than 150,000 light-years across, so wide that this frame only fits its bright core and inner dust lanes. The two fuzzy patches beside it are its companion galaxies, M32 and M110. The light in this picture left Andromeda before our species existed.',
    alt: 'The bright oval core of the Andromeda Galaxy with brown dust lanes spiralling around it, tilted across the frame, and two small fuzzy companion galaxies nearby against a field of stars.',
    capture: 'Captured 6 November 2026',
  },
  {
    slug: 'ngc-891',
    name: 'Silver Sliver Galaxy',
    designation: 'NGC 891 · Caldwell 23',
    type: 'Edge-on spiral galaxy',
    constellation: 'Andromeda',
    distance: 'About 30 million light-years',
    about: 'A spiral galaxy seen exactly edge-on, so it appears as a thin streak of light split down the middle by a dark lane of dust. It is close to the Milky Way in size and shape, which makes it a fair picture of what our own galaxy would look like from the outside. William Herschel discovered it in 1784. Every other point of light in the frame is a foreground star in our own galaxy.',
    alt: 'A thin, pale spindle of light with a dark line running along its length, small in the centre of a wide field of stars.',
    capture: 'Captured 9 November 2026',
  },
  {
    slug: 'pleiades',
    name: 'The Pleiades',
    designation: 'M45 · The Seven Sisters',
    type: 'Open star cluster with reflection nebula',
    constellation: 'Taurus',
    distance: 'About 440 light-years',
    about: 'A cluster of more than a thousand young stars, born together roughly 100 million years ago and still travelling as a group. Six or seven are visible to the naked eye, and nearly every culture has a name for them; in Japan they are Subaru. The blue haze is not glowing gas. It is a cloud of interstellar dust the cluster happens to be passing through, scattering the blue light of its hottest stars the same way our atmosphere makes the sky blue.',
    alt: 'A group of brilliant blue-white stars wrapped in wispy blue haze against a dark sky scattered with fainter stars.',
    capture: 'Captured 9 November 2026',
  },
  {
    slug: 'horsehead-nebula',
    name: 'Horsehead and Flame Nebulae',
    designation: 'IC 434 · Barnard 33 · NGC 2024',
    type: 'Dark nebula against an emission nebula',
    constellation: 'Orion',
    distance: 'About 1,400 light-years',
    about: 'The Horsehead is the small dark notch halfway down the frame: a cold, dense pillar of dust a few light-years tall, silhouetted against a curtain of hydrogen gas glowing red. Above it, the Flame Nebula is a second cloud lit from within and crossed by dark dust lanes. The brilliant star between them is Alnitak, the easternmost star of Orion’s Belt. Williamina Fleming first spotted the Horsehead on a photographic plate at Harvard in 1888.',
    alt: 'A tall curtain of glowing red gas with a small dark shape like a horse’s head jutting into it. Above sits a brighter orange-pink cloud crossed by dark lanes, next to a very bright white star.',
    capture: 'Captured 9 November 2026',
  },
  {
    slug: 'pinwheel-galaxy',
    name: 'Pinwheel Galaxy',
    designation: 'M101 · NGC 5457',
    type: 'Face-on spiral galaxy',
    constellation: 'Ursa Major',
    distance: 'About 21 million light-years',
    about: 'A spiral galaxy turned almost exactly face-on to us, so its arms can be traced all the way around the core. At roughly 170,000 light-years across it is considerably larger than the Milky Way. The arms are lopsided, stretched further on one side than the other, most likely by the pull of smaller galaxies that have passed close by. Pierre Méchain found it in 1781, and in 2023 a star in one of those arms exploded as a supernova bright enough for backyard telescopes to follow.',
    alt: 'A small, pale spiral galaxy seen face-on, with a bright centre and thin curving arms, in the middle of a dark field of scattered stars.',
    capture: 'Captured 14 November 2026',
  },
  {
    slug: 'triangulum-galaxy',
    name: 'Triangulum Galaxy',
    designation: 'M33 · NGC 598',
    type: 'Spiral galaxy',
    constellation: 'Triangulum',
    distance: 'About 2.7 million light-years',
    about: 'The third-largest member of our Local Group of galaxies, after Andromeda and the Milky Way, and a close neighbour of Andromeda in the sky. It is a loosely wound spiral about 60,000 light-years across, with no bright central bulge, which makes its light faint and spread out. The small pink knots scattered along the arms are clouds of glowing hydrogen where new stars are forming; the largest of them, NGC 604, is one of the biggest stellar nurseries known in any nearby galaxy.',
    alt: 'A soft, pale oval of spiral arms with a slightly brighter centre and a few tiny pink spots, tilted in the middle of a tall dark field of stars.',
    capture: 'Captured over two nights, 14 and 15 November 2026',
  },
  {
    slug: 'eastern-veil-nebula',
    name: 'Eastern Veil Nebula',
    designation: 'NGC 6992 · NGC 6995',
    type: 'Supernova remnant',
    constellation: 'Cygnus',
    distance: 'About 2,400 light-years',
    about: 'One edge of the Cygnus Loop, the expanding wreckage of a massive star that blew itself apart somewhere between ten and twenty thousand years ago. The blast wave is still moving outward, and where it ploughs into the thin gas between the stars it heats it into these glowing filaments: red from hydrogen, blue-green from oxygen. The whole loop spans about six full Moons of sky, so this frame holds only its eastern arc. William Herschel discovered it in 1784.',
    alt: 'A long, curved ribbon of fine red filaments edged with faint teal, arcing from upper right to lower left across a dense field of stars.',
    capture: 'Captured over two nights, 14 and 15 November 2026',
  },
];
