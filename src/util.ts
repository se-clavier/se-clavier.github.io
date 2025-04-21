import { add, Duration, parseISO } from "date-fns"
import { Spare } from "../api"
import { Accessor, createSignal, Setter } from "solid-js"

export class Signal<T> {
	get: Accessor<T>;
	set: Setter<T>;
	constructor(init: T) {
		[this.get, this.set] = createSignal<T>(init)
	}
}

export function parseISODuration(duration: string): Duration {
	const pattern = /^P(?:([\d.]+)Y)?(?:([\d.]+)M)?(?:([\d.]+)W)?(?:([\d.]+)D)?(?:T(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?)?$/
	const match = pattern.exec(duration)
	if (!match) throw new Error("Invalid ISO 8601 duration")
	const [, years, months, weeks, days, hours, minutes, seconds] = match
	return {
		years: parseInt(years) || 0,
		months: parseInt(months) || 0,
		weeks: parseInt(weeks) || 0,
		days: parseInt(days) || 0,
		hours: parseInt(hours) || 0,
		minutes: parseInt(minutes) || 0,
		seconds: parseInt(seconds) || 0,
	}
}

export function durationToMinute(duration: Duration): number {
	return (duration.years ?? 0) * 365 * 24 * 60 +
		(duration.months ?? 0) * 30 * 24 * 60 +
		(duration.weeks ?? 0) * 7 * 24 * 60 +
		(duration.days ?? 0) * 24 * 60 +
		(duration.hours ?? 0) * 60 +
		(duration.minutes ?? 0)
}

export const spare_start_time = (spare: Spare) =>
	add(parseISO(spare.week), parseISODuration(spare.begin_time))
export const spare_end_time = (spare: Spare) =>
	add(parseISO(spare.week), parseISODuration(spare.end_time))