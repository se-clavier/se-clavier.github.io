import { createSignal, JSX, type Component } from "solid-js"
import { match } from "ts-pattern"
import { register } from "./Register"
import { login } from "./Login"
import { db } from "../db"
import { api, User } from "../api"
import { setMainApp } from "../App"

const [user, set_user] = createSignal<User | null>(null);

(async () => {
	const auth = await db.auth.get()
	if (auth) {
		set_user(await api.get_user(auth.id))
	}
})()

export const SideBar: Component = () => {
	const sidebar_logout = () => {
		db.auth.unset()
		set_user(null)
		$("#sidebar").sidebar("hide")
	}

	const app_goto = (app: () => JSX.Element) => {
		return () => {
			setMainApp(app())
			$("#sidebar").sidebar("hide")
		}
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
				<a class="item" onClick={app_goto(() => <div> Home </div>)}>
					主页
				</a>
				<a class="item" onClick={app_goto(() => <div> Settings </div>)}>
					设置
				</a>
				<a class="item" onClick={app_goto(() => <div> Admin </div>)}>
					管理
				</a>
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
		const auth = await login()
		db.auth.set(auth)
		set_user(await api.get_user(auth.id))
	}

	const sidebar_register = async () => {
		const auth = await register()
		db.auth.set(auth)
		set_user(await api.get_user(auth.id))
	}

	return (
		<div class="ui borderless top menu">
			<div class="ui container">
				<a class="item" href="/">
					<img alt="" src="https://avatars.githubusercontent.com/u/199693511" />
					<div>Clavier</div>
				</a>
				{match(user())
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