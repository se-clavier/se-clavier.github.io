import type { Component } from "solid-js"
import { LoginModal } from "./component/Login"
import { RegisterModal } from "./component/Register"
import { TopBar, SideBar } from "./component/Menu"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"

const App: Component = () => {
	return (
		<>
			<SideBar />
			<div class="pusher">
				<TopBar />
			</div>
			<LoginModal />
			<RegisterModal />
		</>
	)
}

export default App