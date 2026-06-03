// src/pages/api/teacher/worksheets.ts
import type { APIContext } from 'astro';

import { getClassroomDb } from '../../../lib/db/classroom-db';
import { createWorksheetMetadata, listWorksheetMetadata } from '../../../lib/db/worksheets';

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

export async function GET({ locals }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const worksheets = await listWorksheetMetadata(getDb(locals));
	return json({ ok: true, worksheets });
}

export async function POST({ locals, request }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const payload = (await request.json().catch(() => null)) as
		| {
				title?: string;
				description?: string;
				subject?: string;
				date?: string | null;
				school_week?: number | string | null;
				ckla_unit?: string;
				r2_object_key?: string;
				file_name?: string;
				publication_status?: 'Published' | 'NotPublished';
		  }
		| null;

	if (!payload?.title || !payload.r2_object_key || !payload.file_name) {
		return json({ ok: false, error: 'Missing worksheet metadata fields.' }, { status: 400 });
	}

	await createWorksheetMetadata(getDb(locals), {
		title: payload.title,
		description: payload.description ?? '',
		subject: payload.subject ?? '',
		date: payload.date ?? null,
		school_week:
			payload.school_week === '' || payload.school_week === null || payload.school_week === undefined
				? null
				: Number(payload.school_week),
		ckla_unit: payload.ckla_unit ?? '',
		r2_object_key: payload.r2_object_key,
		file_name: payload.file_name,
		publication_status: payload.publication_status ?? 'NotPublished',
	});

	const worksheets = await listWorksheetMetadata(getDb(locals));
	return json({ ok: true, worksheets });
}
