import { Auth, User } from "api"
import { Accessor, createEffect, createSignal, Setter } from "solid-js"
import { match } from "ts-pattern"
import { api } from "./api"
import { Signal } from "./util"

export class PersistentSignal<T> {
	readonly get: Accessor<T | null>
	readonly set: Setter<T | null>

	constructor(id: string) {
		[this.get, this.set] = createSignal<T | null>(
			match(localStorage.getItem(id))
				.with(null, () => null)
				.otherwise(str => JSON.parse(str) as T)
		)
		createEffect(() => {
			match(this.get())
				.with(null, () => localStorage.removeItem(id))
				.otherwise(data => localStorage.setItem(id, JSON.stringify(data)))
		})
	}

	async get_with(refresh: () => Promise<T>): Promise<T> {
		const data = this.get()
		if (data === null) {
			const data = await refresh()
			this.set(() => data)
			return data
		}
		else {
			return data
		}
	}

	unset() {
		this.set(null)
	}
}

class DB {
	auth: PersistentSignal<Auth>
	user: Signal<User | null>

	constructor() {
		this.auth = new PersistentSignal("auth")
		this.user = new Signal<User | null>(null)
		createEffect(async () => {
			this.user.set(
				await match(this.auth.get())
					.with(null, () => null)
					.otherwise(auth => api.get_user(auth.id))
			)
		})
	}
}

export const db = new DB()