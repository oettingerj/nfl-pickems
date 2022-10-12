import axios from 'axios'
import { DateTime } from 'luxon'

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

export interface Game {
	id: string
	home: string
	away: string
	time: DateTime
	teams: {
		[team: string]: {
			winPct?: number
		}
	}
	winner?: string
}

export interface Team {
	name: string
	abbr: string
	color: string
	logo: string
	record: string
}

export interface Matchup {
	id: string
	odds: string
	teams: Team[]
	pick?: string
	weight?: number
}

export const getMatchups = async (week) => {
	const response = await axios.get(`${BASE_URL}/scoreboard?week=${week}`)
	const games = response.data.events
	const matchups: Matchup[] = []

	for (const game of games) {
		const teams = game.competitions[0].competitors
		const teamData = []
		for (let team of teams) {
			teamData.push({
				name: team.team.name,
				abbr: team.team.abbreviation,
				color: team.team.color,
				logo: team.team.logo,
				record: team.records.find((rec) => rec.type === 'total').summary
			})
		}

		let odds = null
		if (game.competitions[0].odds && game.competitions[0].odds.length > 0) {
			odds = game.competitions[0].odds[0].details
		}

		matchups.push({
			id: game.id,
			teams: teamData,
			odds
		})
	}

	return matchups
}

export const getGameInfo = async (gameId) => {
	const response = await axios.get(`${BASE_URL}/summary?event=${gameId}`)
	const data = response.data
	const gameInfo: Game = {
		id: gameId,
		time: DateTime.fromISO(data.header.competitions[0].date),
		home: data.boxscore.teams[1].team.abbreviation,
		away: data.boxscore.teams[0].team.abbreviation,
		teams: {}
	}

	gameInfo.teams = {
		[gameInfo.home]: {},
		[gameInfo.away]: {}
	}

	if (!data.winprobability) {
		gameInfo.teams[gameInfo.home].winPct =
			parseFloat(data.predictor.homeTeam.gameProjection) / 100
		gameInfo.teams[gameInfo.away].winPct =
			parseFloat(data.predictor.awayTeam.gameProjection) / 100
	} else {
		const winPcts = data.winprobability[data.winprobability.length - 1]
		let homeWinPct = parseFloat(winPcts.homeWinPercentage)
		// Round to 2 decimals
		homeWinPct = Math.round((homeWinPct + Number.EPSILON) * 100) / 100

		const awayWinPct = 1 - homeWinPct
		gameInfo.teams[gameInfo.home].winPct = homeWinPct
		gameInfo.teams[gameInfo.away].winPct = awayWinPct

		if (homeWinPct === 1) {
			gameInfo.winner = gameInfo.home
		} else if (awayWinPct === 1) {
			gameInfo.winner = gameInfo.away
		}
	}

	return gameInfo
}
