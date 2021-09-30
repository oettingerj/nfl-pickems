import axios from 'axios'

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

export type Game = {
    id: string,
    home: string,
    away: string,
    teams: {
        [team: string]: {
            winPct?: number
        }
    }
}

export const getGameInfo = async (gameId) => {
    const response = await axios.get(`${BASE_URL}/summary?event=${gameId}`)
    const data = response.data
    const gameInfo: Game = {
        id: gameId,
        home: data.boxscore.teams[1].team.abbreviation,
        away: data.boxscore.teams[0].team.abbreviation,
        teams: {}
    }

    gameInfo.teams = {
        [gameInfo.home]: {},
        [gameInfo.away]: {}
    }

    if (!data.winprobability) {
        gameInfo.teams[gameInfo.home].winPct = parseFloat(data.predictor.homeTeam.gameProjection) / 100
        gameInfo.teams[gameInfo.away].winPct = parseFloat(data.predictor.awayTeam.gameProjection) / 100
    } else {
        const winPcts = data.winprobability[data.winprobability.length - 1]
        let homeWinPct = parseFloat(winPcts.homeWinPercentage)
        // Round to 2 decimals
        homeWinPct = Math.round((homeWinPct + Number.EPSILON) * 100) / 100

        const awayWinPct = 1 - homeWinPct
        gameInfo.teams[gameInfo.home].winPct = homeWinPct
        gameInfo.teams[gameInfo.away].winPct = awayWinPct
    }

    return gameInfo
}
