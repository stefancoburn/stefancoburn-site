import type { APIRoute } from 'astro';
import { generateOgImage } from '../../utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('About', 'The story so far.');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
