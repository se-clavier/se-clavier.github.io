import { createResource, createSignal, JSXElement, Show } from "solid-js"
import { api, Auth, Spare, Spares, User } from "../api"
import { Message, MessageProps, ResourceLoader } from "../lib/common"
import { Calendar, SpareDefaultTd } from "../component/Calendar"
import { format, formatDate } from "date-fns"
import { zhCN } from "date-fns/locale"
import { WeekSelect } from "../lib/WeekSelect"
import { Signal, spare_end_time, spare_start_time } from "../util"
import { Scanner } from "../component/Scanner"
import { match } from "ts-pattern"

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

const CheckScanner = (props: { spare: Spare, type: "checkin" | "checkout" }) => {
	const [messageProps, setMessageProps] = createSignal<MessageProps>({ type: null })
	const showReload = new Signal(false)
	const onScanned = async (text: string) => {
		const credential = JSON.parse(text) as Auth
		if (props.type === "checkin") {
			match(await api.checkin({ id: props.spare.id, credential }).catch(() => setMessageProps({ type: "error", message: "二维码格式错误" })))
				.with({ type: "InvailidCredential"}, () => setMessageProps({ type: "error", message: "二维码无效" }))
				.with({ type: "Intime" }, () => setMessageProps({ type: "success", message: "签到成功" }))
				.with({ type: "Early" }, () => { setMessageProps({ type: "info", message: "签到失败，时间过早" }); showReload.set(true) })
				.with({ type: "Late" }, res => setMessageProps({ type: "info", message: `签到时间过晚，迟到 ${res.content} 分钟` }))
				.with({ type: "Duplicate" }, () => setMessageProps({ type: "info", message: "请勿重复签到" }))
		} else {
			match(await api.checkout({ id: props.spare.id, credential }).catch(() => setMessageProps({ type: "error", message: "二维码格式错误" })))
				.with({ type: "InvailidCredential"}, () => setMessageProps({ type: "error", message: "二维码无效" }))
				.with({ type: "Intime" }, () => setMessageProps({ type: "success", message: "签退成功" }))
				.with({ type: "Early" }, () => { setMessageProps({ type: "info", message: "签退失败，时间过早" }); showReload.set(true) })
				.with({ type: "Late" }, () => setMessageProps({ type: "info", message: "签退失败，时间过晚" }))
				.with({ type: "NotCheckedIn" }, () => setMessageProps({ type: "info", message: "未签到，无法签退" }))
				.with({ type: "Duplicate" }, () => setMessageProps({ type: "info", message: "请勿重复签退" }))
		}
	}
	const onError = (error: string) => {
		setMessageProps({ type: "error", message: error })
		showReload.set(true)
	}
	const scanner = Scanner({ id: `scanner-${props.spare.id}-${props.type}`, onScanned, onError })
	return <>
		{scanner.component}
		{Message(messageProps())}
		{/* why <Message {...messageProps()} /> does not work? */}
		<Show when={showReload.get()}>
			<button class="ui button" onClick={() => { scanner.start(); showReload.set(false) }}>
				重试
			</button>
		</Show>
	</>
}

const CheckPanel = (props: { spare: Spare }) => {
	const [panelType, setPanelType] = createSignal<"checkin" | "checkout" | null>(null)
	return <>
		<div class="ui two buttons">
			<button
				class={"ui blue button" + (panelType() == "checkin" ? "" : " basic")}
				onclick={() => setPanelType(panelType() == "checkin" ? null : "checkin")}
			>签到</button>
			<button
				class={"ui blue button" + (panelType() == "checkout" ? "" : " basic")}
				onclick={() => setPanelType(panelType() == "checkout" ? null : "checkout")}
			>签退</button>
		</div>
		<Show when={panelType() == "checkin"}>
			<div class="description" style="margin: 6px;">扫描终端二维码以签到</div>
			<CheckScanner spare={props.spare} type="checkin" />
		</Show>
		<Show when={panelType() == "checkout"}>
			<div class="description" style="margin: 6px;">扫描终端二维码以签退</div>
			<CheckScanner spare={props.spare} type="checkout" />
		</Show>
	</>
}

const MySpares = (props: { spares: Spares, refresh: () => void, }) => (
	<div class="ui segment">
		<h4 class="ui dividing header"> 我的琴房 </h4>
		<Show when={props.spares.length > 0} fallback={<SpareEmpty />}>
			<div class="ui one cards">
				{props.spares.map(spare => <SpareItem spare={spare} button={<>
					<div class="extra content">
						<CheckPanel spare={spare} />
					</div>
					<button class="ui negative button" onClick={async () => {
						await api.spare_return({ id: spare.id })
						props.refresh()
					}}> 取消预约 </button>
				</>} />)}
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
					<button class="ui positive button" onClick={async () => {
						await api.spare_take({ id: spare.id })
						props.refresh()
					}}> 预约 </button>
				} />)}
			</div>
		</Show>
	</div>
)

export const Home = (props: { user: User }) => {
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
		<ResourceLoader resource={data} render={({ spares, rooms }) => <>
			<Calendar spares={spares} rooms={rooms} base_week={week()} cell={SpareDefaultTd(props.user)} />
			<MySpares spares={spares.filter(spare => spare.assignee?.id === props.user.id)} refresh={refetch} />
			<AvailableSpares spares={spares.filter(spare => spare.assignee === null)} refresh={refetch} />
		</>} />
	</>
}