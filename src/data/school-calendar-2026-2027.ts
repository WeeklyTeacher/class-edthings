// src/data/school-calendar-2026-2027.ts
export type CalendarEventType = 'instruction' | 'holiday' | 'recess' | 'unassigned' | 'milestone';

export type CalendarLessonPlanStatus = 'Published' | 'NotPublished';

export interface CalendarEntry {
	date: string;
	instructionalDay: boolean;
	schoolWeek: number | null;
	schoolDayNumber: number | null;
	eventType: CalendarEventType;
	title: string;
	cklaUnit: string | null;
	cklaLabel: string | null;
	notes: string;
	lessonPlanStatus: CalendarLessonPlanStatus | null;
}

export interface SchoolWeekRange {
	week: number;
	startDate: string;
	endDate: string;
	instructionalDays: number;
}

export interface CKLAPacingItem {
	kind: 'unit' | 'pausing-point';
	unit: string | null;
	label: string;
	title: string;
	instructionalDayStart: number;
	instructionalDayEnd: number;
	startDate: string;
	endDate: string;
}

export interface SpecialDateRange {
	eventType: Exclude<CalendarEventType, 'instruction'>;
	title: string;
	startDate: string;
	endDate: string;
	notes: string;
}

export const schoolYear = {
	label: '2026-2027',
	startDate: '2026-08-12',
	endDate: '2027-06-04',
	fallInstructionalDays: 84,
	springInstructionalDays: 96,
};

export const teacherPlanningNote =
	'Teacher planning note: the original CKLA pacing chart contains one more pacing slot than the 180-day LAUSD instructional calendar, so the final Ecology pacing may use one flex or combined lesson day.';

export const schoolWeeks: SchoolWeekRange[] = [
	{ week: 1, startDate: '2026-08-10', endDate: '2026-08-14', instructionalDays: 3 },
	{ week: 2, startDate: '2026-08-17', endDate: '2026-08-21', instructionalDays: 5 },
	{ week: 3, startDate: '2026-08-24', endDate: '2026-08-28', instructionalDays: 5 },
	{ week: 4, startDate: '2026-08-31', endDate: '2026-09-04', instructionalDays: 4 },
	{ week: 5, startDate: '2026-09-07', endDate: '2026-09-11', instructionalDays: 4 },
	{ week: 6, startDate: '2026-09-14', endDate: '2026-09-18', instructionalDays: 5 },
	{ week: 7, startDate: '2026-09-21', endDate: '2026-09-25', instructionalDays: 4 },
	{ week: 8, startDate: '2026-09-28', endDate: '2026-10-02', instructionalDays: 5 },
	{ week: 9, startDate: '2026-10-05', endDate: '2026-10-09', instructionalDays: 5 },
	{ week: 10, startDate: '2026-10-12', endDate: '2026-10-16', instructionalDays: 5 },
	{ week: 11, startDate: '2026-10-19', endDate: '2026-10-23', instructionalDays: 5 },
	{ week: 12, startDate: '2026-10-26', endDate: '2026-10-30', instructionalDays: 5 },
	{ week: 13, startDate: '2026-11-02', endDate: '2026-11-06', instructionalDays: 5 },
	{ week: 14, startDate: '2026-11-09', endDate: '2026-11-13', instructionalDays: 4 },
	{ week: 15, startDate: '2026-11-16', endDate: '2026-11-20', instructionalDays: 5 },
	{ week: 16, startDate: '2026-11-30', endDate: '2026-12-04', instructionalDays: 5 },
	{ week: 17, startDate: '2026-12-07', endDate: '2026-12-11', instructionalDays: 5 },
	{ week: 18, startDate: '2026-12-14', endDate: '2026-12-18', instructionalDays: 5 },
	{ week: 19, startDate: '2027-01-11', endDate: '2027-01-15', instructionalDays: 5 },
	{ week: 20, startDate: '2027-01-18', endDate: '2027-01-22', instructionalDays: 4 },
	{ week: 21, startDate: '2027-01-25', endDate: '2027-01-29', instructionalDays: 5 },
	{ week: 22, startDate: '2027-02-01', endDate: '2027-02-05', instructionalDays: 5 },
	{ week: 23, startDate: '2027-02-08', endDate: '2027-02-12', instructionalDays: 5 },
	{ week: 24, startDate: '2027-02-15', endDate: '2027-02-19', instructionalDays: 4 },
	{ week: 25, startDate: '2027-02-22', endDate: '2027-02-26', instructionalDays: 5 },
	{ week: 26, startDate: '2027-03-01', endDate: '2027-03-05', instructionalDays: 5 },
	{ week: 27, startDate: '2027-03-08', endDate: '2027-03-12', instructionalDays: 5 },
	{ week: 28, startDate: '2027-03-15', endDate: '2027-03-19', instructionalDays: 5 },
	{ week: 29, startDate: '2027-03-29', endDate: '2027-04-02', instructionalDays: 4 },
	{ week: 30, startDate: '2027-04-05', endDate: '2027-04-09', instructionalDays: 5 },
	{ week: 31, startDate: '2027-04-12', endDate: '2027-04-16', instructionalDays: 5 },
	{ week: 32, startDate: '2027-04-19', endDate: '2027-04-23', instructionalDays: 5 },
	{ week: 33, startDate: '2027-04-26', endDate: '2027-04-30', instructionalDays: 5 },
	{ week: 34, startDate: '2027-05-03', endDate: '2027-05-07', instructionalDays: 5 },
	{ week: 35, startDate: '2027-05-10', endDate: '2027-05-14', instructionalDays: 5 },
	{ week: 36, startDate: '2027-05-17', endDate: '2027-05-21', instructionalDays: 5 },
	{ week: 37, startDate: '2027-05-24', endDate: '2027-05-28', instructionalDays: 5 },
	{ week: 38, startDate: '2027-05-31', endDate: '2027-06-04', instructionalDays: 4 },
];

