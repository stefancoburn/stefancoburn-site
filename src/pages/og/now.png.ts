import type { APIRoute } from 'astro';
import { generateOgImage } from '../../utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('What I\'m Doing Now');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
