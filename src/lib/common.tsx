import { JSX, splitProps } from "solid-js"

export const FormInput = (props: {
	label: string,
} & JSX.InputHTMLAttributes<HTMLInputElement>) => {
	const [local, rest] = splitProps(props, ["label"])
	return (
		<div class="field">
			<label>
				{local.label}
				<input {...rest} />
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
	label: JSX.Element,
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