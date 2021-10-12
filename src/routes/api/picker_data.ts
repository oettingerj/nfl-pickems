import type { RequestHandler } from '@sveltejs/kit'
import { getMatchups } from '$lib/services/espn'
import { getPicksForUser, hasGame, setGames } from '$lib/services/firebase'
import { orderBy } from 'lodash-es'

export const get: RequestHandler = async ({ query }) => {
    const week = query.get('week')
    let matchups = await getMatchups(week)

    const gameDocsExist = await hasGame(week, matchups[0].id)
    if (!gameDocsExist) {
        await setGames(week, matchups)
    }

    let picks
    if (query.has('uid')) {
        picks = await getPicksForUser(query.get('uid'), week)
    }

    if (picks) {
        for (const matchup of matchups) {
            if (picks[matchup.id]) {
                const pick = picks[matchup.id]
                matchup.pick = pick.pick
                matchup.weight = pick.weight
            }
        }

        matchups = orderBy(matchups, 'weight', 'desc')
    }

    return {
        body: {
            matchups
        }
    }
}
