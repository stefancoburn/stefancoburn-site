import type { APIRoute } from 'astro';
import { generateOgImage } from '../../utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Quotes', 'Words worth remembering.');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
