import type { Component } from "solid-js"

import styles from "./App.module.css"

import { DB } from "./db"

const App: Component = () => {
	return (
		<div class={styles.App}>
			<p>
				Edit <code>src/App.tsx</code> and save to reload.
			</p>
		</div>
	)
}

export default App

// test

console.log(await new DB("//127.0.0.1:3000").api.test_auth_echo({ data: "echo data "}))