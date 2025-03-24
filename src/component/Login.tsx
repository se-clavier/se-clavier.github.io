import { type Component } from "solid-js";

export const LoginModal: Component = () => {
	function login() {
		const username = $("#login-modal input[name='username']").val();
		const password = $("#login-modal input[name='password']").val();
	
		/// TODO
		console.log(username, password);
	}

	return (
		<div class="ui modal" id="login-modal">
			<i class="close icon"/>
			<div class="header">
				用户登录
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
					<div class="field"></div>
					<div class="ui button" onClick={login}>提交</div>
				</form>
			</div>
		</div>
	);
}

export function showLoginModal() {
	$("#login-modal").modal("show");
}
