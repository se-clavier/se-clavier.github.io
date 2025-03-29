import type { Component } from "solid-js"
import { LoginModal, login } from "./component/Login"
import { RegisterModal, register } from "./component/Register"
import { TopBar, SideBar } from "./component/Menu"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"
import styles from "./App.module.css"

const App: Component = () => {
	const trylogin = () => {
		login().then(token => {
			console.log("登录成功:", token)
		}).catch(err => {
			console.log("登录失败:", err)
		})
	}
	const tryregister = () => {
		register().then(token => {
			console.log("注册成功，token:", token)
		}).catch(err => {
			console.log("注册失败:", err)
		})
	}

	return (
		<>
			<TopBar/>
			<SideBar/>
			<div class="ui container" style="margin-top: 53px; height: calc(100% - 53px); overflow-y: auto;">
				<div class={styles.App}>
					<p>
						Edit <code>src/App.tsx</code> and save to reload.
					</p>
					<button onClick={trylogin}>登录</button>
					<button onClick={tryregister}>注册</button>
				</div>
			</div>
			<LoginModal/>
			<RegisterModal/>
		</>
	)
}

export default App