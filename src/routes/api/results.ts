import type {RequestHandler} from '@sveltejs/kit'
import { getPicks, getGameIds, Picks } from '$lib/services/firebase'
import { Game, getGameInfo } from '$lib/services/espn'
import axios from 'axios'

const calculateWinPcts = (games: Game[], picks: Picks, numSims: number) => {
    const winPcts = {}
}

const simUrl = 'https://us-central1-nfl-pickems-5e76c.cloudfunctions.net/simulate'

export const get: RequestHandler = async ({ params }) => {
    const gameIds = await getGameIds()
    const games: Game[] = []
    let picks: Picks = {}

    const promises = []
    promises.push(getPicks().then(p => picks = p))
    for (const gameId of gameIds) {
        promises.push(getGameInfo(gameId).then(game => games.push(game)))
    }
    await Promise.all(promises)

    const response = await axios.post(simUrl, {
        games, picks,
        numSims: 10
    })

    return {
        body: {
            games,
            picks,
            winPcts: response.data
        }
    }
}
