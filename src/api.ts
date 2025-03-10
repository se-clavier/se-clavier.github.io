import { API, APICollection } from "../api"

const api_call = (backend: string) => async (req: APICollection) => {
	const header = await fetch(backend, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req)
	})
	if (!header.ok) {
		throw new Error(`api fatal error: ${header.status} ${header.statusText}`)
	}
	return header.json()
}

export const api = (backend: string, token: () => Promise<string>) => new API(api_call(backend), token)