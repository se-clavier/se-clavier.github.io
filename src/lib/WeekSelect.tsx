import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns"
import { Accessor, JSX, Setter, splitProps } from "solid-js"

// date-fns: format week into [YYYY-MM-DD]-[YYYY-MM-DD]
const week_display = (week: Date) => {
	const start_date = startOfWeek(week, { weekStartsOn: 1 })
	const end_date = endOfWeek(week, { weekStartsOn: 1 })
	return `${format(start_date, "yyyy-MM-dd")} - ${format(end_date, "yyyy-MM-dd")}`
}

export const WeekSelect = (props: {
	get: Accessor<Date>
	set: Setter<Date>
} & JSX.HTMLAttributes<HTMLDivElement>) => {
	const [local, rest] = splitProps(props, ["get", "set"])

	return (
		<div class="ui buttons">
			<button class="ui icon button" onClick={() => local.set(week => subWeeks(week, 1))}>
				<i class="left chevron icon" />
			</button>
			<div class="ui basic button" {...rest}>
				{week_display(local.get())}
			</div>
			<button class="ui icon button" onClick={() => local.set(week => addWeeks(week, 1))}>
				<i class="right chevron icon" />
			</button>
		</div>
	)
}