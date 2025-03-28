import { type Component, createSignal } from "solid-js"
import { api } from "../api"

const [errorMessage, setErrorMessage] = createSignal("")

export const RegisterModal: Component = () => {
	return (
		<div class="ui modal" id="register-modal">
			<i class="close icon"/>
			<div class="header">
				用户注册
			</div>
			<div class="content">
				<form class="ui large form">
					<div class="field">
						<label>用户名</label>
						<input type="text" name="username" placeholder="用户名"/>
					</div>
					<div class="field">
						<label>密码</label>
						<input type="password" name="password" placeholder="密码"/>
					</div>
					<div class="field">
						<label>确认密码</label>
						<input type="password" name="password-repeat" placeholder="确认密码"/>
					</div>
					<div class="ui button" id="register-submit">提交</div>
					<div class="ui error message" id="register-error-message">
						<div class="header">
							注册失败
						</div>
						<p>{errorMessage()}</p>
					</div>
				</form>
			</div>
		</div>
	)
}

function showRegisterModal() {
	$("#register-modal").modal("show")
}

export function register() {
	return new Promise((res, rej) => {
		showRegisterModal()

		const submit = async () => {
			const username = String($("#register-modal input[name='username']").val())
			const password = String($("#register-modal input[name='password']").val())
			const passwordRepeat = String($("#register-modal input[name='password-repeat']").val())

			let token = ""
			try {
				if (password !== passwordRepeat) {
					throw new Error("两次输入的密码不一致")
				}
				const registerResponse = await api.register({ username, password })
				token = registerResponse.token
				console.log("注册成功，token:", token)
				removeObserver()
				return res(token)
			} catch (err) {
				setErrorMessage(String(err))
				$("#register-error-message").show()
				console.log("注册失败:", err)
			}
		}
		$("#register-submit").on("click", submit)

		const cancelObserver = new MutationObserver(() => {
			if ($("#register-modal").hasClass("hidden")) {
				removeObserver()
				rej(new Error("注册被取消"))
			}
		})
		cancelObserver.observe($("#register-modal")[0], { attributes: true, attributeFilter: ["class"] })

		const removeObserver = () => {
			$("#register-submit").off("click", submit)
			cancelObserver.disconnect()
		}
	})
}