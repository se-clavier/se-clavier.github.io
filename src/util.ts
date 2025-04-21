import { Accessor, createSignal, Setter } from "solid-js"

export class Signal<T> {
	get: Accessor<T>;
	set: Setter<T>;
	constructor(init: T) {
		[this.get, this.set] = createSignal<T>(init)
	}
}
export function parseISODurationToMinutes(duration: string): number {
	const regex = /^P(?:([\d.]+)Y)?(?:([\d.]+)M)?(?:([\d.]+)W)?(?:([\d.]+)D)?(?:T(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?)?$/

	const match = regex.exec(duration)
	if (!match) throw new Error("Invalid ISO 8601 duration")

	const [, , , , d, h, m,] = match
	return (
		(parseFloat(d) || 0) * 24 * 60 +
		(parseFloat(h) || 0) * 60 +
		(parseFloat(m) || 0)
	)
}
