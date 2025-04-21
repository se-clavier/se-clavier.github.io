import { Component, createEffect, createSignal, JSXElement, Show } from "solid-js"
import { db } from "../db"
import { match } from "ts-pattern"
import { Rooms, Spare, Spares, User } from "../api"
import { Loader } from "../lib/common"
import { Calendar } from "../component/Calendar"
import { format, formatDate } from "date-fns"
import { zhCN } from "date-fns/locale"
import { WeekSelect } from "../lib/WeekSelect"
import { spare_end_time, spare_start_time } from "../util"

const SpareItem = (props: { spare: Spare, button?: JSXElement }) => {
	const begin_time = spare_start_time(props.spare)
	const end_time = spare_end_time(props.spare)
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

const demo_spares = (week: Date): Spares => [
	{
		id: 10001,
		stamp: 1,
		week: format(week, "RRRR-'W'II"),
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
		week: format(week, "RRRR-'W'II"),
		// ISO 8601 time diff format, begin_time 1days8hrs, end_time 9hrs30mins
		begin_time: "P1DT08H00M00S",
		end_time: "P1DT09H30M00S",
		room: "208",
		assignee: undefined,
	},
]

const Main = (props: { user: User }) => {
	// TODO: Add Week Selector
	// (use date-fns, getISOWeek)

	const [week, set_week] = createSignal(new Date())
	const [data, set_data] = createSignal<{ spares: Spares, rooms: Rooms }>()
	createEffect(() => {
		set_data(undefined)
		const current_week = week();
		(new Promise(resolve => setTimeout(resolve, 1000))).then(() => {
			set_data({ spares: demo_spares(current_week), rooms: ["205", "208"] })
		})
	})

	return <>
		<div class="ui" style={{ "text-align": "center" }}>
			<WeekSelect get={week} set={set_week} />
		</div>
		{
			match(data())
				.with(undefined, () => <Loader />)
				.otherwise(data => <>
					<Calendar spares={data.spares} rooms={data.rooms} base_week={week()} focus_user={props.user} />
					<MySpares spares={data.spares.filter(spare => spare.assignee?.id === props.user.id)} />
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