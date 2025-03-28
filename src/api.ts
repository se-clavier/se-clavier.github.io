import { match, Pattern } from "ts-pattern"
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

function get_auth(): (refresh: boolean) => Promise<Auth> {
	let auth: Auth | null = match(localStorage.getItem("auth"))
		.with(null, () => null)
		.with(Pattern.string, str => JSON.parse(str))
		.exhaustive()

	return async (refresh: boolean): Promise<Auth> => {
		if (auth === null || refresh) {
			auth = await login()
			localStorage.setItem("auth", JSON.stringify(auth))
		}
		return auth
	}
}

export const api = new API(api_call, get_auth())