import type { APIRoute } from 'astro';
import { generateOgImage } from '../../utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('Essays', 'On technology, society, and the good life.');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
