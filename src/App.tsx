import { createSignal, type Component } from "solid-js"
import { LoginModal } from "./component/Login"
import { RegisterModal } from "./component/Register"
import { TopBar } from "./component/Menu"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"

const [mainApp, _setMainApp] = createSignal(<div> initial </div>)
export const setMainApp = _setMainApp

const App: Component = () => {
	return (
		<>
			<div class="pusher">
				<TopBar />
				<div class="ui container">
					{mainApp()}
				</div>
			</div>
			<LoginModal />
			<RegisterModal />
		</>
	)
}

export default App