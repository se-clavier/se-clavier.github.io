import type { Component } from "solid-js"
import { LoginModal } from "./component/Login"
import { RegisterModal } from "./component/Register"
import { TopBar, SideBar } from "./component/Menu"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"
import styles from "./App.module.css"

const App: Component = () => {
	return (
		<>
			<TopBar/>
			<SideBar/>
			<div class="ui container" style="margin-top: 53px; height: calc(100% - 53px); overflow-y: auto;">
				<div class={styles.App}>
					<p>
						Edit <code>src/App.tsx</code> and save to reload.
					</p>
				</div>
			</div>
			<LoginModal/>
			<RegisterModal/>
		</>
	)
}

export default App