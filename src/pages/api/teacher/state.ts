// src/pages/api/teacher/state.ts
import type { APIContext } from 'astro';

import { buildPlannerState } from '../../../lib/teacher-planner-state';

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

export async function GET({ locals, url }: APIContext) {
	const blocked = rejectIfProduction();
	if (blocked) {
		return blocked;
	}

	const selectedDate = url.searchParams.get('date') ?? '2026-08-12';
	const state = await buildPlannerState(locals, selectedDate);

	return json({
		ok: true,
		...state,
	});
}
