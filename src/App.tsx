import type { Component } from "solid-js"
import { LoginModal, showLoginModal } from "./component/Login"

import "fomantic-ui-css/semantic.min.css"
import "fomantic-ui-css/semantic.min.js"
import styles from "./App.module.css"

const App: Component = () => {
	return (
		<>
			<div class={styles.App}>
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<button onClick={showLoginModal}>登录</button>
			</div>
			<LoginModal/>
		</>
	)
}

export default App