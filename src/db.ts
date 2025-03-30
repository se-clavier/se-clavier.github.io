import { Auth } from "api"
import { match, Pattern } from "ts-pattern"

class PersistentStorage<T> {
	private readonly id: string

	constructor(id: string) {
		this.id = id
	}

	get(): T | null {
		return match(localStorage.getItem(this.id))
			.with(null, () => null)
			.with(Pattern.string, str => JSON.parse(str))
			.exhaustive()
	}
	
	set(data: T): T {
		localStorage.setItem(this.id, JSON.stringify(data))
		return data
	}
	
	async get_with(refresh: () => Promise<T>): Promise<T> {
		const data = this.get()
		if (data === null) {
			const data = await refresh()
			return this.set(data)
		}
		else {
			return data
		}
	}
	
	unset() {
		localStorage.removeItem(this.id)
	}
}

class DB {
	auth: PersistentStorage<Auth>

	constructor() {
		this.auth = new PersistentStorage("auth")
	}
}

export const db = new DB()