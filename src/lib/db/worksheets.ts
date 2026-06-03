// src/lib/db/worksheets.ts
import { createUnavailableDbMessage } from './classroom-db';

export type WorksheetPublicationStatus = 'Published' | 'NotPublished';

export interface WorksheetRecord {
	id: number;
	title: string;
	description: string;
	subject: string;
	date: string | null;
	school_week: number | null;
	ckla_unit: string;
	r2_object_key: string;
	file_name: string;
	publication_status: WorksheetPublicationStatus;
	created_at: string;
	updated_at: string;
}

export interface WorksheetInput {
	title: string;
	description: string;
	subject: string;
	date: string | null;
	school_week: number | null;
	ckla_unit: string;
	r2_object_key: string;
	file_name: string;
	publication_status: WorksheetPublicationStatus;
}

function mapRow(row: Record<string, unknown> | undefined): WorksheetRecord | null {
	if (!row) {
		return null;
	}

	return {
		id: Number(row.id),
		title: String(row.title),
		description: String(row.description),
		subject: String(row.subject),
		date: row.date ? String(row.date) : null,
		school_week: row.school_week === null || row.school_week === undefined ? null : Number(row.school_week),
		ckla_unit: String(row.ckla_unit),
		r2_object_key: String(row.r2_object_key),
		file_name: String(row.file_name),
		publication_status: row.publication_status === 'Published' ? 'Published' : 'NotPublished',
		created_at: String(row.created_at),
		updated_at: String(row.updated_at),
	};
}

export async function listWorksheetMetadata(db: D1Database | null) {
	if (!db) {
		return [];
	}

	const result = await db
		.prepare('SELECT * FROM worksheets ORDER BY created_at DESC, id DESC')
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function createWorksheetMetadata(db: D1Database | null, input: WorksheetInput) {
	if (!db) {
		throw new Error(createUnavailableDbMessage());
	}

	await db
		.prepare(
			`INSERT INTO worksheets (
				title,
				description,
				subject,
				date,
				school_week,
				ckla_unit,
				r2_object_key,
				file_name,
				publication_status,
				updated_at
			) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP)`,
		)
		.bind(
			input.title,
			input.description,
			input.subject,
			input.date,
			input.school_week,
			input.ckla_unit,
			input.r2_object_key,
			input.file_name,
			input.publication_status,
		)
		.run();
}