export const cklaPacing: CKLAPacingItem[] = [
	{
		kind: 'unit',
		unit: 'Unit 1',
		label: 'Classic Tales',
		title: 'The Wind in the Willows',
		instructionalDayStart: 1,
		instructionalDayEnd: 15,
		startDate: '2026-08-12',
		endDate: '2026-09-01',
	},
	{
		kind: 'unit',
		unit: 'Unit 2',
		label: 'Animal Classification',
		title: 'Classifying Living Things',
		instructionalDayStart: 16,
		instructionalDayEnd: 30,
		startDate: '2026-09-02',
		endDate: '2026-09-25',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 31,
		instructionalDayEnd: 31,
		startDate: '2026-09-28',
		endDate: '2026-09-28',
	},
	{
		kind: 'unit',
		unit: 'Unit 3',
		label: 'The Human Body',
		title: 'Systems and Senses',
		instructionalDayStart: 32,
		instructionalDayEnd: 45,
		startDate: '2026-09-29',
		endDate: '2026-10-16',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 46,
		instructionalDayEnd: 46,
		startDate: '2026-10-19',
		endDate: '2026-10-19',
	},
	{
		kind: 'unit',
		unit: 'Unit 4',
		label: 'Ancient Roman Civilization',
		title: 'The Ancient Roman Civilization',
		instructionalDayStart: 47,
		instructionalDayEnd: 63,
		startDate: '2026-10-20',
		endDate: '2026-11-12',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 64,
		instructionalDayEnd: 65,
		startDate: '2026-11-13',
		endDate: '2026-11-16',
	},
	{
		kind: 'unit',
		unit: 'Unit 5',
		label: 'Light and Sound',
		title: 'Light and Sound',
		instructionalDayStart: 66,
		instructionalDayEnd: 83,
		startDate: '2026-11-17',
		endDate: '2026-12-17',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 84,
		instructionalDayEnd: 85,
		startDate: '2026-12-18',
		endDate: '2027-01-11',
	},
	{
		kind: 'unit',
		unit: 'Unit 6',
		label: 'The Viking Age',
		title: 'Quest',
		instructionalDayStart: 86,
		instructionalDayEnd: 95,
		startDate: '2027-01-12',
		endDate: '2027-01-26',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 96,
		instructionalDayEnd: 96,
		startDate: '2027-01-27',
		endDate: '2027-01-27',
	},
	{
		kind: 'unit',
		unit: 'Unit 7',
		label: 'Astronomy',
		title: 'Our Solar System and Beyond',
		instructionalDayStart: 97,
		instructionalDayEnd: 116,
		startDate: '2027-01-28',
		endDate: '2027-02-25',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 117,
		instructionalDayEnd: 119,
		startDate: '2027-02-26',
		endDate: '2027-03-02',
	},
	{
		kind: 'unit',
		unit: 'Unit 8',
		label: 'Native Americans',
		title: 'Regions and Cultures',
		instructionalDayStart: 120,
		instructionalDayEnd: 132,
		startDate: '2027-03-03',
		endDate: '2027-03-19',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 133,
		instructionalDayEnd: 135,
		startDate: '2027-03-29',
		endDate: '2027-04-01',
	},
	{
		kind: 'unit',
		unit: 'Unit 9',
		label: 'Early Explorations',
		title: 'Early Explorations of North America',
		instructionalDayStart: 136,
		instructionalDayEnd: 148,
		startDate: '2027-04-02',
		endDate: '2027-04-20',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 149,
		instructionalDayEnd: 150,
		startDate: '2027-04-21',
		endDate: '2027-04-22',
	},
	{
		kind: 'unit',
		unit: 'Unit 10',
		label: 'Colonial America',
		title: 'Colonial America',
		instructionalDayStart: 151,
		instructionalDayEnd: 166,
		startDate: '2027-04-23',
		endDate: '2027-05-14',
	},
	{
		kind: 'pausing-point',
		unit: null,
		label: 'Pausing Point',
		title: 'Review and Checkpoint',
		instructionalDayStart: 167,
		instructionalDayEnd: 170,
		startDate: '2027-05-17',
		endDate: '2027-05-20',
	},
	{
		kind: 'unit',
		unit: 'Unit 11',
		label: 'Ecology',
		title: 'Ecology',
		instructionalDayStart: 171,
		instructionalDayEnd: 180,
		startDate: '2027-05-21',
		endDate: '2027-06-04',
	},
];

