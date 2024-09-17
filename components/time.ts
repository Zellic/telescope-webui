interface TimeUnit {
	unit: string;
	seconds: number;
}

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_MONTH = 30;
const MONTHS_IN_YEAR = 12;

const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
const SECONDS_IN_MONTH = SECONDS_IN_DAY * DAYS_IN_MONTH;
const SECONDS_IN_YEAR = SECONDS_IN_MONTH * MONTHS_IN_YEAR;

const TIME_UNITS: TimeUnit[] = [
	{ unit: "year", seconds: SECONDS_IN_YEAR },
	{ unit: "month", seconds: SECONDS_IN_MONTH },
	{ unit: "day", seconds: SECONDS_IN_DAY },
	{ unit: "hour", seconds: SECONDS_IN_HOUR },
	{ unit: "minute", seconds: SECONDS_IN_MINUTE },
	{ unit: "second", seconds: 1 }
];

export function formatDuration(seconds: number): string {
	for (const { unit, seconds: unitSeconds } of TIME_UNITS) {
		if (seconds >= unitSeconds) {
			const count = Math.floor(seconds / unitSeconds);
			return `${count} ${unit}${count !== 1 ? "s" : ""}`;
		}
	}

	return "0 seconds";
}

export function getElapsedTime(timestamp: number): string {
	const currentTime = Math.floor(Date.now() / 1000);
	const elapsedSeconds = currentTime - timestamp;
	return formatDuration(elapsedSeconds);
}