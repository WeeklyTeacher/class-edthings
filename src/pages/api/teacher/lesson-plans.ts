// src/pages/api/teacher/lesson-plans.ts
import type { APIContext } from 'astro';

import { getClassroomDb } from '../../../lib/db/classroom-db';
import { getLessonPlanByDate, upsertLessonPlan } from '../../../lib/db/lesson-plans';

export const prerender = false;

function json(data: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			...(init?.headers ?? {}),
		},
	});
}

function rejectIfProduction() {
	if (import.meta.env.PROD) {
		return json(
			{ ok: false, error: 'Teacher planning workspace is unavailable until authentication is configured.' },
			{ status: 403 },
		);
	}

	return null;
}

function getDb(locals: App.Locals) {
	return getClassroomDb(locals);
}

export async function GET({ locals, url }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const date = url.searchParams.get('date');
	if (!date) {
		return json({ ok: false, error: 'Missing date parameter.' }, { status: 400 });
	}

	const lessonPlan = await getLessonPlanByDate(getDb(locals), date);
	return json({ ok: true, lessonPlan });
}

export async function POST({ locals, request }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const payload = (await request.json().catch(() => null)) as
		| {
				date?: string;
				title?: string;
				subject?: string;
				objectives?: string;
				lesson_details?: string;
				homework?: string;
				notes?: string;
				publication_status?: 'Published' | 'NotPublished';
		  }
		| null;

	if (!payload?.date) {
		return json({ ok: false, error: 'Missing lesson plan date.' }, { status: 400 });
	}

	const lessonPlan = await upsertLessonPlan(getDb(locals), {
		date: payload.date,
		title: payload.title ?? '',
		subject: payload.subject ?? '',
		objectives: payload.objectives ?? '',
		lesson_details: payload.lesson_details ?? '',
		homework: payload.homework ?? '',
		notes: payload.notes ?? '',
		publication_status: payload.publication_status ?? 'NotPublished',
	});

	return json({ ok: true, lessonPlan });
}
