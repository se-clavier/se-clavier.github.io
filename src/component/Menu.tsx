import { Show, type Component } from "solid-js"
import { match } from "ts-pattern"
import { register } from "./Register"
import { login } from "./Login"
import { db } from "../db"
import { mainApp } from "../App"
import { AdminView } from "./Admin"
import { Home } from "./Home"
import { Settings } from "./Settings"

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
			<a class="icon item"
				role="button" onClick={toggleSidebar}
				tabindex="0" onKeyDown={
					event => match(event.key)
						.with("Enter", () => $("#sidebar").sidebar("show"))
						.with("Escape", () => $("#sidebar").sidebar("hide"))
				}>
				<i class="bars icon" />
			</a>
			<div class="ui right vertical sidebar menu" id="sidebar">
				<a class="item" onClick={app_goto(Home)}>
					主页
				</a>
				<a class="item" onClick={app_goto(Settings)}>
					设置
				</a>
				<Show when={db.auth.get()?.roles.some(t => t.type === "admin")}>
					<a class="item" onClick={app_goto(() => <AdminView />)}>
						管理
					</a>
				</Show>
				<a class="item" onClick={sidebar_logout}>
					登出
				</a>
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
							<a class="ui item" onClick={sidebar_login}>
								登陆
							</a>
							<a class="ui item" onClick={sidebar_register}>
								注册
							</a>
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