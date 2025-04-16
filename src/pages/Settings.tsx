import { Component } from "solid-js"

export const Settings: Component = () => {
	return (
		<>
			<div class="ui form">
				<h4 class="ui dividing header"> 修改密码 </h4>
				<div class="field">
					<label>
						新密码
						<input type="password" placeholder="新密码" />
					</label>
				</div>
				<div class="field">
					<label>
						确认密码
						<input type="password" placeholder="确认密码" />
					</label>
				</div>
				<div class="field">
					<button class="ui button" tabindex="0"> 修改 </button>
				</div>
			</div>
		</>
	)
}