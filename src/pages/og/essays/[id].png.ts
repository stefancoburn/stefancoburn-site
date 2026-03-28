import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../../utils/og-image';

export async function getStaticPaths() {
  const essays = await getCollection('essays');
  return essays.map((essay) => ({
    params: { id: essay.id },
    props: { title: essay.data.title },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOgImage(props.title, 'Essays');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
