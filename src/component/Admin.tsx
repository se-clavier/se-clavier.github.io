import { Component } from "solid-js"
import { MenuViewer } from "../lib/MenuViewer"

const UserManage: Component = () => {
	return (
		<div class="ui form">
			<h4 class="ui dividing header"> 修改密码 </h4>
			<div class="inline fields">
				<div class="field">
					<label>
						用户名
						<input type="text" placeholder="用户名" />
					</label>
				</div>
				<div class="field">
					<label>
						新密码
						<input type="password" placeholder="新密码" />
					</label>
				</div>
				<div class="field">
					<div class="ui button" tabindex="0"> 修改 </div>
				</div>
			</div>
		</div>
	)
}

const SpareManage: Component = () => {
	return (
		<p> Spare Manage </p>
	)
}

export const AdminView: Component = () => {
	return MenuViewer([
		{
			name: "用户管理",
			component: UserManage,
		},
		{
			name: "琴房管理",
			component: SpareManage,
		},
	])
}