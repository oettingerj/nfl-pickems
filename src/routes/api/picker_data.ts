import type { RequestHandler } from '@sveltejs/kit'
import { getPlayers } from '$lib/services/firebase'
import { getMatchups } from '$lib/services/espn'

export const get: RequestHandler = async () => {
    const players = await getPlayers()
    const matchups = await getMatchups(5)

    return {
        body: {
            players, matchups
        }
    }
}
