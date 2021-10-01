import type {RequestHandler} from '@sveltejs/kit'
import { getPicks, getGameIds } from '$lib/services/firebase'
import type {Picks} from '$lib/services/firebase'
import { getGameInfo } from '$lib/services/espn'
import type {Game} from '$lib/services/espn'
import axios from 'axios'

const calculateWinPcts = (games: Game[], picks: Picks, numSims: number) => {
    const winPcts = {}
}

let simUrl
simUrl = 'https://us-central1-nfl-pickems-5e76c.cloudfunctions.net/simulate'
// simUrl = 'http://localhost:8080/simulate'

export const get: RequestHandler = async ({  }) => {
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
        numSims: 5000
    })

    return {
        body: {
            games,
            picks,
            winPcts: response.data
        }
    }
}
