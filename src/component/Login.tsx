import { type Component, createSignal } from "solid-js"
import { api, Auth } from "../api"
import { match } from "ts-pattern"

const [error_message, set_error_message] = createSignal("")

export const LoginModal: Component = () => {
	return (
		<div class="ui modal" id="login-modal">
			<i class="close icon" />
			<div class="header"> 用户登录 </div>
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
					<div class="field"></div>
					<div class="ui button" id="login-submit"> 提交 </div>
					<div class="ui error message" id="login-error-message">
						<div class="header"> 登录失败 </div>
						<p>{error_message()}</p>
					</div>
				</form>
			</div>
		</div>
	)
}

function show_login_modal() {
	$("#login-modal").modal("show")
}

export function login() {
	return new Promise<Auth>((resolve, reject) => {
		show_login_modal()

		const set_error = (msg: string) => {
			set_error_message(msg)
			$("#login-error-message").show()
		}

		const submit = async () => {
			const username = String($("#login-modal input[name='username']").val())
			const password = String($("#login-modal input[name='password']").val())

			const response = await api.login({ username, password })
			match(response)
				.with({ type: "FailureIncorrect" }, () => set_error("用户名或密码错误"))
				.with({ type: "Success" }, response => {
					resolve(response.content)
					$("#login-modal").modal("hide")
				})
				.exhaustive()
		}
		$("#login-submit").on("click", submit)

		const cancel_observer = new MutationObserver(() => {
			if ($("#login-modal").hasClass("hidden")) {
				remove_observer()
				// If not resolved, this reject will take effect
				reject(new Error("login cancelled"))
			}
		})
		cancel_observer.observe($("#login-modal")[0], { attributes: true, attributeFilter: ["class"] })

		const remove_observer = () => {
			$("#login-submit").off("click", submit)
			cancel_observer.disconnect()
		}
	})
}