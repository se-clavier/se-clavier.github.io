import { Html5Qrcode } from "html5-qrcode"
import { onCleanup, onMount } from "solid-js"

export interface ScannerProps {
	id: string,
	onScanned: (text: string) => void,
	onError: (error: string) => void,
}

export const Scanner = (props: ScannerProps) => {
	let scanner: Html5Qrcode | null = null
	let scannerRef: HTMLDivElement | undefined
	onMount(() => {
		scanner = new Html5Qrcode(scannerRef!.id)
		Html5Qrcode.getCameras().then(devices => {
			if (devices.length) {
				const cameraId = devices[0].id
				scanner!.start(
					cameraId, 
					{ qrbox: 200, fps: 10 },
					text => {
						props.onScanned(text)
						scanner?.stop().catch(props.onError)
					},
					() => {}
				)
			} else {
				props.onError("未检测到摄像头")
			}
		}).catch(props.onError)
	})
	onCleanup(() => {
		scanner?.stop().catch(console.error)
	})
	return (
		<div id={props.id} ref={scannerRef} />
	)
}