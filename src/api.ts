import { API, APICollection, Auth } from "../api"
import { login } from "./component/Login"
export type * from "../api"

async function api_call(req: APICollection) {
	const header = await fetch(import.meta.env.VITE_API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req)
	})
	if (!header.ok) {
		throw new Error(`api fatal error: ${header.status} ${header.statusText}`)
	}
	return header.json()
}

async function get_auth(refresh: boolean): Promise < Auth > {
	const { db } = await import("./db")
	if(refresh) {
		return db.auth.set(await login())
	} else {
		return db.auth.get_with(() => login())
	}
}

export const api = new API(api_call, get_auth)