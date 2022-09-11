import type { PageLoad } from './$types'
import { getSubmissionLock, getWeeks } from '$lib/services/firebase'

export const load: PageLoad = async ({ fetch, url }) => {
	const weeks = await getWeeks()
	const currentWeek = weeks[weeks.length - 1]
	const submissionLock = await getSubmissionLock(currentWeek)
	if (Date.now() >= submissionLock) {
		return {
			submissionLock
		}
	}

	const query = url.searchParams

	let apiUrl = `/api/picker_data?week=${currentWeek}`
	if (query.has('uid')) {
		apiUrl = apiUrl.concat(`&uid=${query.get('uid')}`)
	}

	const response = await fetch(apiUrl).then((res) => res.json())

	return {
		submissionLock,
		matchups: response.matchups,
		games: response.games,
		allPicks: response.allPicks,
		currentWeek
	}
}
