import { createEffect, type Component } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Signal } from "./util"
import { db } from "./db"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"

import { Home } from "./pages/Home"
import { LoginModal } from "./component/Login"
import { RegisterModal } from "./component/Register"
import { Settings } from "./pages/Settings"
import { TopBar } from "./component/Menu"
import { Admin } from "./pages/Admin"
import { Terminal } from "./pages/Terminal"

const NoLogin: Component = () => <div class="ui error message"> 请登录 </div>
export const mainApp = new Signal<Component>(NoLogin)

type Page = {
	id: string,
	name: string,
	component: Component,
}

class Router {
	page: Signal<{
		list: Page[],
		current: Component,
	}>

	constructor() {
		const pages: { [key: string]: Page[] } = {
			nologin: [
				{ id: "nologin", name: "请登录", component: NoLogin, },
			],
			user: [
				{ id: "home", name: "主页", component: () => Home({ user: db.user.get()! }), },
				{ id: "settings", name: "设置", component: Settings, },
			],
			admin: [
				{ id: "admin", name: "管理", component: Admin, },
			],
			terminal: [
				{ id: "terminal", name: "终端", component: Terminal, },
			]
		}
		// initial page
		this.page = new Signal({
			list: pages.nologin,
			current: pages.nologin[0].component,
		})

		// filter pages by role
		createEffect(() => {
			const list = (db.user.get()?.auth.roles ?? [{ type: "nologin" }]).flatMap(role => pages[role.type])
			this.page.set({
				list,
				current: list[0]?.component ?? (() => "no such page"),
			})
		})
	}

	goto(id: string) {
		this.page.set(({ list }) => ({
			list,
			current: list.find(page => page.id === id)?.component ?? (() => "no such page"),
		}))
	}
}

export const router = new Router()

const App: Component = () => {
	return (
		<>
			<div class="pusher">
				<TopBar />
				<div class="ui container">
					<Dynamic component={router.page.get().current} />
				</div>
			</div>
			<LoginModal />
			<RegisterModal />
		</>
	)
}

export default App