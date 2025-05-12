import { type Component } from "solid-js"
import { match } from "ts-pattern"
import { register } from "./Register"
import { login } from "./Login"
import { db } from "../db"
import { router } from "../App"
import { LinkButton } from "../lib/common"

const app_goto = (app: string) => {
	return () => {
		router.goto(app)
		$("#sidebar").sidebar("hide")
	}
}

export const CheckinButton = () => {
	// TODO[Early]: Finish CheckinComponent
	const checkin = async () => {
	}

	return (
		<LinkButton onClick={checkin} label={<i class="fitted expand icon" />} />
	)
}

export const SideBar: Component = () => {
	const sidebar_logout = () => {
		db.auth.unset()
		app_goto("home")()
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
				<i class="fitted bars icon" />
			</a>
			<div class="ui right vertical sidebar menu" id="sidebar">
				{router.page.get().list.map(page => (
					<LinkButton label={page.name} onClick={app_goto(page.id)} />
				))}
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
							<CheckinButton />
							{/* This SideBar component will be moved by FomanticJS, so it cannot handle signal */}
							{/* TODO: use other component that will not be moved */}
							<SideBar />
						</div>
					))}
			</div>
		</div>
	)
}