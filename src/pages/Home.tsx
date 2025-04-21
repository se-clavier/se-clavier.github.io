import { Component, createResource, createSignal, Show } from "solid-js"
import { db } from "../db"
import { match } from "ts-pattern"
import { Spare, Spares, User } from "../api"
import { Loader } from "../lib/common"
import { Calendar } from "../component/Calendar"

const [week] = createSignal(new Date())

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

	const [data] = createResource(async () => {
		// return await api.spare_list({ ... })
		await new Promise(resolve => setTimeout(resolve, 1000))
		return { spares: demo_spares, rooms: ["205", "208"] }
	})

	return <> {
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