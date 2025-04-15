import { Component, createSignal } from "solid-js"
import { Dynamic } from "solid-js/web"

export type MenuItem = {
	name: string,
	component: Component,
}

export const MenuViewer: Component<MenuItem[]> = (props: MenuItem[]) => {
	const [current, setCurrent] = createSignal(0)

	return (
		<>
			<div class="ui top attached tabular menu">
				{props.map((item, index) => (
					<a classList={{
						item: true,
						active: index === current(),
					}} role="button" onClick={() => {
						setCurrent(index)
					}}>
						{item.name}
					</a>
				))}
			</div>
			<div class="ui bottom attached segment">
				<Dynamic component={props[current()].component} />
			</div>
		</>
	)
}