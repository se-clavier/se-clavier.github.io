export function parseISODurationToMinutes(duration: string): number {
	const regex = /^P(?:([\d.]+)Y)?(?:([\d.]+)M)?(?:([\d.]+)W)?(?:([\d.]+)D)?(?:T(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?)?$/

	const match = duration.match(regex)
	if (!match) throw new Error("Invalid ISO 8601 duration")

	const [, , , , d, h, m,] = match
	return (
		(parseFloat(d) || 0) * 24 * 60 +
		(parseFloat(h) || 0) * 60 +
		(parseFloat(m) || 0)
	)
}
