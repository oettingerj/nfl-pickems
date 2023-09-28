import { redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'
import { getLoggedInUser, getUser } from '$lib/services/firebase'
import { browser } from '$app/environment'
import { get } from 'svelte/store'
import { user } from '$lib/stores/user'

export const load: LayoutLoad = async ({ url }) => {
	if (!browser || url.pathname === '/login') {
		return {}
	}

	const loggedInUser = await getLoggedInUser()
	if (loggedInUser) {
		if (!get(user).id) {
			const fbUser = await getUser(loggedInUser.uid)
			user.set(fbUser)
		}
		return {}
	}

	throw redirect(307, `/login?next=${url.pathname}`)
}
