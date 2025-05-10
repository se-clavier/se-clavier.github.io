import { JSX, Resource, splitProps } from "solid-js"
import { match } from "ts-pattern"
import { Signal } from "../util"

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

export const ResourceLoader = <T,>(props: {
	resource: Resource<T>,
	render: (data: T) => JSX.Element,
}) => {
	return <>
		{
			match(props.resource.error)
				.with(undefined, () => match(props.resource())
					.with(undefined, () => <Loader />)
					.otherwise(props.render))
				.otherwise(error => <Message type="error" message={"" + error} />)
		}
	</>
}

export class SubmitStatus {
	loading: Signal<boolean>
	message: Signal<MessageProps>
	onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent, JSX.EventHandler<HTMLButtonElement, MouseEvent>>

	constructor(onClick: (e: MouseEvent) => Promise<string>) {
		this.loading = new Signal(false)
		this.message = new Signal<MessageProps>({ type: null })
		this.onClick = async (...e) => {
			this.loading.set(true)
			this.message.set({ type: null })
			try {
				const result = await onClick(...e)
				this.loading.set(false)
				this.message.set({ type: "success", message: result })
			} catch (error) {
				this.loading.set(false)
				this.message.set({ type: "error", message: "" + error })
			}
		}
	}
}

export const SubmitField = (props: SubmitStatus) => <>
	<div class="ui center aligned" style={{ "text-align": "center" }}>
		<button class="ui button"
			classList={{ loading: props.loading.get() }}
			onClick={props.onClick}> 提交 </button>
	</div>
	{Message(props.message.get())}
</>