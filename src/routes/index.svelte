<script lang="ts" context="module">
    import type { Load } from '@sveltejs/kit'
    import { getSubmissionLock, getWeeks } from '$lib/services/firebase'
    import { DateTime } from 'luxon'

    export const load: Load = async ({ fetch, page }) => {
        const weeks = await getWeeks()
        const currentWeek = weeks[weeks.length - 1]
        let selectedWeek = page.query.get('week')
        const submissionLock = await getSubmissionLock(currentWeek)
        const areSubmissionsLocked = Date.now() >= submissionLock
        if ((!selectedWeek && !areSubmissionsLocked) || (!areSubmissionsLocked && selectedWeek === currentWeek)) {
            return {
                props: {
                    weeks,
                    currentWeek,
                    areSubmissionsLocked,
                    lockTime: DateTime.fromMillis(submissionLock)
                }
            }
        }

        if (!selectedWeek) {
            selectedWeek = currentWeek
        }

        const response = await fetch(`/api/results?week=${selectedWeek}`).then((res) => res.json())

        return {
            props: {
                weeks,
                currentWeek,
                selectedWeek,
                areSubmissionsLocked,
                games: response.games,
                picks: response.picks,
                winPcts: response.winPcts,
                scores: response.scores,
                players: response.players
            }
        }
    }
</script>

