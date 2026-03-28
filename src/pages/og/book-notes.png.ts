import type { APIRoute } from 'astro';
import { generateOgImage } from '../../utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Book Notes', 'Notes on what I\'m reading.');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
