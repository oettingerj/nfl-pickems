import type { RequestHandler } from '@sveltejs/kit'
import { Game, getGameInfo, getMatchups } from '$lib/services/espn'
import { getGameIds, getPicks, getPicksForUser, hasGame, Picks, setGames } from '$lib/services/firebase'
import { orderBy } from 'lodash-es'

export const get: RequestHandler = async ({ query }) => {
    const week = query.get('week')
    let matchups = await getMatchups(week)

    const games: Game[] = []
    let allPicks: Picks = {}

    const promises = []
    promises.push(getPicks(week).then((p) => {
        allPicks = p
    }))

    const gameIds = await getGameIds(week)
    for (const gameId of gameIds) {
        promises.push(getGameInfo(gameId).then((game) => {
            games.push(game)
        }))
    }
    await Promise.all(promises)

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
            matchups,
            games,
            allPicks
        }
    }
}
