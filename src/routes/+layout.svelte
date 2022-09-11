<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	import { isLoggedIn } from '$lib/services/firebase'
	import { browser } from '$app/env'

	export const load: Load = async ({ url }) => {
		if (!browser || url.pathname === '/login') {
			return {}
		}

		const loggedIn = await isLoggedIn()
		if (loggedIn) {
			return {}
		}

		return {
			redirect: `/login?next=${url.pathname}`,
			status: 307
		}
	}
</script>

<script lang="ts">
	import '../app.css'
</script>

<div class="min-h-screen bg-gray-50">
	<slot />
</div>
