import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import inject from "@rollup/plugin-inject"

export default defineConfig({
	plugins: [
		solidPlugin(),
		inject({
			jQuery: "jquery",
			$: "jquery",
		})
	],
	server: {
		port: 3100,
	},
	build: {
		target: "esnext"
	},
})
