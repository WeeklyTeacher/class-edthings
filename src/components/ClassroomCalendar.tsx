/* src/components/ClassroomCalendar.tsx */
import { useMemo, useState } from 'react';

import type {
	CalendarEntry,
	CKLAPacingItem,
	SchoolWeekRange,
} from '../data/school-calendar-2026-2027';

type CalendarData = {
	schoolYear: {
		label: string;
		startDate: string;
		endDate: string;
		fallInstructionalDays: number;
		springInstructionalDays: number;
	};
	schoolWeeks: SchoolWeekRange[];
	cklaPacing: CKLAPacingItem[];
	entries: CalendarEntry[];
};

type Props = {
	data: CalendarData;
};

const monthFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC',
});

const shortMonthDayFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC',
});

function parseDate(date: string) {
	const [year, month, day] = date.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount));
}

function startOfMonth(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function startOfWeek(date: Date) {
	const day = date.getUTCDay();
	const offset = (day + 6) % 7;
	return addDays(date, -offset);
}

function sameMonth(left: Date, right: Date) {
	return left.getUTCFullYear() === right.getUTCFullYear() && left.getUTCMonth() === right.getUTCMonth();
}

export default function ClassroomCalendar({ data }: Props) {
	const calendarEntries = data.entries;
	const calendarStartMonth = useMemo(
		() => startOfMonth(parseDate(data.schoolYear.startDate)),
		[data.schoolYear.startDate],
	);
	const calendarEndMonth = useMemo(() => startOfMonth(parseDate(data.schoolYear.endDate)), [data.schoolYear.endDate]);
	const calendarDisplayStart = calendarStartMonth;
	const calendarDisplayEnd = endOfMonth(calendarEndMonth);
	const [selectedMonth, setSelectedMonth] = useState(() => calendarStartMonth);
	const [selectedDateKey, setSelectedDateKey] = useState(data.schoolYear.startDate);

	const selectedEntry = useMemo(
		() => calendarEntries.find((entry) => entry.date === selectedDateKey) ?? calendarEntries[0],
		[calendarEntries, selectedDateKey],
	);

	const visibleGrid = useMemo(() => {
		const firstOfMonth = startOfMonth(selectedMonth);
		const lastOfMonth = endOfMonth(selectedMonth);
		const gridStart = startOfWeek(firstOfMonth);
		const gridEnd = addDays(startOfWeek(lastOfMonth), 6);
		const days: Date[] = [];
		let current = gridStart;

		while (current <= gridEnd) {
			days.push(current);
			current = addDays(current, 1);
		}

		return days;
	}, [selectedMonth]);

	const selectedMonthEntries = useMemo(() => {
		const monthEntries = calendarEntries.filter((entry) => {
			const entryDate = parseDate(entry.date);
			return sameMonth(entryDate, selectedMonth);
		});

		const summaries = new Map<
			string,
			{ key: string; order: number; title: string; detail: string; tone: string }
		>();

		for (const entry of monthEntries) {
			if (entry.eventType === 'holiday' || entry.eventType === 'recess') {
				summaries.set(entry.date, {
					key: entry.date,
					order: parseDate(entry.date).getTime(),
					title: entry.title,
					detail: `${shortMonthDayFormatter.format(parseDate(entry.date))} · ${entry.notes}`,
					tone: entry.eventType,
				});
			}
		}

		for (const week of data.schoolWeeks) {
			const weekStart = parseDate(week.startDate);
			const weekEnd = parseDate(week.endDate);
			const overlapsMonth = weekStart <= endOfMonth(selectedMonth) && weekEnd >= startOfMonth(selectedMonth);
			if (overlapsMonth) {
				summaries.set(`week-${week.week}`, {
					key: `week-${week.week}`,
					order: weekStart.getTime(),
					title: `School Week ${week.week}`,
					detail: `${shortMonthDayFormatter.format(parseDate(week.startDate))} to ${shortMonthDayFormatter.format(
						parseDate(week.endDate),
					)} · ${week.instructionalDays} instructional days`,
					tone: 'week',
				});
			}
		}

		for (const pacing of data.cklaPacing) {
			const pacingStart = parseDate(pacing.startDate);
			const pacingEnd = parseDate(pacing.endDate);
			const overlapsMonth =
				(pacingStart >= startOfMonth(selectedMonth) && pacingStart <= endOfMonth(selectedMonth)) ||
				(pacingEnd >= startOfMonth(selectedMonth) && pacingEnd <= endOfMonth(selectedMonth));

			if (overlapsMonth) {
				summaries.set(`${pacing.kind}-${pacing.instructionalDayStart}`, {
					key: `${pacing.kind}-${pacing.instructionalDayStart}`,
					order: pacingStart.getTime(),
					title: pacing.kind === 'pausing-point' ? 'Pausing Point' : pacing.unit ?? 'CKLA Unit',
					detail: `${pacing.label} · ${shortMonthDayFormatter.format(pacingStart)} to ${shortMonthDayFormatter.format(
						pacingEnd,
					)}`,
					tone: pacing.kind,
				});
			}
		}

		return Array.from(summaries.values()).sort((left, right) => left.order - right.order);
	}, [calendarEntries, data.cklaPacing, data.schoolWeeks, selectedMonth]);

	const monthLabel = monthFormatter.format(selectedMonth);
	const selectedWeek = selectedEntry?.schoolWeek
		? data.schoolWeeks.find((week) => week.week === selectedEntry.schoolWeek) ?? null
		: null;
	const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	function updateMonth(amount: number) {
		setSelectedMonth((current) => {
			const next = startOfMonth(addDays(current, amount * 32));
			if (next < calendarStartMonth) {
				return calendarStartMonth;
			}
			if (next > calendarEndMonth) {
				return calendarEndMonth;
			}
			return next;
		});
	}

	function selectDate(date: Date) {
		const key = toDateKey(date);
		setSelectedDateKey(key);
		setSelectedMonth(startOfMonth(date));
	}

	return (
		<div className="calendar-layout">
			<section className="panel section calendar-panel">
				<div className="calendar-header">
						<div>
							<p className="eyebrow">Calendar</p>
							<h2 className="page-title">{monthLabel}</h2>
							<p className="page-intro">
								Use the month view to check school days, holidays, CKLA pacing, and school-week timing for Mr. Sayers&apos;
								3rd Grade Class.
							</p>
						</div>
					<div className="calendar-nav" aria-label="Month navigation">
						<button type="button" onClick={() => updateMonth(-1)} disabled={selectedMonth <= calendarStartMonth}>
							Previous month
						</button>
						<button type="button" onClick={() => updateMonth(1)} disabled={selectedMonth >= calendarEndMonth}>
							Next month
						</button>
					</div>
				</div>

				<div className="calendar-grid-shell">
					<div className="calendar-weekdays" aria-hidden="true">
						{weekdayLabels.map((weekday) => (
							<span key={weekday}>{weekday}</span>
						))}
					</div>
					<div className="calendar-grid" role="grid" aria-label={`${monthLabel} calendar`}>
						{visibleGrid.map((date) => {
							const key = toDateKey(date);
							const entry = calendarEntries.find((item) => item.date === key);
							const isCurrentMonth = sameMonth(date, selectedMonth);
							const isSelectable = date >= calendarDisplayStart && date <= calendarDisplayEnd;
							const isSelected = selectedDateKey === key;
							const badge =
								entry?.eventType === 'holiday'
									? 'No school'
									: entry?.eventType === 'recess'
										? 'Recess'
										: entry?.eventType === 'milestone' && entry.cklaUnit
											? entry.cklaUnit
											: entry?.eventType === 'milestone' && entry.title === 'Pausing Point'
												? 'Pausing Point'
												: entry?.instructionalDay
											? entry.cklaUnit ?? 'Instruction'
												: entry?.title ?? '';

							return (
								<button
									key={key}
									type="button"
									className={[
										'calendar-day',
										isCurrentMonth ? '' : 'calendar-day--outside',
										entry?.eventType === 'holiday' ? 'calendar-day--holiday' : '',
										entry?.eventType === 'recess' ? 'calendar-day--recess' : '',
										entry?.instructionalDay ? 'calendar-day--instruction' : '',
										isSelected ? 'calendar-day--selected' : '',
									]
										.filter(Boolean)
										.join(' ')}
									disabled={!isSelectable}
									onClick={() => selectDate(date)}
									aria-pressed={isSelected}
									aria-label={`${longDateFormatter.format(date)}${
										entry
											? `, ${entry.instructionalDay ? 'instructional day' : entry.title}${entry.schoolWeek ? `, school week ${entry.schoolWeek}` : ''}`
											: ''
									}`}
								>
									<span className="calendar-day-number">{date.getUTCDate()}</span>
									<span className="calendar-day-flag">{badge}</span>
									{entry?.eventType === 'holiday' && <span className="calendar-day-note">No school</span>}
									{entry?.eventType === 'recess' && <span className="calendar-day-note">Break</span>}
									{entry?.instructionalDay && entry.cklaUnit && (
										<span className="calendar-day-note">{entry.cklaLabel}</span>
									)}
								</button>
							);
						})}
					</div>
				</div>
			</section>

			<aside className="calendar-sidebar">
				<section className="panel section calendar-panel">
					<div className="section-header">
						<div>
							<p className="eyebrow">Task / pacing chart</p>
							<h3>Selected month at a glance</h3>
						</div>
					</div>
					<ul className="timeline-list">
						{selectedMonthEntries.map((entry) => (
							<li className={`timeline-item timeline-item--${entry.tone}`} key={entry.key}>
								<h4>{entry.title}</h4>
								<p>{entry.detail}</p>
							</li>
						))}
					</ul>
				</section>

				<section className="panel section calendar-panel">
					<div className="section-header">
						<div>
							<p className="eyebrow">Selected day</p>
							<h3>{selectedEntry ? longDateFormatter.format(parseDate(selectedEntry.date)) : 'Choose a day'}</h3>
						</div>
					</div>
					<div className="detail-grid">
						<div>
							<span className="meta">School week</span>
							<p>{selectedWeek ? `Week ${selectedWeek.week}` : 'Not assigned'}</p>
						</div>
						<div>
							<span className="meta">Instructional day</span>
							<p>{selectedEntry?.instructionalDay ? `Yes · Day ${selectedEntry.schoolDayNumber}` : 'No'}</p>
						</div>
						<div>
							<span className="meta">CKLA</span>
							<p>
								{selectedEntry?.cklaLabel ||
									(selectedEntry?.instructionalDay ? 'CKLA pacing will appear here.' : selectedEntry?.title ?? 'No pacing')}
							</p>
						</div>
						<div>
							<span className="meta">Lesson plans</span>
							<p>
								{selectedEntry?.instructionalDay
									? 'Lesson-plan details will be shared later through the future family portal.'
									: selectedEntry?.notes || 'No lesson-plan details for this date.'}
							</p>
						</div>
					</div>
					<p className="fineprint">Family portal updates will appear after secure family sign-in is enabled.</p>
				</section>

				<section className="panel section calendar-panel">
					<div className="section-header">
						<div>
							<p className="eyebrow">Legend</p>
							<h3>What the colors mean</h3>
						</div>
					</div>
					<div className="legend">
						<span className="legend-item legend-item--instruction">Instructional Day</span>
						<span className="legend-item legend-item--holiday">Holiday / No School</span>
						<span className="legend-item legend-item--recess">Recess</span>
						<span className="legend-item legend-item--milestone">CKLA Unit / Pausing Point</span>
					</div>
				</section>

			</aside>
		</div>
	);
}
