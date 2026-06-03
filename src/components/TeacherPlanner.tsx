/* src/components/TeacherPlanner.tsx */
import { useMemo, useState } from 'react';
import type { SubmitEventHandler } from 'react';

import type { CalendarEntryRecord, CalendarEntryType, CalendarEntryPublicationStatus } from '../lib/db/calendar-entries';
import type { LessonPlanPublicationStatus, LessonPlanRecord } from '../lib/db/lesson-plans';
import type { WorksheetPublicationStatus } from '../lib/db/worksheets';
import type { PlannerState } from '../lib/teacher-planner-state';

type PlannerProps = {
	initialState: PlannerState;
	instructionalDates: string[];
};

type MessageState = {
	type: 'success' | 'error';
	text: string;
} | null;

type LessonPlanDraft = {
	title: string;
	subject: string;
	objectives: string;
	lesson_details: string;
	homework: string;
	notes: string;
	publication_status: LessonPlanPublicationStatus;
};

type CalendarEntryDraft = {
	id: number | null;
	title: string;
	description: string;
	entry_type: CalendarEntryType;
	publication_status: CalendarEntryPublicationStatus;
};

type WorksheetDraft = {
	title: string;
	description: string;
	subject: string;
	date: string | null;
	school_week: string;
	ckla_unit: string;
	r2_object_key: string;
	file_name: string;
	publication_status: WorksheetPublicationStatus;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC',
});

