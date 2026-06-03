// src/lib/content.ts
import { getCollection } from 'astro:content';

export async function getAnnouncements() {
	const entries = await getCollection('announcements');

	return entries.sort(
		(left, right) => right.data.publishedOn.getTime() - left.data.publishedOn.getTime(),
	);
}

export async function getWeeklyLearningPosts() {
	const entries = await getCollection('weeklyLearning');

	return entries.sort((left, right) => right.data.weekOf.getTime() - left.data.weekOf.getTime());
}

export async function getResources() {
	const entries = await getCollection('resources');

	return entries.sort((left, right) => left.data.title.localeCompare(right.data.title));
}

export async function getSiteSettings() {
	const entries = await getCollection('siteSettings');

	return entries[0]?.data ?? {
		websiteName: "Mr. Sayers' Classroom Website",
		classroomName: "Mr. Sayers' 3rd Grade Class",
		schoolName: 'Eshelman Elementary School',
		schoolYear: '2026-2027',
		teacherName: 'Mr. Sayers',
		welcomeMessage:
			"Welcome to Mr. Sayers' 3rd Grade Class at Eshelman Elementary School. Families can check weekly learning, the classroom calendar, curriculum updates, and communication details here.",
		contactNote:
			'Eshelman Elementary School uses ClassDojo for classroom communication. Please use the Contact page for the best way to reach Mr. Sayers.',
	};
}

export function formatLongDate(value: Date) {
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	}).format(value);
}

export function formatShortDate(value: Date) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
	}).format(value);
}
