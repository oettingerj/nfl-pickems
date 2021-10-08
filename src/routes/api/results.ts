import type { RequestHandler } from '@sveltejs/kit'
import { getPicks, getGameIds, getPlayers } from '$lib/services/firebase'
import type { Picks } from '$lib/services/firebase'
import { getGameInfo } from '$lib/services/espn'
import type { Game } from '$lib/services/espn'
import axios from 'axios'

const simUrl = 'https://us-central1-nfl-pickems-5e76c.cloudfunctions.net/simulate'

export const get: RequestHandler = async () => {
    const gameIds = await getGameIds()
    const games: Game[] = []
    let picks: Picks = {}
    let players = {}

    const promises = []
    promises.push(getPicks().then((p) => {
        picks = p
    }))
    promises.push(getPlayers().then((p) => {
        players = p
    }))

    for (const gameId of gameIds) {
        promises.push(getGameInfo(gameId).then((game) => {
            if (game.teams[game.home].winPct === 1) {
                game.winner = game.home
            } else if (game.teams[game.away].winPct === 1) {
                game.winner = game.away
            }
            games.push(game)
        }))
    }
    await Promise.all(promises)

    games.sort((a, b) => (a.time > b.time) ? 1 : -1)

    const response = await axios.post(simUrl, {
        games,
        picks,
        numSims: 5000
    })

    return {
        body: {
            games,
            picks,
            players,
            winPcts: response.data.winPcts,
            scores: response.data.scores
        }
    }
}
