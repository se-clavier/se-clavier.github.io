export const form_field = (props: {
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