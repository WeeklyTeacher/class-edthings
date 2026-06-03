// src/lib/teacher-planner-state.ts
import { getBaselineCalendarEntry, getCklaPacingForInstructionalDay, getInstructionalDayNumberForDate, getSchoolWeekForDate, getSchoolYearBounds, isSchoolYearDate } from './calendar/baseline';
import { getCalendarEntriesForDate } from './db/calendar-entries';
import { getClassroomDb } from './db/classroom-db';
import { getLessonPlanByDate } from './db/lesson-plans';
import { listWorksheetMetadata } from './db/worksheets';

export interface PlannerBaselineInfo {
	date: string;
	title: string;
	instructionalDay: boolean;
	schoolWeek: number | null;
	schoolDayNumber: number | null;
	cklaUnit: string | null;
	cklaLabel: string | null;
	notes: string;
	lessonPlanStatus: 'Published' | 'NotPublished' | null;
}

export interface PlannerState {
	dbAvailable: boolean;
	selectedDate: string;
	schoolYear: ReturnType<typeof getSchoolYearBounds>;
	baseline: PlannerBaselineInfo;
	lessonPlan: Awaited<ReturnType<typeof getLessonPlanByDate>>;
	calendarEntries: Awaited<ReturnType<typeof getCalendarEntriesForDate>>;
	worksheets: Awaited<ReturnType<typeof listWorksheetMetadata>>;
}

function buildBaselineInfo(date: string): PlannerBaselineInfo {
	const baseline = getBaselineCalendarEntry(date);
	const schoolWeek = getSchoolWeekForDate(date);
	const instructionalDayNumber = getInstructionalDayNumberForDate(date);
	const pacing = instructionalDayNumber ? getCklaPacingForInstructionalDay(instructionalDayNumber) : null;

	return {
		date,
		title: baseline?.title ?? 'No school',
		instructionalDay: baseline?.instructionalDay ?? false,
		schoolWeek: schoolWeek?.week ?? null,
		schoolDayNumber: instructionalDayNumber,
		cklaUnit: baseline?.cklaUnit ?? pacing?.unit ?? null,
		cklaLabel: baseline?.cklaLabel ?? pacing?.label ?? null,
		notes: baseline?.notes ?? 'No lesson plan details available for this date.',
		lessonPlanStatus: baseline?.lessonPlanStatus ?? null,
	};
}

export async function buildPlannerState(locals: App.Locals | null | undefined, selectedDate: string): Promise<PlannerState> {
	const schoolYear = getSchoolYearBounds();
	const normalizedDate = isSchoolYearDate(selectedDate) ? selectedDate : schoolYear.startDate;
	const db = getClassroomDb(locals ?? null);

	const [lessonPlan, calendarEntries, worksheets] = await Promise.all([
		getLessonPlanByDate(db, normalizedDate),
		getCalendarEntriesForDate(db, normalizedDate),
		listWorksheetMetadata(db),
	]);

	return {
		dbAvailable: Boolean(db),
		selectedDate: normalizedDate,
		schoolYear,
		baseline: buildBaselineInfo(normalizedDate),
		lessonPlan,
		calendarEntries,
		worksheets,
	};
}
