import { Component, createResource, createSignal, JSXElement, Show } from "solid-js"
import { db } from "../db"
import { match } from "ts-pattern"
import { api, Spare, Spares, User } from "../api"
import { ErrorMessage, Loader } from "../lib/common"
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

const MySpares = (props: { spares: Spares, refresh: () => void, }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 我的琴房 </h4>
		<Show when={props.spares.length > 0} fallback={<SpareEmpty />}>
			<div class="ui two cards">
				{props.spares.map(spare => <SpareItem spare={spare} button={
					<div class="ui negative button" onClick={async () => {
						await api.spare_return({ id: spare.id })
						props.refresh()
					}}> 取消预约 </div>
				} />)}
			</div>
		</Show>
	</div>
)

const AvailableSpares = (props: { spares: Spares, refresh: () => void }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 空闲琴房 </h4>
		<Show when={props.spares.length > 0} fallback={<SpareEmpty />}>
			<div class="ui two cards">
				{props.spares.map(spare => <SpareItem spare={spare} button={
					<div class="ui positive button" onClick={async () => {
						await api.spare_take({ id: spare.id })
						props.refresh()
					}}> 预约 </div>
				} />)}
			</div>
		</Show>
	</div>
)

const Main = (props: { user: User }) => {
	const [week, set_week] = createSignal(new Date())
	const [data, { refetch }] = createResource(week, async () => {
		return await api.spare_list({
			type: "Week",
			content: format(week(), "RRRR-'W'ww"),
		})
	})

	return <>
		<div class="ui" style={{ "text-align": "center" }}>
			<WeekSelect get={week} set={set_week} />
		</div>
		{
			match(data.error)
				.with(undefined, () => match(data())
					.with(undefined, () => <Loader />)
					.otherwise(({ spares, rooms }) => <>
						<Calendar spares={spares} rooms={rooms} base_week={week()} focus_user={props.user} />
						<MySpares spares={spares.filter(spare => spare.assignee?.id === props.user.id)} refresh={refetch} />
						<AvailableSpares spares={spares.filter(spare => spare.assignee === null)} refresh={refetch} />
					</>))
				.otherwise(error => <ErrorMessage message={error.message} />)
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