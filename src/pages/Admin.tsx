import { Component } from "solid-js"
import { MenuViewer } from "../lib/MenuViewer"
import { FormField } from "../lib/common"

const UserManage: Component = () => {
	// TODO[Early]: Finish this component
	return (
		<div class="ui form">
			<h4 class="ui dividing header"> 修改密码 </h4>
			<div class="inline fields">
				<FormField label="用户名" name="username" />
				<FormField label="新密码" name="password" type="password" />
				<button class="ui button" tabindex="0"> 修改 </button>
			</div>
		</div>
	)
}

const SpareManage: Component = () => {
	// TODO: Implement spare management
	return (
		<p> Spare Manage </p>
	)
}

export const Admin: Component = () => {
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