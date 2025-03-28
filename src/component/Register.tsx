import { type Component, createSignal } from "solid-js"
import { api } from "../api"
import { match } from "ts-pattern"

const [error_message, set_error_message] = createSignal("")

export const RegisterModal: Component = () => {
	return (
		<div class="ui modal" id="register-modal">
			<i class="close icon" />
			<div class="header"> 用户注册 </div>
			<div class="content">
				<form class="ui large form">
					<div class="field">
						<label>用户名</label>
						<input type="text" name="username" placeholder="用户名" />
					</div>
					<div class="field">
						<label>密码</label>
						<input type="password" name="password" placeholder="密码" />
					</div>
					<div class="field">
						<label>确认密码</label>
						<input type="password" name="password-repeat" placeholder="确认密码" />
					</div>
					<div class="ui button" id="register-submit">提交</div>
					<div class="ui error message" id="register-error-message">
						<div class="header"> 注册失败 </div>
						<p>{error_message()}</p>
					</div>
				</form>
			</div>
		</div>
	)
}

function show_register_modal() {
	$("#register-modal").modal("show")
}

export function register() {
	return new Promise((resolve, reject) => {
		show_register_modal()

		const set_error = (msg: string) => {
			console.log("set error", msg)
			set_error_message(msg)
			$("#register-error-message").show()
		}

		const submit = async () => {
			const username = String($("#register-modal input[name='username']").val())
			const password = String($("#register-modal input[name='password']").val())
			const passwordRepeat = String($("#register-modal input[name='password-repeat']").val())

			if (password !== passwordRepeat) {
				set_error_message("两次输入的密码不一致")
				$("#register-error-message").show()
			} else {
				const response = await api.register({ username, password })
				console.log(response)
				match(response)
				  .with({ type: "FailureUsernameTaken" }, () => set_error("用户名已被注册"))
					.with({ type: "FailureUsernameInvalid" }, () => set_error("用户名不合法"))
					.with({ type: "FailurePasswordInvalid" }, () => set_error("密码强度不足"))
					.with({ type: "Success" }, response => {
						resolve(response.content)
						$("#register-modal").modal("hide")
					})
			}
		}
		$("#register-submit").on("click", submit)

		const cancel_observer = new MutationObserver(() => {
			if ($("#register-modal").hasClass("hidden")) {
				remove_observer()
				reject(new Error("register cancelled"))
			}
		})
		cancel_observer.observe($("#register-modal")[0], { attributes: true, attributeFilter: ["class"] })

		const remove_observer = () => {
			$("#register-submit").off("click", submit)
			cancel_observer.disconnect()
		}
	})
}