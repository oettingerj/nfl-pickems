import { redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'
import { isLoggedIn } from '$lib/services/firebase'
import { browser } from '$app/environment'

export const load: LayoutLoad = async ({ url }) => {
	if (!browser || url.pathname === '/login') {
		return {}
	}

	const loggedIn = await isLoggedIn()
	if (loggedIn) {
		return {}
	}

	throw redirect(307, `/login?next=${url.pathname}`)
}
