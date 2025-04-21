import { Show, splitProps } from "solid-js"
import { JSX } from "solid-js/jsx-runtime"

export const FormField = (props: {
	label: string,
	name?: string,
	type?: "text" | "password",
	placeholder?: string,
}) => {
	const label = props.label
	const name = props.name ?? props.label
	const type = props.type ?? "text"
	const placeholder = props.placeholder ?? props.label

	return (
		<div class="field">
			<label>
				{label}
				<input type={type} name={name} placeholder={placeholder} />
			</label>
		</div>
	)
}

export const Loader = () => <div class="ui segment">
	<div style={{ "height": "100px" }} />
	<div class="ui dimmer inverted active">
		<div class="ui text loader" />
	</div>
</div>

export const LinkButton = (props: {
	label: string,
	onClick: () => void,
} & JSX.HTMLAttributes<HTMLAnchorElement>) => {
	const [local, rest] = splitProps(props, ["label", "onClick"])
	return (
		<a class="item" {...rest} role="button" tabindex="0"
			onClick={local.onClick}
			onKeyDown={event => {
				if (event.key === "Enter") {
					local.onClick()
				}
			}}>
			{local.label}
		</a>
	)
}

export const ErrorMessage = (props: {
	message: string | null | undefined,
} & JSX.HTMLAttributes<HTMLDivElement>) => {
	const [local, rest] = splitProps(props, ["message"])
	return (
		<Show when={local.message}>
			<div class="ui error message" {...rest}>
				{local.message}
			</div>
		</Show>
	)
}

export type MessageProps = {
	type: null,
} | {
	type: "info" | "error" | "success" | "warning",
	message: string,
}

export const Message = (props: MessageProps & JSX.HTMLAttributes<HTMLDivElement>) => {
	if (props.type === null) {
		return <> </>
	}
	else {
		const [local, rest] = splitProps(props, ["type", "message"])
		return (
			<div class={`ui message visible ${props.type}`} {...rest}>
				<p> {local.message} </p>
			</div>
		)
	}
}