function parseIsoDate(date: string) {
	const [year, month, day] = date.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function toLessonPlanDraft(plan: LessonPlanRecord | null): LessonPlanDraft {
	return {
		title: plan?.title ?? '',
		subject: plan?.subject ?? '',
		objectives: plan?.objectives ?? '',
		lesson_details: plan?.lesson_details ?? '',
		homework: plan?.homework ?? '',
		notes: plan?.notes ?? '',
		publication_status: plan?.publication_status ?? 'NotPublished',
	};
}

function toCalendarEntryDraft(entry: CalendarEntryRecord | null): CalendarEntryDraft {
	return {
		id: entry?.id ?? null,
		title: entry?.title ?? '',
		description: entry?.description ?? '',
		entry_type: entry?.entry_type ?? 'classroom',
		publication_status: entry?.publication_status ?? 'NotPublished',
	};
}

function toWorksheetDraft(state: PlannerState): WorksheetDraft {
	return {
		title: '',
		description: '',
		subject: '',
		date: state.selectedDate,
		school_week: state.baseline.schoolWeek === null ? '' : String(state.baseline.schoolWeek),
		ckla_unit: state.baseline.cklaUnit ?? '',
		r2_object_key: `teacher-planner/${state.selectedDate}/worksheet.pdf`,
		file_name: '',
		publication_status: 'NotPublished',
	};
}

function buildFetchOptions(body?: unknown, method = 'POST'): RequestInit {
	return {
		method,
		headers: body ? { 'content-type': 'application/json' } : undefined,
		body: body ? JSON.stringify(body) : undefined,
	};
}

export default function TeacherPlanner({ initialState, instructionalDates }: PlannerProps) {
	const [plannerState, setPlannerState] = useState(initialState);
	const [selectedDate, setSelectedDate] = useState(initialState.selectedDate);
	const [lessonDraft, setLessonDraft] = useState<LessonPlanDraft>(toLessonPlanDraft(initialState.lessonPlan));
	const [calendarDraft, setCalendarDraft] = useState<CalendarEntryDraft>(
		toCalendarEntryDraft(initialState.calendarEntries[0] ?? null),
	);
	const [worksheetDraft, setWorksheetDraft] = useState<WorksheetDraft>(toWorksheetDraft(initialState));
	const [editingCalendarEntryId, setEditingCalendarEntryId] = useState<number | null>(null);
	const [message, setMessage] = useState<MessageState>(null);
	const [busy, setBusy] = useState(false);

	const selectedBaselineLabel = useMemo(() => {
		const baseline = plannerState.baseline;
		const parts = [dateFormatter.format(parseIsoDate(selectedDate))];
		if (baseline.schoolWeek) {
			parts.push(`Week ${baseline.schoolWeek}`);
		}
		if (baseline.schoolDayNumber) {
			parts.push(`Day ${baseline.schoolDayNumber}`);
		}
		return parts.join(' · ');
	}, [plannerState.baseline, selectedDate]);

	async function loadState(date: string) {
		setBusy(true);
		setMessage(null);

		try {
			const response = await fetch(`/api/teacher/state?date=${encodeURIComponent(date)}`);
			const data = (await response.json()) as { ok: boolean; error?: string } & PlannerState;

			if (!response.ok || !data.ok) {
				throw new Error(data.error ?? 'Unable to load planner state.');
			}

			setPlannerState(data);
			setSelectedDate(data.selectedDate);
			setLessonDraft(toLessonPlanDraft(data.lessonPlan));
			setCalendarDraft(toCalendarEntryDraft(data.calendarEntries[0] ?? null));
			setWorksheetDraft(toWorksheetDraft(data));
			setEditingCalendarEntryId(null);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Unable to load planner state.',
			});
		} finally {
			setBusy(false);
		}
	}

	const saveLessonPlan: SubmitEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		setBusy(true);
		setMessage(null);

		try {
			const response = await fetch('/api/teacher/lesson-plans', buildFetchOptions({ date: selectedDate, ...lessonDraft }));
			const data = (await response.json()) as { ok: boolean; error?: string };
			if (!response.ok || !data.ok) {
				throw new Error(data.error ?? 'Unable to save lesson plan.');
			}

			setMessage({ type: 'success', text: 'Lesson plan saved locally.' });
			await loadState(selectedDate);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Unable to save lesson plan.',
			});
		} finally {
			setBusy(false);
		}
	};

	const saveCalendarEntry: SubmitEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		setBusy(true);
		setMessage(null);

		try {
			const entryId = editingCalendarEntryId ?? calendarDraft.id ?? undefined;
			const response = await fetch(
				'/api/teacher/calendar-entries',
				buildFetchOptions({
					id: entryId,
					date: selectedDate,
					title: calendarDraft.title,
					description: calendarDraft.description,
					entry_type: calendarDraft.entry_type,
					publication_status: calendarDraft.publication_status,
				}),
			);
			const data = (await response.json()) as { ok: boolean; error?: string };
			if (!response.ok || !data.ok) {
				throw new Error(data.error ?? 'Unable to save calendar entry.');
			}

			setMessage({ type: 'success', text: 'Calendar entry saved locally.' });
			await loadState(selectedDate);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Unable to save calendar entry.',
			});
		} finally {
			setBusy(false);
		}
	}

	async function deleteCalendarEntry(id: number) {
		setBusy(true);
		setMessage(null);

		try {
			const response = await fetch(`/api/teacher/calendar-entries?id=${id}`, { method: 'DELETE' });
			const data = (await response.json()) as { ok: boolean; error?: string };
			if (!response.ok || !data.ok) {
				throw new Error(data.error ?? 'Unable to delete calendar entry.');
			}

			setMessage({ type: 'success', text: 'Calendar entry deleted locally.' });
			await loadState(selectedDate);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Unable to delete calendar entry.',
			});
		} finally {
			setBusy(false);
		}
	};

	const saveWorksheet: SubmitEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		setBusy(true);
		setMessage(null);

		try {
			const response = await fetch('/api/teacher/worksheets', buildFetchOptions(worksheetDraft));
			const data = (await response.json()) as { ok: boolean; error?: string };
			if (!response.ok || !data.ok) {
				throw new Error(data.error ?? 'Unable to save worksheet metadata.');
			}

			setMessage({ type: 'success', text: 'Worksheet metadata saved locally.' });
			await loadState(selectedDate);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Unable to save worksheet metadata.',
			});
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="planner-shell">
			<div className="panel section teacher-banner">
				<p className="eyebrow">Teacher Planning Workspace</p>
				<h2 className="page-title">Local Development Only</h2>
				<p className="page-intro">
					Secure production access will be enabled after authentication is configured. This workspace writes lesson plans, calendar
					entries, and worksheet metadata to local D1 only.
				</p>
				{!plannerState.dbAvailable && (
					<p className="notice notice--warning">CLASS_DB is not available in this environment yet. The forms will still load, but saves will fail until the local database is applied.</p>
				)}
				{message && (
					<p className={`notice notice--${message.type}`} role="status">
						{message.text}
					</p>
				)}
			</div>

			<section className="planner-grid">
				<div className="planner-column">
					<section className="panel section planner-card">
						<div className="section-header">
							<div>
								<p className="eyebrow">Selected date</p>
								<h3>{selectedBaselineLabel}</h3>
							</div>
						</div>
						<label className="field">
							<span>Instructional date</span>
							<select
								value={selectedDate}
								onChange={async (event) => {
									const nextDate = event.target.value;
									setSelectedDate(nextDate);
									await loadState(nextDate);
								}}
								disabled={busy}
							>
								{instructionalDates.map((date) => {
									const label = dateFormatter.format(parseIsoDate(date));
									return (
										<option key={date} value={date}>
											{label}
										</option>
									);
								})}
							</select>
						</label>

						<div className="detail-grid planner-detail-grid">
							<div>
								<span className="meta">School week</span>
								<p>{plannerState.baseline.schoolWeek ? `Week ${plannerState.baseline.schoolWeek}` : 'Not assigned'}</p>
							</div>
							<div>
								<span className="meta">Instructional day</span>
								<p>{plannerState.baseline.instructionalDay ? `Yes · Day ${plannerState.baseline.schoolDayNumber}` : 'No'}</p>
							</div>
							<div>
								<span className="meta">CKLA</span>
								<p>
									{plannerState.baseline.cklaLabel
										? `${plannerState.baseline.cklaUnit ?? ''} ${plannerState.baseline.cklaLabel}`.trim()
										: 'No CKLA pacing'}
								</p>
							</div>
							<div>
								<span className="meta">Baseline note</span>
								<p>{plannerState.baseline.notes}</p>
							</div>
						</div>

						<div className="list-summary">
							<p className="fineprint">
								Existing lesson plan: {plannerState.lessonPlan ? plannerState.lessonPlan.publication_status : 'Not published yet'}
							</p>
							<p className="fineprint">Current calendar entries on this date: {plannerState.calendarEntries.length}</p>
							<p className="fineprint">Worksheet metadata records in D1: {plannerState.worksheets.length}</p>
						</div>
					</section>

					<section className="panel section planner-card">
						<div className="section-header">
							<div>
								<p className="eyebrow">Lesson plan</p>
								<h3>Edit or publish a daily plan</h3>
							</div>
						</div>
						<form className="planner-form" onSubmit={saveLessonPlan}>
							<div className="field-grid">
								<label className="field">
									<span>Lesson title</span>
									<input
										value={lessonDraft.title}
										onChange={(event) => setLessonDraft((current) => ({ ...current, title: event.target.value }))}
										placeholder="Reading lesson title"
										disabled={busy}
									/>
								</label>
								<label className="field">
									<span>Subject</span>
									<input
										value={lessonDraft.subject}
										onChange={(event) => setLessonDraft((current) => ({ ...current, subject: event.target.value }))}
										placeholder="Reading, math, writing, science..."
										disabled={busy}
									/>
								</label>
							</div>
							<label className="field">
								<span>Objectives</span>
								<textarea
									rows={3}
									value={lessonDraft.objectives}
									onChange={(event) => setLessonDraft((current) => ({ ...current, objectives: event.target.value }))}
									placeholder="Learning focus or objectives"
									disabled={busy}
								/>
							</label>
							<label className="field">
								<span>Lesson details</span>
								<textarea
									rows={5}
									value={lessonDraft.lesson_details}
									onChange={(event) => setLessonDraft((current) => ({ ...current, lesson_details: event.target.value }))}
									placeholder="Lesson sequence, teacher notes, links, or reminders"
									disabled={busy}
								/>
							</label>
							<div className="field-grid">
								<label className="field">
									<span>Homework</span>
									<textarea
										rows={3}
										value={lessonDraft.homework}
										onChange={(event) => setLessonDraft((current) => ({ ...current, homework: event.target.value }))}
										placeholder="Homework or family follow-up"
										disabled={busy}
									/>
								</label>
								<label className="field">
									<span>Teacher notes</span>
									<textarea
										rows={3}
										value={lessonDraft.notes}
										onChange={(event) => setLessonDraft((current) => ({ ...current, notes: event.target.value }))}
										placeholder="Internal notes for later use"
										disabled={busy}
									/>
								</label>
							</div>
							<div className="field-grid">
								<label className="field">
									<span>Publication status</span>
									<select
										value={lessonDraft.publication_status}
										onChange={(event) =>
											setLessonDraft((current) => ({
												...current,
												publication_status: event.target.value as LessonPlanPublicationStatus,
											}))
										}
										disabled={busy}
									>
										<option value="NotPublished">NotPublished</option>
										<option value="Published">Published</option>
									</select>
								</label>
								<div className="field field--static">
									<span>Date</span>
									<p>{dateFormatter.format(parseIsoDate(selectedDate))}</p>
								</div>
							</div>
							<button className="button primary" type="submit" disabled={busy}>
								Save lesson plan
							</button>
						</form>
					</section>
				</div>

				<div className="planner-column">
					<section className="panel section planner-card">
						<div className="section-header">
							<div>
								<p className="eyebrow">Calendar entries</p>
								<h3>Teacher-created reminders</h3>
							</div>
						</div>
						<form className="planner-form" onSubmit={saveCalendarEntry}>
							<div className="field-grid">
								<label className="field">
									<span>Title</span>
									<input
										value={calendarDraft.title}
										onChange={(event) => setCalendarDraft((current) => ({ ...current, title: event.target.value }))}
										placeholder="Reminder or event title"
										disabled={busy}
									/>
								</label>
								<label className="field">
									<span>Entry type</span>
									<select
										value={calendarDraft.entry_type}
										onChange={(event) =>
											setCalendarDraft((current) => ({
												...current,
												entry_type: event.target.value as CalendarEntryType,
											}))
										}
										disabled={busy}
									>
										<option value="classroom">Classroom</option>
										<option value="homework">Homework</option>
										<option value="reminder">Reminder</option>
										<option value="event">Event</option>
										<option value="field-trip">Field Trip</option>
										<option value="assessment">Assessment</option>
									</select>
								</label>
							</div>
							<label className="field">
								<span>Description</span>
								<textarea
									rows={4}
									value={calendarDraft.description}
									onChange={(event) => setCalendarDraft((current) => ({ ...current, description: event.target.value }))}
									placeholder="Short description or reminder detail"
									disabled={busy}
								/>
							</label>
							<div className="field-grid">
								<label className="field">
									<span>Publication status</span>
									<select
										value={calendarDraft.publication_status}
										onChange={(event) =>
											setCalendarDraft((current) => ({
												...current,
												publication_status: event.target.value as CalendarEntryPublicationStatus,
											}))
										}
										disabled={busy}
									>
										<option value="NotPublished">NotPublished</option>
										<option value="Published">Published</option>
									</select>
								</label>
								<div className="field field--static">
									<span>Selected date</span>
									<p>{dateFormatter.format(parseIsoDate(selectedDate))}</p>
								</div>
							</div>
							<div className="button-row">
								<button className="button primary" type="submit" disabled={busy}>
									{editingCalendarEntryId ? 'Update entry' : 'Save entry'}
								</button>
								{editingCalendarEntryId && (
									<button
										className="button secondary"
										type="button"
										disabled={busy}
										onClick={() => {
											setEditingCalendarEntryId(null);
											setCalendarDraft(toCalendarEntryDraft(null));
										}}
									>
										Cancel edit
									</button>
								)}
							</div>
						</form>

						<div className="record-list">
							{plannerState.calendarEntries.length === 0 && <p className="fineprint">No local calendar entries saved for this date yet.</p>}
							{plannerState.calendarEntries.map((entry) => (
								<article className="record-item" key={entry.id}>
									<div className="record-item__header">
										<div>
											<h4>{entry.title}</h4>
											<p className="fineprint">
												{entry.entry_type} · {entry.publication_status}
											</p>
										</div>
										<span className="meta neutral">ID {entry.id}</span>
									</div>
									<p>{entry.description}</p>
									<div className="record-actions">
										<button
											type="button"
											className="button secondary"
											disabled={busy}
											onClick={() => {
												setEditingCalendarEntryId(entry.id);
												setCalendarDraft(toCalendarEntryDraft(entry));
											}}
										>
											Edit
										</button>
										<button
											type="button"
											className="button secondary"
											disabled={busy}
											onClick={() => void deleteCalendarEntry(entry.id)}
										>
											Delete
										</button>
									</div>
								</article>
							))}
						</div>
					</section>

					<section className="panel section planner-card">
						<div className="section-header">
							<div>
								<p className="eyebrow">Worksheet metadata</p>
								<h3>Staged for private R2 files</h3>
							</div>
						</div>
						<p className="page-intro">
							This stores metadata only. Protected worksheet upload and download handling will be connected after authentication is
							implemented.
						</p>
						<form className="planner-form" onSubmit={saveWorksheet}>
							<div className="field-grid">
								<label className="field">
									<span>Title</span>
									<input
										value={worksheetDraft.title}
										onChange={(event) => setWorksheetDraft((current) => ({ ...current, title: event.target.value }))}
										placeholder="Worksheet title"
										disabled={busy}
									/>
								</label>
								<label className="field">
									<span>Subject</span>
									<input
										value={worksheetDraft.subject}
										onChange={(event) => setWorksheetDraft((current) => ({ ...current, subject: event.target.value }))}
										placeholder="Subject or domain"
										disabled={busy}
									/>
								</label>
							</div>
							<label className="field">
								<span>Description</span>
								<textarea
									rows={3}
									value={worksheetDraft.description}
									onChange={(event) => setWorksheetDraft((current) => ({ ...current, description: event.target.value }))}
									placeholder="Metadata description only"
									disabled={busy}
								/>
							</label>
							<div className="field-grid">
								<label className="field">
									<span>Associated date</span>
									<input
										value={worksheetDraft.date ?? ''}
										onChange={(event) => setWorksheetDraft((current) => ({ ...current, date: event.target.value || null }))}
										placeholder="YYYY-MM-DD"
										disabled={busy}
									/>
								</label>
								<label className="field">
									<span>Associated school week</span>
									<input
										value={worksheetDraft.school_week}
										onChange={(event) => setWorksheetDraft((current) => ({ ...current, school_week: event.target.value }))}
										placeholder="Optional week number"
										disabled={busy}
									/>
								</label>
							</div>
							<div className="field-grid">
								<label className="field">
									<span>CKLA unit</span>
									<input
										value={worksheetDraft.ckla_unit}
										onChange={(event) => setWorksheetDraft((current) => ({ ...current, ckla_unit: event.target.value }))}
										placeholder="Unit name or Pausing Point"
										disabled={busy}
									/>
								</label>
								<label className="field">
									<span>Filename</span>
									<input
										value={worksheetDraft.file_name}
										onChange={(event) => setWorksheetDraft((current) => ({ ...current, file_name: event.target.value }))}
										placeholder="file-name.pdf"
										disabled={busy}
									/>
								</label>
							</div>
							<label className="field">
								<span>Proposed R2 object key</span>
								<input
									value={worksheetDraft.r2_object_key}
									onChange={(event) => setWorksheetDraft((current) => ({ ...current, r2_object_key: event.target.value }))}
									placeholder="teacher-planner/..."
									disabled={busy}
								/>
							</label>
							<div className="field-grid">
								<label className="field">
									<span>Publication status</span>
									<select
										value={worksheetDraft.publication_status}
										onChange={(event) =>
											setWorksheetDraft((current) => ({
												...current,
												publication_status: event.target.value as WorksheetPublicationStatus,
											}))
										}
										disabled={busy}
									>
										<option value="NotPublished">NotPublished</option>
										<option value="Published">Published</option>
									</select>
								</label>
								<div className="field field--static">
									<span>Reference</span>
									<p>{shortDateFormatter.format(parseIsoDate(selectedDate))}</p>
								</div>
							</div>
							<button className="button primary" type="submit" disabled={busy}>
								Save metadata
							</button>
						</form>

						<div className="record-list">
							{plannerState.worksheets.length === 0 && <p className="fineprint">No worksheet metadata saved yet.</p>}
							{plannerState.worksheets.map((worksheet) => (
								<article className="record-item" key={worksheet.id}>
									<div className="record-item__header">
										<div>
											<h4>{worksheet.title}</h4>
											<p className="fineprint">
												{worksheet.subject || 'No subject'} · {worksheet.publication_status}
											</p>
										</div>
										<span className="meta neutral">{worksheet.file_name}</span>
									</div>
									<p>{worksheet.description || 'No description'}</p>
									<p className="fineprint">
										{worksheet.date ? worksheet.date : 'No date'} · {worksheet.school_week ?? 'No week'} · {worksheet.ckla_unit || 'No CKLA unit'}
									</p>
								</article>
							))}
						</div>
					</section>
				</div>
			</section>
		</div>
	);
}
