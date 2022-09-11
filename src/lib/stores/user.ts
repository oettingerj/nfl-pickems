import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type { FirebaseUser } from '$lib/services/firebase'

export const user: Writable<FirebaseUser> = writable({
	name: null,
	email: null,
	photoURL: null,
	id: null
})
