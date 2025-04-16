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