export const specialDateRanges: SpecialDateRange[] = [
	{ eventType: 'holiday', title: 'Admission Day', startDate: '2026-09-04', endDate: '2026-09-04', notes: 'No school' },
	{ eventType: 'holiday', title: 'Labor Day', startDate: '2026-09-07', endDate: '2026-09-07', notes: 'No school' },
	{ eventType: 'holiday', title: 'Unassigned Day', startDate: '2026-09-21', endDate: '2026-09-21', notes: 'No school' },
	{ eventType: 'holiday', title: 'Veterans Day', startDate: '2026-11-11', endDate: '2026-11-11', notes: 'No school' },
	{ eventType: 'recess', title: 'Thanksgiving Week', startDate: '2026-11-23', endDate: '2026-11-27', notes: 'No school' },
	{ eventType: 'recess', title: 'Winter Recess', startDate: '2026-12-21', endDate: '2027-01-08', notes: 'No school' },
	{ eventType: 'holiday', title: 'Martin Luther King Jr. Day', startDate: '2027-01-18', endDate: '2027-01-18', notes: 'No school' },
	{ eventType: 'holiday', title: 'Presidents Day', startDate: '2027-02-15', endDate: '2027-02-15', notes: 'No school' },
	{ eventType: 'recess', title: 'Spring Recess', startDate: '2027-03-22', endDate: '2027-03-26', notes: 'No school' },
	{ eventType: 'holiday', title: 'Cesar E. Chavez Birthday', startDate: '2027-03-31', endDate: '2027-03-31', notes: 'No school' },
	{ eventType: 'holiday', title: 'Memorial Day', startDate: '2027-05-31', endDate: '2027-05-31', notes: 'No school' },
];

