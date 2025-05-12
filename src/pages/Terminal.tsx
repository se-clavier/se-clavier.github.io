import { api } from "../api"
import { createResource, onCleanup, onMount } from "solid-js"
import { ResourceLoader } from "../lib/common"
import { QRCodeSVG } from "solid-qr-code"

export const Terminal = () => {
	const [codeContent, { refetch }] = createResource(async () => {
		const res = await api.terminal_credential({})
		return JSON.stringify(res.auth)
	})

	let intervalId: number
	onMount(() => intervalId = setInterval(refetch, 30 * 1000))
	onCleanup(() => clearInterval(intervalId))

	return (
		<div class="ui container">
			<div class="ui center aligned segment">
				<h4 class="ui header">扫描以下二维码签到 / 签退，时效 5 分钟</h4>
				<ResourceLoader resource={codeContent} render={(content) => (
					<QRCodeSVG
						value={content}
						level='medium'
						backgroundColor="#ffffff"
						backgroundAlpha={1}
						foregroundColor="#000000"
						foregroundAlpha={1}
						width={200}
						height={200}
					/>
				)} />
				<div class="ui divider" />
				<button class="ui button" onClick={refetch}>刷新</button>
			</div>
		</div>
	)
}