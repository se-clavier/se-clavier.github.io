import { type Component } from "solid-js"
import { Dynamic } from "solid-js/web"
import { LoginModal } from "./component/Login"
import { RegisterModal } from "./component/Register"
import { TopBar } from "./component/Menu"
import { Home } from "./pages/Home"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"
import { Signal } from "./util"


export const mainApp = new Signal<Component>(Home)

const App: Component = () => {
	return (
		<>
			<div class="pusher">
				<TopBar />
				<div class="ui container">
					<Dynamic component={mainApp.get()} />
				</div>
			</div>
			<LoginModal />
			<RegisterModal />
		</>
	)
}

export default App