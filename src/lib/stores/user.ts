import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type { UserInfo } from 'firebase/auth'

export const user: Writable<UserInfo> = writable({
    displayName: null,
    email: null,
    phoneNumber: null,
    photoURL: null,
    providerId: null,
    uid: null
})
