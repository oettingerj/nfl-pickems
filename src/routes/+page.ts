import type { PageLoad } from './$types'
import {
	getSubmissionLock,
	getSubmissions,
	getWeeks
} from '$lib/services/firebase'
import { DateTime } from 'luxon'

export const load: PageLoad = async ({ fetch, url, parent }) => {
	await parent()

	const weeks = await getWeeks()
	const currentWeek = weeks[weeks.length - 1]
	let selectedWeek = url.searchParams.get('week')
	const submissionLock = await getSubmissionLock(currentWeek)
	const areSubmissionsLocked = Date.now() >= submissionLock
	if (
		(!selectedWeek && !areSubmissionsLocked) ||
		(!areSubmissionsLocked && selectedWeek === currentWeek)
	) {
		const submissions = await getSubmissions(currentWeek)

		return {
			weeks,
			currentWeek,
			areSubmissionsLocked,
			submissions,
			lockTime: DateTime.fromMillis(submissionLock)
		}
	}

	if (!selectedWeek) {
		selectedWeek = currentWeek
	}

	const response = await fetch(`/api/results?week=${selectedWeek}`).then(
		(res) => res.json()
	)

	return {
		weeks,
		currentWeek,
		selectedWeek,
		areSubmissionsLocked,
		games: response.games,
		picks: response.picks,
		winPcts: response.winPcts,
		scores: response.scores,
		players: response.players
	}
}
