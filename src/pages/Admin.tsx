import { Component } from "solid-js"
import { MenuViewer } from "../lib/MenuViewer"
import { FormField } from "../lib/common"

const UserManage: Component = () => {
	return (
		<div class="ui form">
			<h4 class="ui dividing header"> 修改密码 </h4>
			<div class="inline fields">
				<FormField label="用户名" name="username" />
				<FormField label="新密码" name="password" type="password" />
				<div class="ui button" tabindex="0"> 修改 </div>
			</div>
		</div>
	)
}

const SpareManage: Component = () => {
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