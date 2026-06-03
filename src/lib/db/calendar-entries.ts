// src/lib/db/calendar-entries.ts
import { createUnavailableDbMessage } from './classroom-db';

export type CalendarEntryType = 'classroom' | 'homework' | 'reminder' | 'event' | 'field-trip' | 'assessment';
export type CalendarEntryPublicationStatus = 'Published' | 'NotPublished';

export interface CalendarEntryRecord {
	id: number;
	date: string;
	title: string;
	description: string;
	entry_type: CalendarEntryType;
	publication_status: CalendarEntryPublicationStatus;
	created_at: string;
	updated_at: string;
}

export interface CalendarEntryInput {
	id?: number;
	date: string;
	title: string;
	description: string;
	entry_type: CalendarEntryType;
	publication_status: CalendarEntryPublicationStatus;
}

function mapRow(row: Record<string, unknown> | undefined): CalendarEntryRecord | null {
	if (!row) {
		return null;
	}

	return {
		id: Number(row.id),
		date: String(row.date),
		title: String(row.title),
		description: String(row.description),
		entry_type: row.entry_type as CalendarEntryType,
		publication_status: row.publication_status === 'Published' ? 'Published' : 'NotPublished',
		created_at: String(row.created_at),
		updated_at: String(row.updated_at),
	};
}

export async function getCalendarEntriesForDate(db: D1Database | null, date: string) {
	if (!db) {
		return [];
	}

	const result = await db
		.prepare('SELECT * FROM calendar_entries WHERE date = ?1 ORDER BY created_at DESC')
		.bind(date)
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function listPublishedCalendarEntries(db: D1Database | null) {
	if (!db) {
		return [];
	}

	const result = await db
		.prepare(
			`SELECT * FROM calendar_entries
			 WHERE publication_status = 'Published'
			 ORDER BY date ASC, created_at ASC`,
		)
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function getPublishedCalendarEntriesForMonth(db: D1Database | null, monthStart: string, monthEnd: string) {
	if (!db) {
		return [];
	}

	const result = await db
		.prepare(
			`SELECT * FROM calendar_entries
			 WHERE publication_status = 'Published'
			 AND date >= ?1
			 AND date <= ?2
			 ORDER BY date ASC, created_at ASC`,
		)
		.bind(monthStart, monthEnd)
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function listCalendarEntriesForDateRange(db: D1Database | null, startDate: string, endDate: string) {
	if (!db) {
		return [];
	}

	const result = await db
		.prepare(
			`SELECT * FROM calendar_entries
			 WHERE date >= ?1
			 AND date <= ?2
			 ORDER BY date ASC, created_at DESC`,
		)
		.bind(startDate, endDate)
		.all();

	return (result.results ?? []).map((row) => mapRow(row)!).filter(Boolean);
}

export async function upsertCalendarEntry(db: D1Database | null, input: CalendarEntryInput) {
	if (!db) {
		throw new Error(createUnavailableDbMessage());
	}

	if (input.id) {
		await db
			.prepare(
				`UPDATE calendar_entries
				 SET date = ?1,
					 title = ?2,
					 description = ?3,
					 entry_type = ?4,
					 publication_status = ?5,
					 updated_at = CURRENT_TIMESTAMP
				 WHERE id = ?6`,
			)
			.bind(
				input.date,
				input.title,
				input.description,
				input.entry_type,
				input.publication_status,
				input.id,
			)
			.run();
	} else {
		await db
			.prepare(
				`INSERT INTO calendar_entries (
					date,
					title,
					description,
					entry_type,
					publication_status,
					updated_at
				) VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)`,
			)
			.bind(
				input.date,
				input.title,
				input.description,
				input.entry_type,
				input.publication_status,
			)
			.run();
	}

	return input.date;
}

export async function deleteCalendarEntry(db: D1Database | null, id: number) {
	if (!db) {
		throw new Error(createUnavailableDbMessage());
	}

	await db.prepare('DELETE FROM calendar_entries WHERE id = ?1').bind(id).run();
}
