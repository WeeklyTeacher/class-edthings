// src/lib/calendar/baseline.ts
import {
	cklaPacing,
	schoolCalendarEntries,
	schoolWeeks,
	schoolYear,
} from '../../data/school-calendar-2026-2027';

export function parseIsoDate(date: string) {
	const [year, month, day] = date.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

export function formatIsoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

export function isSchoolYearDate(date: string) {
	return date >= schoolYear.startDate && date <= schoolYear.endDate;
}

export function getBaselineCalendarEntry(date: string) {
	return schoolCalendarEntries.find((entry) => entry.date === date) ?? null;
}

export function getSchoolWeekForDate(date: string) {
	return schoolWeeks.find((week) => date >= week.startDate && date <= week.endDate) ?? null;
}

export function getInstructionalDayNumberForDate(date: string) {
	return getBaselineCalendarEntry(date)?.schoolDayNumber ?? null;
}

export function getCklaPacingForInstructionalDay(instructionalDayNumber: number) {
	return (
		cklaPacing.find(
			(entry) =>
				instructionalDayNumber >= entry.instructionalDayStart &&
				instructionalDayNumber <= entry.instructionalDayEnd,
		) ?? null
	);
}

export function listInstructionalDates() {
	return schoolCalendarEntries.filter((entry) => entry.instructionalDay).map((entry) => entry.date);
}

export function getSchoolYearBounds() {
	return schoolYear;
}
