import { Rooms, Spares, User } from "../api"
import { For, JSX, Show } from "solid-js"
import { MenuViewer } from "../lib/MenuViewer"
import { match } from "ts-pattern"
import { addDays, format, startOfWeek } from "date-fns"
import { durationToMinute, parseISODuration } from "../util"
import { Dynamic } from "solid-js/web"

const tdStyle = {
	height: "20px",
	padding: "0",
}
const stickyThStyle: JSX.CSSProperties = {
	position: "sticky",
	left: "0",
	"z-index": "1",
	"box-shadow": "1px 0 0 #ccc",
	"border-left": "1px solid #ccc",
	...tdStyle
}
const stickyTdStyle = {
	background: "white",
	...stickyThStyle
}

const weekday_labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const blocks = ((begin_time, end_time) => {
	const blocks = []
	for (let i = begin_time; i < end_time; i += 30) {
		blocks.push(i)
	}
	return blocks
})(8 * 60, 22 * 60)

type SpareDisplay = {
	id: number
	stamp: number
	week: string
	begin_time: number
	end_time: number
	room: string
	assignee: {
		id: number
		username: string
	} | null
}

type SpareTdStyle = "Mine" | "Taken" | "Available"
const SpareInfoTd = (props: { spare: SpareDisplay, style: SpareTdStyle }) => {
	let color, tdText
	if (props.style === "Available") {
		color = "blue"
		tdText = "空闲"
	} else if (props.style === "Mine") {
		color = "green"
		tdText = props.spare.assignee?.username
	} else {
		color = "white"
		tdText = props.spare.assignee?.username
	}

	const rowSpan = Math.round((props.spare.end_time - props.spare.begin_time) / 30)

	return (
		<td class={color} style={tdStyle} rowspan={rowSpan}>
			{tdText}
		</td>
	)
}

type CalendarTableProps = {
	spares: Spares,
	base_week: Date,
	cell?: (props: { spare: SpareDisplay, current_user?: User }) => JSX.Element
}

export const SpareDefaultTd = (focus_user?: User) =>
	(props: { spare: SpareDisplay }) =>
		<SpareInfoTd spare={props.spare} style={
			match(props.spare.assignee)
				.with(null, () => "Available" as SpareTdStyle)
				.with({ id: focus_user?.id }, () => "Mine" as SpareTdStyle)
				.otherwise(() => "Taken" as SpareTdStyle)
		} />

const CalendarTable = (props: CalendarTableProps) => {
	const monday = startOfWeek(props.base_week, { weekStartsOn: 1 })
	const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

	const spares = props.spares.map(spare => ({
		...spare,
		begin_time: durationToMinute(parseISODuration(spare.begin_time)),
		end_time: durationToMinute(parseISODuration(spare.end_time)),
	}))

	const findMatched = (day: number, begin_time: number) => {
		return spares.find(spare =>
			spare.begin_time == day * 24 * 60 + begin_time
		)
	}
	const isCovered = (day: number, begin_time: number) => {
		return spares.some(spare =>
			spare.begin_time < day * 24 * 60 + begin_time &&
			spare.end_time > day * 24 * 60 + begin_time
		)
	}

	return (
		<div style="overflow-x: auto;">
			<table class="ui fixed small celled center aligned unstackable equal width table" style="min-width: 500px; border-left: none;">
				<thead>
					<tr>
						<th style={stickyThStyle}>时间</th>
						<For each={weekDates}>
							{(date, i) => (
								<th style={tdStyle}>
									{weekday_labels[i()]}
									<br />
									{format(date, "M-d")}
								</th>
							)}
						</For>
					</tr>
				</thead>
				<tbody>
					<For each={blocks}>
						{(block) => (
							<tr>
								<td style={stickyTdStyle}>
									<Show when={block % 60 === 0}>
										{Math.round(block / 60)}:00
									</Show>
								</td>
								<For each={weekDates}>
									{(date, i) => (
										<Show when={!isCovered(i(), block)}>
											{
												match(findMatched(i(), block))
													.with(undefined, () => <td style={tdStyle}></td>)
													.otherwise(spare => <Dynamic component={props.cell} spare={spare} />)
											}
										</Show>
									)}
								</For>
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</div>
	)
}

export type CalendarProps = {
	spares: Spares
	rooms: Rooms
	base_week: Date
	cell: (props: { spare: SpareDisplay }) => JSX.Element
}

export const Calendar = (props: CalendarProps) => (
	<Show when={props.rooms.length > 0}>
		<MenuViewer {...props.rooms.map(room => ({
			name: room,
			component: () => <CalendarTable
				spares={props.spares.filter(spare => spare.room == room)}
				base_week={props.base_week}
				cell={props.cell} />
		}))} />
	</Show>
)