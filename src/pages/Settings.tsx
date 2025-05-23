import { Component, createResource } from "solid-js"
import { FormInput, Message, MessageProps, ResourceLoader, SubmitField, SubmitStatus } from "../lib/common"
import { Signal } from "../util"
import { api } from "../api"
import { match } from "ts-pattern"
import { MenuViewer } from "../lib/MenuViewer"
import { Calendar } from "../component/Calendar"

const ResetPassword: Component = () => {
	const loading = new Signal<boolean>(false)
	const message = new Signal<MessageProps>({ type: null })

	const submit = async () => {
		const new_password = String($("input[name='new_password']").val())
		const comfirm_password = String($("input[name='confirm_password']").val())

		if (new_password != comfirm_password) {
			message.set({ type: "error", message: "两次输入的密码不一致" })
		}
		else {
			loading.set(true)
			const response = await api.reset_password({ password: new_password })
			match(response)
				.with({ type: "FailurePasswordInvalid" }, () => message.set({ type: "error", message: "密码强度不足" }))
				.with({ type: "Success" }, () => message.set({ type: "success", message: "密码修改成功" }))
				.exhaustive()
			loading.set(false)
		}
	}

	return (
		<div class="ui form">
			<h4 class="ui dividing header"> 修改密码 </h4>
			<FormInput label="新密码" name="new_password" type="password" />
			<FormInput label="确认密码" name="confirm_password" type="password" />
			<button class="ui button" classList={{ loading: loading.get() }} onclick={submit}> 提交 </button>
			{/* why <Message {...message.get()} /> does not work? */}
			{Message(message.get())}
		</div>
	)
}

const SpareQuestionaire = () => {
	const [spares] = createResource(async () => {
		return await api.spare_list({ type: "Schedule" })
	})

	return <>
		<h4 class="ui dividing header"> 琴房时间收集问卷 </h4>
		<ResourceLoader resource={spares} render={spares => {
			const vacancy: Signal<boolean>[] = Array.from({ length: spares.spares.length })
				.map(() => new Signal(false))
			const status = new SubmitStatus(async () => {
				if (!vacancy.some(v => v.get())) {
					throw new Error("请选择至少一个时段")
				}
				const result = await api.spare_questionaire({
					vacancy: vacancy.map(v => v.get() ? { type: "Available" } : { type: "Unavailable" })
				})
				return match(result.type)
					.with("Success", () => "提交成功")
					.exhaustive()
			})
			return <>
				<Calendar rooms={spares.rooms} spares={spares.spares}
					cell={({ spare }) => (
						<td rowSpan={spare.row_span} style={{ padding: "0px" }}
							class={vacancy[spare.stamp].get() ? "green" : "grey"}
							tabindex="0" role="button"
							onKeyDown={event => match(event.key)
								.with(" ", () => vacancy[spare.stamp].set(x => !x))
								.with("Enter", () => vacancy[spare.stamp].set(true))
								.with("Escape", () => vacancy[spare.stamp].set(false))
								.otherwise(console.log)
							}
							onClick={() => vacancy[spare.stamp].set(x => !x)}>
							{vacancy[spare.stamp].get() ? "已选" : "未选"}
						</td>
					)}
				/>
				<SubmitField {...status} />
			</>
		}} />
	</>
}

export const Settings: Component = () => {
	return MenuViewer([
		{ name: "修改密码", component: ResetPassword },
		{ name: "时间设置", component: SpareQuestionaire },
	])
}