import { api } from "./api"

function cached<T>(f: () => Promise<T>) {
	let val: T | null = null
	let ready = false
	return async () => {
		if (!ready) {
			val = await f()
			ready = true
		}
		return val as T
	}
}

export class DB {
	public api
	public user = cached(() => this.api.register({
		username: "admin",
		password: "123456"
	}))

	constructor(backend: string) {
		this.api = api(backend, async () => (await this.user()).token)
	}
}