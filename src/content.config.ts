import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const bookNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/book-notes' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    /** Bookshelf slug, only needed when it differs from the note's filename. */
    book: z.string().optional(),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    prominence: z.enum(['normal', 'medium', 'high']).default('normal'),
  }),
});

export const collections = { 'book-notes': bookNotes, essays };
