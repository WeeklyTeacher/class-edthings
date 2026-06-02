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
		classroomName: 'Class EDThings',
		teacherName: 'Your Teacher',
		welcomeMessage:
			'Welcome to our classroom website. Families can find announcements, homework, classroom resources, and communication details here.',
		contactNote:
			'Please use the Contact page for communication guidance. The teacher will keep public updates short, clear, and easy to find.',
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
