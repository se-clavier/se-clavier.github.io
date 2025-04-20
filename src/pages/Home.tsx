import { Component, createResource, createSignal, For, onMount, Show } from "solid-js"
import { db } from "../db"
import { match } from "ts-pattern"
import { Spare, Spares, User } from "../api"
import { Loader } from "../lib/common"
import { addDays, format, getISOWeek, getISOWeekYear, parseISO } from "date-fns"
import { MenuViewer } from "../lib/MenuViewer"

const year = getISOWeekYear(Date.now());
const [week, setWeek] = createSignal(getISOWeek(Date.now()))
const weekDayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const blocks = ((begin_time, end_time) => {
	let blocks = []
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
	const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	const match = duration.match(regex);

	if (!match) throw new Error("Invalid ISO 8601 duration");

	const [, h, m, ] = match;
	const hours = parseInt(h || "0", 10);
	const minutes = parseInt(m || "0", 10);

	return hours * 60 + minutes;
}

type ParsedSpare = {
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

const SpareTd = (props: {spare: ParsedSpare, userId?: number}) => {
	let cellRef: HTMLTableCellElement | undefined
	let popupRef: HTMLDivElement | undefined
	const spare = props.spare

	const rowSpan = Math.round((spare.end_time - spare.begin_time) / 30);
	let color, tdText, popupButton, popupDescription
	if (spare.assignee === undefined) {
		color = "blue"
		tdText = "空闲"
		popupButton = <div class="ui button">预约</div>
		popupDescription = ""
	} else {
		if (props.userId && spare.assignee.id == props.userId) {
			color = "green"
			tdText = "已预约"
			popupButton = <div class="ui button">取消预约</div>
			popupDescription = ""
		} else {
			color = "yellow"
			tdText = "已占用"
			popupButton = <></>
			popupDescription = `预约人：${spare.assignee.username}`
		}
	}

	onMount(() => {
		if (cellRef && popupRef) {$(cellRef).popup({
			popup: $(popupRef),
			on: "click",
		})}
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

const Calendar = (props: { user: User, spares: Spares, room: String }) => {
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
			spare.stamp == day && spare.begin_time == begin_time
		)
	}
	const isCovered = (day: number, begin_time: number) => {
		return spares.some(spare =>
			spare.stamp == day && spare.begin_time < begin_time && spare.end_time > begin_time
		)
	}

	return (
		<div class="ui segment">
			<p> TODO[Early]: </p>
			<p> Implement Calendar for user {props.user.username} </p>
			<table class="ui small celled center aligned unstackable table">
				<thead>
					<tr>
						<th>时间</th>
						<For each={weekDates}>
							{(date, i) => (
								<th>
									{weekDayLabels[i()]}
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
										<Show when={!isCovered(i() + 1, block)}>
											{match(findMatched(i() + 1, block))
												.with(undefined, () => <td style={tdStyle}></td>)
												.otherwise(spare => <SpareTd spare={spare} userId={props.user.id} />)
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

const SpareItem = (props: { spare: Spare }) => (
	// TODO[Early]: Draw this component
	<div class="ui fluid card">
		<div class="content">
			spare of {JSON.stringify(props.spare)}
		</div>
	</div>
)

const SpareEmpty = () => (
	// TODO[Early]: Draw a better empty state
	<div style={{ "text-align": "center", margin: "20px" }}>
		暂无
	</div>
)

const MySpares = (props: { spares: Spares }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 我的琴房 </h4>
		<div class="ui cards">
			{props.spares.map(spare => <SpareItem spare={spare} />)}
		</div>
		<Show when={props.spares.length === 0}>
			<SpareEmpty />
		</Show>
	</div>
)

const AvailableSpares = (props: { spares: Spares }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 空闲琴房 </h4>
		<div class="ui cards">
			{props.spares.map(spare => <SpareItem spare={spare} />)}
		</div>
		<Show when={props.spares.length === 0}>
			<SpareEmpty />
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

	const [spares] = createResource<Spares>(async () => {
		// return await api.spare_list({ ... })
		await new Promise(resolve => setTimeout(resolve, 1000))
		return demo_spares
	})

	return <> {
		match(spares())
			.with(undefined, () => <Loader />)
			.otherwise(spares => <>
				<MenuViewer {...["205", "208"].map(room => ({
					name: room,
					component: () => <Calendar user={props.user} spares={spares} room={room} />,
				}))}></MenuViewer>
				{/* <Calendar user={props.user} spares={spares} room={"205"} /> */}
				<MySpares spares={spares.filter(spare => spare.assignee && spare.assignee.id === props.user.id)} />
				<AvailableSpares spares={spares.filter(spare => spare.assignee === undefined)} />
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