import { Component } from "solid-js"
import { FormField } from "../lib/common"

export const Settings: Component = () => {
	// TODO[Early]: Finish this component
	return (
		<>
			<div class="ui form">
				<h4 class="ui dividing header"> 修改密码 </h4>
				<FormField label="新密码" type="password"/>
				<FormField label="确认密码" type="password"/>
				<button class="ui button" tabindex="0"> 修改 </button>
			</div>
		</>
	)
}