function parseDate(date: string) {
	const [year, month, day] = date.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

function isBetween(date: string, startDate: string, endDate: string) {
	return date >= startDate && date <= endDate;
}

function getSpecialDate(date: string) {
	return specialDateRanges.find((entry) => isBetween(date, entry.startDate, entry.endDate));
}

function getSchoolWeek(date: string) {
	return schoolWeeks.find((entry) => isBetween(date, entry.startDate, entry.endDate)) ?? null;
}

function getPacingForInstructionalDay(instructionalDayNumber: number) {
	return cklaPacing.find(
		(entry) =>
			instructionalDayNumber >= entry.instructionalDayStart && instructionalDayNumber <= entry.instructionalDayEnd,
	) ?? null;
}

function isWeekend(date: Date) {
	const day = date.getUTCDay();
	return day === 0 || day === 6;
}

export function buildSchoolCalendarEntries() {
	const entries: CalendarEntry[] = [];
	let instructionalDayNumber = 0;
	let currentDate = parseDate('2026-08-01');
	const endDate = parseDate('2027-06-30');

	while (currentDate <= endDate) {
		const dateString = formatDate(currentDate);
		const schoolWeek = getSchoolWeek(dateString);
		const specialDate = getSpecialDate(dateString);
		const weekend = isWeekend(currentDate);
		const withinSchoolYear = dateString >= schoolYear.startDate && dateString <= schoolYear.endDate;
		const instructionalDay = withinSchoolYear && !specialDate && !weekend;

		let eventType: CalendarEventType = 'unassigned';
		let title = weekend ? 'Weekend' : 'No school';
		let cklaUnit: string | null = null;
		let cklaLabel: string | null = null;
		let notes = weekend ? 'Weekend' : 'No instructional day';
		let lessonPlanStatus: CalendarLessonPlanStatus | null = null;
		let schoolDayNumber: number | null = null;

		if (specialDate) {
			eventType = specialDate.eventType;
			title = specialDate.title;
			notes = specialDate.notes;
		} else if (instructionalDay) {
			instructionalDayNumber += 1;
			schoolDayNumber = instructionalDayNumber;
			const pacing = getPacingForInstructionalDay(instructionalDayNumber);
			if (pacing) {
				eventType = pacing.kind === 'pausing-point' ? 'milestone' : 'instruction';
				title = pacing.kind === 'pausing-point' ? 'Pausing Point' : pacing.title;
				cklaUnit = pacing.unit;
				cklaLabel = pacing.kind === 'pausing-point' ? pacing.label : `${pacing.unit}: ${pacing.label}`;
				notes = pacing.kind === 'pausing-point' ? 'CKLA review checkpoint' : `${pacing.title} pacing in progress`;
			} else {
				eventType = 'milestone';
				title = 'Instructional Day';
				notes = 'Lesson plan details will be added here.';
			}
			lessonPlanStatus = 'NotPublished';
		} else if (withinSchoolYear) {
			title = 'No school';
			notes = 'No instructional day';
		} else if (dateString < schoolYear.startDate) {
			title = 'Before school starts';
			notes = 'Summer break';
		} else if (dateString > schoolYear.endDate) {
			title = 'Summer break';
			notes = 'No school';
		}

		entries.push({
			date: dateString,
			instructionalDay,
			schoolWeek: schoolWeek?.week ?? null,
			schoolDayNumber,
			eventType,
			title,
			cklaUnit,
			cklaLabel,
			notes,
			lessonPlanStatus,
		});

		currentDate = new Date(Date.UTC(
			currentDate.getUTCFullYear(),
			currentDate.getUTCMonth(),
			currentDate.getUTCDate() + 1,
		));
	}

	return entries;
}

export const schoolCalendarEntries = buildSchoolCalendarEntries();

export const schoolCalendarData = {
	schoolYear,
	teacherPlanningNote,
	schoolWeeks,
	cklaPacing,
	entries: schoolCalendarEntries,
};
