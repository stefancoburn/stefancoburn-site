import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../../utils/og-image';

export async function getStaticPaths() {
  const bookNotes = await getCollection('book-notes');
  return bookNotes.map((note) => ({
    params: { id: note.id },
    props: { title: note.data.title },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOgImage(props.title, 'Book Notes');

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
