import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { getPicks, getGameIds, getPlayers } from '$lib/services/firebase'
import type { Picks } from '$lib/services/firebase'
import { getGameInfo } from '$lib/services/espn'
import type { Game } from '$lib/services/espn'
import axios from 'axios'
import { NUM_SIMS, SIM_URL } from '../../../lib/constants/simulation.js'

export const GET: RequestHandler = async ({ url }) => {
	const week = url.searchParams.get('week')
	const gameIds = await getGameIds(week)
	const games: Game[] = []
	let picks: Picks = {}
	let players = []

	const promises = []
	promises.push(
		getPicks(week).then((p) => {
			picks = p
		})
	)
	promises.push(
		getPlayers().then((p) => {
			players = p.map((player) => ({
				...player,
				shortName:
					player.displayName ?? player.name?.split(/(\s+)/)[0] ?? player.id
			}))
		})
	)

	for (const gameId of gameIds) {
		promises.push(
			getGameInfo(gameId).then((game) => {
				games.push(game)
			})
		)
	}
	await Promise.all(promises)

	games.sort((a, b) => (a.time > b.time ? 1 : -1))

	const response = await axios.post(SIM_URL, {
		games,
		picks,
		numSims: NUM_SIMS
	})

	return json({
		games,
		picks,
		players,
		winPcts: response.data.winPcts,
		scores: response.data.scores
	})
}