<script lang="ts">
    import type { Game } from '$lib/services/espn'
    import type { Picks } from '$lib/services/firebase'
    import Header from '$lib/components/Header.svelte'
    import {user} from '$lib/stores/user'
    import Card from '$lib/components/Card.svelte'
    import Button from '$lib/components/Button.svelte'
    import {goto} from '$app/navigation'
    import {has} from 'lodash-es'
    import { NUM_SIMS, SIM_URL } from './api/results'
    import { hasPicks } from '$lib/services/firebase'

    export let areSubmissionsLocked: boolean
    export let lockTime: DateTime

    export let games: Game[]
    export let picks: Picks
    export let winPcts: {}
    export let scores: {}
    export let players: {
        name: string,
        id: string
    }[] = []
    export let weeks: string[]
    export let currentWeek: string
    export let selectedWeek: string

    let teamColumnWidth = 200
    let screenWidth = 600

    $: players = players.filter((p) => has(picks, p.id))

    if (!areSubmissionsLocked) {
        weeks = weeks.filter(w => w !== weeks[weeks.length - 1])
    }

    let lockTimeString
    if (lockTime) {
        lockTimeString = lockTime.toFormat("ccc LLL d 'at' h:mm'pm'")
    }

    let madePicks = false
    if (currentWeek && $user.uid) {
        hasPicks(currentWeek, $user.uid).then((res) => {
            madePicks = res
        })
    }

    let runningSimulation = false
    let updatingWeek = false

    const runSimulation = async () => {
        runningSimulation = true
        const body = {
            games,
            picks,
            numSims: NUM_SIMS
        }
        const response = await fetch(SIM_URL, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then(res => res.json())

        scores = response.scores
        winPcts = response.winPcts
        runningSimulation = false
    }

    const changeWeek = async (week) => {
        updatingWeek = true
        await goto(`/?week=${week}`)
        updatingWeek = false
    }

    const columnStyles = (player, game) => {
        if (!game.winner) {
            return ''
        }

        if (picks[player][game.id].pick === game.winner) {
            return 'bg-green-300'
        } else {
            return 'bg-red-400'
        }
    }

    const teamClick = (team, game) => {
        if (game.winner && game.winner === team) {
            game.winner = null
        } else {
            game.winner = team
        }

        // Trigger svelte reactivity
        games = games
    }

    const getTeamStyles = (team, winner) => {
        if (!winner || winner !== team) {
            return 'desktop:hover:bg-green-100'
        }
        return 'desktop:hover:bg-red-200 bg-green-200'
    }
</script>

<svelte:window bind:innerWidth={screenWidth}/>

<div class="flex h-screen w-screen flex-col text-gray-800">
    <Header/>
    {#if !selectedWeek}
        <div class="flex flex-col items-center">
            <Card class="p-10 mx-5 mt-20">
                <h3 class="text-2xl font-medium">Time to make your picks!</h3>
                <p class="mt-3">
                    Picks lock for the week on {lockTimeString}. After this time, you will be able to
                    see everyone's picks and odds.
                </p>
                <div class="flex mt-6 items-center">
                    <Button size="lg" on:click={() => goto(`/picker${$user.uid ? `?uid=${$user.uid}` : ''}`)}>{madePicks ? 'Edit' : 'Make'} Picks</Button>
                    <Button loading={updatingWeek} size="lg" theme="secondary" class="ml-2" on:click={() => changeWeek(parseInt(currentWeek) - 1)}>View Previous Weeks</Button>
                </div>
            </Card>
        </div>
    {:else}
        <div class="flex sm:flex-row items-center flex-col md:mx-20 mx-5 mb-5">
            <div class="flex sm:flex-col items-end sm:items-center justify-center mt-5 w-full" style={screenWidth > 640 ? `width: ${teamColumnWidth * 2}px` : ''}>
                <div class="flex flex-col sm:mb-2 items-center w-full">
                    {#if !updatingWeek}
                        <label for="week" class="block text-sm font-medium text-gray-700">Week</label>
                        <select bind:value={selectedWeek} on:change={() => changeWeek(selectedWeek)} id="week" name="week" class="mt-1 block w-20 pl-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
                            {#each weeks as week}
                                <option selected={week === selectedWeek}>{week}</option>
                            {/each}
                        </select>
                    {:else}
                        <div class="flex items-center">
                            <svg class="animate-spin h-8 w-8 text-base-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span class="text-xs w-20 text-gray-600 ml-2">Fetching data for week {selectedWeek}...</span>
                        </div>
                    {/if}
                </div>
                <div class="flex flex-col w-full items-center">
                    {#if runningSimulation}
                        <Button disabled size="lg" class="h-12 w-32">
                            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </Button>
                    {:else}
                        <Button class="h-12 w-32" on:click={runSimulation} size="lg">Re-simulate</Button>
                    {/if}
                </div>
            </div>
            <div class="flex flex-grow flex-col">
                <div class="flex flex-col items-center mt-5">
                    <h2 class="text-xl mb-1">Scores</h2>
                </div>
                <div class="flex flex-col rounded-lg overflow-auto border border-gray-300">
                    <table class="divide-y divide-gray-200 text-center">
                        <thead class="bg-gray-50">
                        <tr>
                            {#each players as player}
                                <th class="px-3 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{player.shortName}</th>
                            {/each}
                        </tr>
                        </thead>
                        <tbody class="bg-white">
                        <tr>
                            {#each players as player}
                                <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                                    <div class="text-xl font-medium">{scores[player.id]}</div>
                                    <div class="text-md text-gray-500">{Math.round(winPcts[player.id] * 100)}%</div>
                                </td>
                            {/each}
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="flex flex-col md:mx-20 mx-5 mb-5 rounded-lg border border-gray-300 overflow-auto">
            <table class="divide-y divide-gray-200 text-center">
                <thead>
                <tr class="divide-x divide-gray-200">
                    <th bind:clientWidth={teamColumnWidth} class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Home</th>
                    <th class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Away</th>
                    {#each players as player, i}
                        <th class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">{player.shortName}</th>
                    {/each}
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                {#each games as game (game.id)}
                    <tr class="divide-x divide-gray-200">
                        <td on:click={() => teamClick(game.home, game)} class="cursor-pointer {getTeamStyles(game.home, game.winner)} px-3 md:px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-center">
                                <span class="font-medium">{game.home}</span>
                                <span class="text-sm font-light">{Math.round(game.teams[game.home].winPct * 100)}%</span>
                            </div>
                        </td>
                        <td on:click={() => teamClick(game.away, game)} class="cursor-pointer {getTeamStyles(game.away, game.winner)} px-3 md:px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-center">
                                <span class="font-medium">{game.away}</span>
                                <span class="text-sm font-light">{Math.round(game.teams[game.away].winPct * 100)}%</span>
                            </div>
                        </td>
                        {#each players as player}
                            <td class="px-3 md:px-6 py-4 whitespace-nowrap {columnStyles(player.id, game)}">
                                <span class="font-medium">{picks[player.id][game.id].pick}</span>
                                <span class="text-xs">({picks[player.id][game.id].weight})</span>
                            </td>
                        {/each}
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
