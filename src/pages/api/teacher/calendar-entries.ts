// src/pages/api/teacher/calendar-entries.ts
import type { APIContext } from 'astro';

import { deleteCalendarEntry, getCalendarEntriesForDate, upsertCalendarEntry } from '../../../lib/db/calendar-entries';
import { getClassroomDb } from '../../../lib/db/classroom-db';

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

	const entries = await getCalendarEntriesForDate(getDb(locals), date);
	return json({ ok: true, entries });
}

export async function POST({ locals, request }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const payload = (await request.json().catch(() => null)) as
		| {
				id?: number;
				date?: string;
				title?: string;
				description?: string;
				entry_type?: 'classroom' | 'homework' | 'reminder' | 'event' | 'field-trip' | 'assessment';
				publication_status?: 'Published' | 'NotPublished';
		  }
		| null;

	if (!payload?.date || !payload.title) {
		return json({ ok: false, error: 'Missing calendar entry fields.' }, { status: 400 });
	}

	await upsertCalendarEntry(getDb(locals), {
		id: payload.id,
		date: payload.date,
		title: payload.title,
		description: payload.description ?? '',
		entry_type: payload.entry_type ?? 'classroom',
		publication_status: payload.publication_status ?? 'NotPublished',
	});

	const entries = await getCalendarEntriesForDate(getDb(locals), payload.date);
	return json({ ok: true, entries });
}

export async function DELETE({ locals, url }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const id = Number(url.searchParams.get('id'));
	if (!Number.isFinite(id) || id <= 0) {
		return json({ ok: false, error: 'Missing calendar entry id.' }, { status: 400 });
	}

	await deleteCalendarEntry(getDb(locals), id);
	return json({ ok: true });
}
