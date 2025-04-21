import { Component, createResource, createSignal, For, JSXElement, onMount, Show } from "solid-js"
import { db } from "../db"
import { match } from "ts-pattern"
import { Spare, Spares, User } from "../api"
import { Loader } from "../lib/common"
import { addDays, addMinutes, format, formatDate, getISOWeek, getISOWeekYear, parseISO } from "date-fns"
import { zhCN } from  "date-fns/locale"
import { MenuViewer } from "../lib/MenuViewer"

const year = getISOWeekYear(Date.now())
const [week, set_week] = createSignal(getISOWeek(Date.now()))
const weekday_labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const blocks = ((begin_time, end_time) => {
	const blocks = []
	for (let i = begin_time; i < end_time; i += 30) {
		blocks.push(i)
	}
	return blocks
})(8 * 60, 22 * 60)
const tdStyle = {
	height: "20px",
	padding: "0",
}

function parseISODurationToMinutes(duration: string): number {
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

type SpareDisplay = {
	id: number
	stamp: number
	week: string
	begin_time: number
	end_time: number
	room: string
	assignee?: {
		id: number
		username: string
	}
}

type SpareTdStyle = "Mine" | "Taken" | "Available"
const SpareTd = (props: { spare: SpareDisplay, style: SpareTdStyle }) => {
	let cellRef: HTMLTableCellElement | undefined
	let popupRef: HTMLDivElement | undefined
	const spare = props.spare

	const rowSpan = Math.round((spare.end_time - spare.begin_time) / 30)
	let color, tdText, popupButton, popupDescription
	if (props.style === "Available") {
		color = "blue"
		tdText = "空闲"
		popupButton = <div class="ui button"> 预约 </div>
		popupDescription = ""
	} else if (props.style === "Mine") {
		color = "green"
		tdText = spare.assignee?.username
		popupButton = <div class="ui button">取消预约</div>
		popupDescription = ""
	} else {
		color = "white"
		tdText = spare.assignee?.username
		popupButton = <></>
		popupDescription = `预约人：${spare.assignee?.username}`
	}

	onMount(() => {
		if (cellRef && popupRef) {
			$(cellRef).popup({
				popup: $(popupRef),
				on: "click",
			})
		}
	})

	return <>
		<td ref={cellRef} class={color} style={tdStyle} rowspan={rowSpan}>
			{tdText}
		</td>
		<div ref={popupRef} class="ui popup transition hidden">
			<div class="ui header">{popupDescription}</div>
			{popupButton}
		</div>
	</>
}

const Calendar = (props: { user: User, spares: Spares, room: string }) => {
	const monday = parseISO(`${year}-W${week()}-1`)
	const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

	const spares = props.spares.filter(spare => spare.room == props.room)
		.map(spare => ({
			...spare,
			begin_time: parseISODurationToMinutes(spare.begin_time),
			end_time: parseISODurationToMinutes(spare.end_time),
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
		<div class="ui segment">
			<div style="overflow-x: auto;">
				<table class="ui small celled center aligned unstackable table">
					<thead>
						<tr>
							<th>时间</th>
							<For each={weekDates}>
								{(date, i) => (
									<th>
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
									<td style={tdStyle}>
										<Show when={block % 60 === 0}>
											{Math.round(block / 60)}:00
										</Show>
									</td>
									<For each={weekDates}>
										{(date, i) => (
											<Show when={!isCovered(i(), block)}>
												{match(findMatched(i(), block))
													.with(undefined, () => <td style={tdStyle}></td>)
													.otherwise(spare => <SpareTd spare={spare} style={
														match(spare.assignee)
															.with(undefined, () => "Available" as SpareTdStyle)
															.with({ id: props.user.id }, () => "Mine" as SpareTdStyle)
															.otherwise(() => "Taken" as SpareTdStyle)
													} />)
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
		</div>
	)
}

const SpareItem = (props: { spare: Spare, button?: JSXElement }) => {
	const monday = parseISO(`${year}-W${week()}-1`)
	const begin_time = addMinutes(monday, parseISODurationToMinutes(props.spare.begin_time))
	const end_time = addMinutes(monday, parseISODurationToMinutes(props.spare.end_time))
	return (
		<div class="ui card">
			<div class="content">
				<div class="header">{props.spare.room}</div>
			</div>
			<div class="content">
				<div class="meta">{formatDate(begin_time, "LLLdo EEEE", { locale: zhCN })}</div>
				<div class="meta">
					{format(begin_time, "H:mm", { locale: zhCN })}
					-
					{format(end_time, "H:mm", { locale: zhCN })}
				</div>
			</div>
			<Show when={props.button != undefined}>
				{props.button}
			</Show>
		</div>
	)
}

const SpareEmpty = () => (
	<div class="ui placeholder segment" style="min-height: 10rem;">
		<div class="ui icon mini header">
			<i class="ellipsis horizontal icon" />
			暂无
		</div>
	</div>
)

const MySpares = (props: { spares: Spares }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 我的琴房 </h4>
		<Show when={props.spares.length > 0} fallback={<SpareEmpty />}>
			<div class="ui two cards">
				{props.spares.map(spare => <SpareItem spare={spare} button={<div class="ui negative button">取消预约</div>} />)}
			</div>
		</Show>
	</div>
)

const AvailableSpares = (props: { spares: Spares }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 空闲琴房 </h4>
		<Show when={props.spares.length > 0} fallback={<SpareEmpty />}>
			<div class="ui two cards">
				{props.spares.map(spare => <SpareItem spare={spare} button={<div class="ui positive button">预约</div>} />)}
			</div>
		</Show>
	</div>
)

const demo_spares: Spares = [
	{
		id: 10001,
		stamp: 1,
		week: "2025-W01",
		// ISO 8601 time diff format, begin_time 8hrs, end_time 9hrs30mins
		begin_time: "PT08H00M00S",
		end_time: "PT09H30M00S",
		room: "205",
		assignee: {
			id: 3,
			username: "zhangyang",
		},
	},
	{
		id: 10002,
		stamp: 1,
		week: "2025-W01",
		// ISO 8601 time diff format, begin_time 8hrs, end_time 9hrs30mins
		begin_time: "PT08H00M00S",
		end_time: "PT09H30M00S",
		room: "208",
		assignee: undefined,
	},
]

const Main = (props: { user: User }) => {
	// TODO: Add Week Selector
	// (use date-fns, getISOWeek)

	const [data] = createResource(async () => {
		// return await api.spare_list({ ... })
		await new Promise(resolve => setTimeout(resolve, 1000))
		return { spares: demo_spares, rooms: ["205", "208"] }
	})

	return <> {
		match(data())
			.with(undefined, () => <Loader />)
			.otherwise(data => <>
				<MenuViewer {...["205", "208"].map(room => ({
					name: room,
					component: () => <Calendar user={props.user} spares={data.spares} room={room} />,
				}))} />
				{/* <Calendar user={props.user} spares={spares} room={"205"} /> */}
				<MySpares spares={data.spares.filter(spare => spare.assignee && spare.assignee.id === props.user.id)} />
				<AvailableSpares spares={data.spares.filter(spare => spare.assignee === undefined)} />
			</>)
	}
	</>
}

export const Home: Component = () => <>
	{
		match(db.user.get())
			.with(null, () => "请先登录")
			.otherwise(user => <Main user={user} />)
	}
</>