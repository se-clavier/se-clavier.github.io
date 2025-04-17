import { Show, type Component } from "solid-js"
import { match } from "ts-pattern"
import { register } from "./Register"
import { login } from "./Login"
import { db } from "../db"
import { mainApp } from "../App"
import { Admin } from "../pages/Admin"
import { Home } from "../pages/Home"
import { Settings } from "../pages/Settings"
import { LinkButton } from "../lib/common"

const app_goto = (app: Component) => {
	return () => {
		mainApp.set(() => app)
		$("#sidebar").sidebar("hide")
	}
}

export const SideBar: Component = () => {
	const sidebar_logout = () => {
		db.auth.unset()
		app_goto(Home)()
	}

	return (
		<>
			<a class="icon item" role="button" tabindex="0" 
				onClick={toggleSidebar}
				onKeyDown={
					event => match(event.key)
						.with("Enter", () => $("#sidebar").sidebar("show"))
						.with("Escape", () => $("#sidebar").sidebar("hide"))
				}>
				<i class="bars icon" />
			</a>
			<div class="ui right vertical sidebar menu" id="sidebar">
				<LinkButton label="主页" onClick={app_goto(Home)} />
				<LinkButton label="设置" onClick={app_goto(Settings)} />
				<Show when={db.auth.get()?.roles.some(t => t.type === "admin")}>
					<LinkButton label="管理" onClick={app_goto(Admin)} />
				</Show>
				<LinkButton label="登出" onClick={sidebar_logout} />
			</div>
		</>
	)
}

function toggleSidebar() {
	$("#sidebar").sidebar("toggle")
}

export const TopBar: Component = () => {
	const sidebar_login = async () => {
		db.auth.set(await login())
	}

	const sidebar_register = async () => {
		db.auth.set(await register())
	}

	return (
		<div class="ui borderless top menu">
			<div class="ui container">
				<a class="item" href="/">
					<img alt="" src="https://avatars.githubusercontent.com/u/199693511" />
					<div>Clavier</div>
				</a>
				{match(db.user.get())
					.with(null, () => (
						<div class="right menu">
							<LinkButton label="登录" onClick={sidebar_login} />
							<LinkButton label="注册" onClick={sidebar_register} />
						</div>
					))
					.otherwise(user => (
						<div class="right menu">
							<div class="item">{user.username}</div>
							{/* This SideBar component will be moved by FomanticJS, so it cannot handle signal */}
							{/* TODO: use other component that will not be moved */}
							<SideBar />
						</div>
					))}
			</div>
		</div>
	)
}