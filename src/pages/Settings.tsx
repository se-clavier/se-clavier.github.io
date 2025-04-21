import { Component } from "solid-js"
import { FormField } from "../lib/common"
import { Signal } from "../util"
import { api } from "../api"
import { match } from "ts-pattern"

const ResetPassword: Component = () => {
	let submit_ref: HTMLButtonElement | undefined, success_ref: HTMLDivElement | undefined, error_ref: HTMLDivElement | undefined

	const success_message = new Signal("")
	const error_message = new Signal("")

	const submit = async () => {
		if (submit_ref) $(submit_ref).addClass("loading")
		$(success_message).hide()
		$(error_message).hide()

		const new_password = String($("input[name='new_password']").val())
		const comfirm_password = String($("input[name='comfirm_password']").val())

		if (new_password != comfirm_password) {
			error_message.set("两次输入的密码不一致")
			if (error_ref) $(error_ref).show()
			return
		}

		const response = await api.reset_password({ password: new_password })
		match(response)
			.with({ type: "FailurePasswordInvalid" }, () => {
				error_message.set("密码强度不足")
				if (error_ref) $(error_ref).show()
			})
			.with({ type: "Success" }, () => {
				success_message.set("密码修改成功")
				if (success_ref) $(success_ref).show()
			})
			.exhaustive()
		if (submit_ref) $(submit_ref).removeClass("loading")
	}

	return (
		<div class="ui form">
			<h4 class="ui dividing header"> 修改密码 </h4>
			<FormField label="新密码" name="new_password" type="password"/>
			<FormField label="确认密码" name="comfirm_password" type="password"/>
			<button ref={submit_ref} class="ui button" tabindex="0" onclick={submit}> 提交 </button>
			<div ref={success_ref} class="ui success message">
				<div class="header"> 修改成功 </div>
				<p>{success_message.get()}</p>
			</div>
			<div ref={error_ref} class="ui error message">
				<div class="header"> 修改失败 </div>
				<p>{error_message.get()}</p>
			</div>
		</div>
	)
}

export const Settings: Component = () => {
	return (
		<>
			<ResetPassword />
		</>
	)
}