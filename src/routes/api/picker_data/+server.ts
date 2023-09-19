import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { type Game, getGameInfo, getMatchups } from '$lib/services/espn'
import {
	getGameIds,
	getPicks,
	getPicksForUser,
	hasGame,
	type Picks,
	setGames
} from '$lib/services/firebase'

export const GET: RequestHandler = async ({ url }) => {
	const week = url.searchParams.get('week')
	let matchups = await getMatchups(week)

	const games: Game[] = []
	let allPicks: Picks = {}

	const promises = []
	promises.push(
		getPicks(week).then((p) => {
			allPicks = p
		})
	)

	const gameIds = await getGameIds(week)
	for (const gameId of gameIds) {
		promises.push(
			getGameInfo(gameId).then((game) => {
				games.push(game)
			})
		)
	}
	await Promise.all(promises)

	const gameDocsExist = await hasGame(week, matchups[0].id)
	if (!gameDocsExist) {
		await setGames(week, matchups)
	}

	let picks
	if (url.searchParams.has('uid')) {
		picks = await getPicksForUser(url.searchParams.get('uid'), week)
	}

	if (picks) {
		for (const matchup of matchups) {
			if (picks[matchup.id]) {
				const pick = picks[matchup.id]
				matchup.pick = pick.pick
				matchup.weight = pick.weight
			}
		}

		matchups = matchups.sort((a, b) => {
			if (a.weight > b.weight) return -1
			if (a.weight < b.weight) return 1
			return 0
		})
	}

	return json({
		matchups,
		games,
		allPicks
	})
}
