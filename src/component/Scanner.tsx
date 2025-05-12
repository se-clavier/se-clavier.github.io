import { Html5Qrcode } from "html5-qrcode"
import { onCleanup, onMount } from "solid-js"

export interface ScannerProps {
	id: string,
	onScanned: (text: string) => Promise<void>,
	onError: (error: string) => void,
}

export const Scanner = (props: ScannerProps) => {
	let scanner: Html5Qrcode | null = null
	let scannerRef: HTMLDivElement | undefined
	const start = async () => {
		scanner = new Html5Qrcode(scannerRef!.id)
		await Html5Qrcode.getCameras().then(async devices => {
			if (devices.length) {
				const cameraId = devices[0].id
				await scanner!.start(
					cameraId, 
					{ qrbox: 200, fps: 10 },
					async text => {
						props.onScanned(text).catch()
						await scanner?.stop().catch()
					},
					() => {}
				)
			} else {
				props.onError("未检测到摄像头")
			}
		}).catch(props.onError)
	}
	onMount(start)
	onCleanup(async () => {
		await scanner?.stop().catch()
	})
	return {
		start,
		component: (
			<div id={props.id} ref={scannerRef} />
		)
	}
}