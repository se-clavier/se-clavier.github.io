import { createSignal, type Component } from "solid-js"
import { register } from "./Register"
import { login } from "./Login"
import { match } from "ts-pattern"
import { db } from "../db"
import { api, User } from "../api"

const [user, set_user] = createSignal<User | null>(null);

(async () => {
	const auth = await db.auth.get()
	if (auth) {
		set_user(await api.get_user(auth.id))
	}
})()

export const SideBar: Component = () => {
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

	const sidebar_logout = () => {
		db.auth.unset()
		set_user(null)
	}

	return (
		<div class="ui right vertical sidebar menu" id="sidebar">
			{match(user())
				.with(null, () => (
					<a class="item">
						<div class="ui fluid buttons">
							<button class="ui button" onClick={sidebar_login}>登录</button>
							<button class="ui primary button" onClick={sidebar_register}>注册</button>
						</div>
					</a>
				))
				.otherwise(user => (
					<>
						<a class="item">欢迎你，{user.username}</a>
						<a class="item">
							<button class="ui fluid button" onClick={sidebar_logout}>
								注销
							</button>
						</a>
					</>
				))
			}
		</div>
	)
}

function toggleSidebar() {
	$("#sidebar").sidebar("toggle")
}

export const TopBar: Component = () => {
	return (
		<div class="ui borderless top fixed menu">
			<div class="ui container">
				<a class="item" href="/">
					<img alt="" src="https://avatars.githubusercontent.com/u/199693511" />
					<div>Clavier</div>
				</a>
				<div class="right menu">
					{match(user())
						.with(null, () => <></>)
						.otherwise(user => (
							<div class="item">{user.username}</div>
						))
					}
					<a class="icon item"
						role="button" onClick={toggleSidebar}
						tabindex="0" onKeyDown={
							event => match(event.key)
								.with("Enter", () => $("#sidebar").sidebar("show"))
								.with("Escape", () => $("#sidebar").sidebar("hide"))
						}>
						<i class="bars icon" />
					</a>
				</div>
			</div>
		</div>
	)
}