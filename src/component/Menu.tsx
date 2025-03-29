import { Show, type Component } from "solid-js"
import { register } from "./Register"
import { login } from "./Login"

export const SideBar: Component = () => {
	return (
		<div class="ui right vertical sidebar menu" id="sidebar">
			<Show
				when={true} // TODO: replace with user login status
				fallback={
					<a class="item">
						<div class="ui fluid buttons">
							<button class="ui button" onClick={login}>登录</button>
							<button class="ui primary button" onClick={register}>注册</button>
						</div>
					</a>
				}
			>
				<a class="item">欢迎你，username</a>
				<a class="item">
					<button class="ui fluid button"> {/*TODO: onClick={logout}*/}
						注销
					</button>
				</a>
			</Show>
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
					<img src="https://avatars.githubusercontent.com/u/199693511"/>
					<div>Clavier</div>
				</a>
				<div class="right menu">
					<a class="icon item" onClick={toggleSidebar}>
						<i class="bars icon"/>
					</a>
				</div>
			</div>
		</div>
	)
}