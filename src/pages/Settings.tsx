import { Component } from "solid-js"
import { FormField, Message, MessageProps } from "../lib/common"
import { Signal } from "../util"
import { api } from "../api"
import { match } from "ts-pattern"

const ResetPassword: Component = () => {
	const loading = new Signal<boolean>(false)
	const message = new Signal<MessageProps>({ type: null })

	const submit = async () => {
		const new_password = String($("input[name='new_password']").val())
		const comfirm_password = String($("input[name='comfirm_password']").val())

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
			<FormField label="新密码" name="new_password" type="password" />
			<FormField label="确认密码" name="comfirm_password" type="password" />
			<button class="ui button" classList={{ loading: loading.get() }} onclick={submit}> 提交 </button>
			{/* why <Message {...message.get()} /> does not work? */}
			{Message(message.get())}
		</div>
	)
}

export const Settings: Component = () => {
	return <>
		<ResetPassword />
	</>
}