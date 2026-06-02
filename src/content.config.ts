import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const announcements = defineCollection({
	loader: glob({
		base: './src/content/announcements',
		pattern: '**/index.mdoc',
		generateId: ({ entry }) => entry.replace(/\/index\.mdoc$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		publishedOn: z.coerce.date(),
		summary: z.string(),
		featured: z.boolean().default(false),
	}),
});

const weeklyLearning = defineCollection({
	loader: glob({
		base: './src/content/weekly-learning',
		pattern: '**/index.mdoc',
		generateId: ({ entry }) => entry.replace(/\/index\.mdoc$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		weekOf: z.coerce.date(),
		summary: z.string(),
	}),
});

const resources = defineCollection({
	loader: glob({
		base: './src/content/resources',
		pattern: '**/index.yaml',
		generateId: ({ entry }) => entry.replace(/\/index\.yaml$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		category: z.enum(['reading', 'math', 'writing', 'family', 'classroom']),
		description: z.string(),
		href: z.string().url(),
		audience: z.enum(['families', 'students', 'both']),
	}),
});

const siteSettings = defineCollection({
	loader: glob({
		base: './src/content/site-settings',
		pattern: 'index.yaml',
		generateId: () => 'site-settings',
	}),
	schema: z.object({
		classroomName: z.string(),
		teacherName: z.string(),
		welcomeMessage: z.string(),
		contactNote: z.string(),
	}),
});

export const collections = {
	announcements,
	weeklyLearning,
	resources,
	siteSettings,
};
