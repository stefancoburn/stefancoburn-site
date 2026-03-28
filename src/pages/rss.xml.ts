import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const bookNotes = await getCollection('book-notes');
  const essays = await getCollection('essays');

  const allItems = [
    ...bookNotes.map((note) => ({
      title: note.data.title,
      pubDate: new Date(note.data.date),
      description: note.data.description || '',
      link: `/book-notes/${note.id}/`,
    })),
    ...essays.map((essay) => ({
      title: essay.data.title,
      pubDate: new Date(essay.data.date),
      description: essay.data.description || '',
      link: `/essays/${essay.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Stefan Coburn',
    description: 'Engineer, firefighter, pragmatic optimist. Exploring technology, society, and the good life.',
    site: 'https://stefancoburn.com',
    items: allItems,
  });
}
