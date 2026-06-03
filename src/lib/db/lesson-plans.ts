// src/lib/db/lesson-plans.ts
import { createUnavailableDbMessage } from './classroom-db';

export type LessonPlanPublicationStatus = 'Published' | 'NotPublished';

export interface LessonPlanRecord {
	id: number;
	date: string;
	title: string;
	subject: string;
	objectives: string;
	lesson_details: string;
	homework: string;
	notes: string;
	publication_status: LessonPlanPublicationStatus;
	created_at: string;
	updated_at: string;
}

export interface LessonPlanInput {
	date: string;
	title: string;
	subject: string;
	objectives: string;
	lesson_details: string;
	homework: string;
	notes: string;
	publication_status: LessonPlanPublicationStatus;
}

export interface LessonPlanRow {
	id: number;
	date: string;
	title: string;
	subject: string;
	objectives: string;
	lesson_details: string;
	homework: string;
	notes: string;
	publication_status: LessonPlanPublicationStatus;
	created_at: string;
	updated_at: string;
}

function mapRow(row: Record<string, unknown> | undefined): LessonPlanRecord | null {
	if (!row) {
		return null;
	}

	return {
		id: Number(row.id),
		date: String(row.date),
		title: String(row.title),
		subject: String(row.subject),
		objectives: String(row.objectives),
		lesson_details: String(row.lesson_details),
		homework: String(row.homework),
		notes: String(row.notes),
		publication_status: row.publication_status === 'Published' ? 'Published' : 'NotPublished',
		created_at: String(row.created_at),
		updated_at: String(row.updated_at),
	};
}

export async function getLessonPlanByDate(db: D1Database | null, date: string) {
	if (!db) {
		return null;
	}

	const result = await db.prepare('SELECT * FROM lesson_plans WHERE date = ?1 LIMIT 1').bind(date).first();
	return mapRow(result ?? undefined);
}

export async function listPublishedLessonPlans(db: D1Database | null) {
	if (!db) {
		return [];
	}

	const result = await db
		.prepare(
			`SELECT * FROM lesson_plans
			 WHERE publication_status = 'Published'
			 ORDER BY date ASC`,
		)
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function listLessonPlansForDates(db: D1Database | null, dates: string[]) {
	if (!db || dates.length === 0) {
		return [];
	}

	const placeholders = dates.map((_, index) => `?${index + 1}`).join(', ');
	const result = await db
		.prepare(`SELECT * FROM lesson_plans WHERE date IN (${placeholders}) ORDER BY date ASC`)
		.bind(...dates)
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function upsertLessonPlan(db: D1Database | null, input: LessonPlanInput) {
	if (!db) {
		throw new Error(createUnavailableDbMessage());
	}

	await db
		.prepare(
			`INSERT INTO lesson_plans (
				date,
				title,
				subject,
				objectives,
				lesson_details,
				homework,
				notes,
				publication_status,
				updated_at
			) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP)
			ON CONFLICT(date) DO UPDATE SET
				title = excluded.title,
				subject = excluded.subject,
				objectives = excluded.objectives,
				lesson_details = excluded.lesson_details,
				homework = excluded.homework,
				notes = excluded.notes,
				publication_status = excluded.publication_status,
				updated_at = CURRENT_TIMESTAMP`,
		)
		.bind(
			input.date,
			input.title,
			input.subject,
			input.objectives,
			input.lesson_details,
			input.homework,
			input.notes,
			input.publication_status,
		)
		.run();

	return getLessonPlanByDate(db, input.date);
}
