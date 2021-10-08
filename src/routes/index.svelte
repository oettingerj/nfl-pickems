<script lang="ts" context="module">
    import type { Load } from '@sveltejs/kit'
    import { getSubmissionLock, getPlayers } from '$lib/services/firebase'
    import { DateTime } from 'luxon'

    export const load: Load = async ({ fetch }) => {
        const submissionLock = await getSubmissionLock()
        if (Date.now() < submissionLock) {
            return {
                props: {
                    submissionLock: false,
                    lockTime: DateTime.fromMillis(submissionLock)
                }
            }
        }

        const response = await fetch('/api/results').then((res) => res.json())

        return {
            props: {
                submissionLock: true,
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

    export let submissionLock: boolean
    export let lockTime: DateTime

    export let games: Game[]
    export let picks: Picks
    export let winPcts: {}
    export let scores: {}
    export let players: {
        name: string,
        id: string
    }[] = []

    players = players.filter((p) => has(picks, p.id))

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
</script>

<div class="flex h-screen flex-col text-gray-800">
    <Header/>
    {#if !submissionLock}
        <div class="flex flex-col items-center">
            <Card class="p-10 mt-20">
                <h3 class="text-2xl font-medium">Time to make your picks!</h3>
                <p class="mt-3">
                    Picks lock for the week on {lockTime.toLocaleString()}. After this time, you will be able to
                    see everyone's picks and odds.
                </p>
                <Button size="lg" class="mt-6" on:click={() => goto(`/picker${$user.uid ? `?uid=${$user.uid}` : ''}`)}>Make Picks</Button>
            </Card>
        </div>
    {:else}
        <div class="flex flex-col items-center mt-5">
            <h2 class="text-xl mb-1">Scores</h2>
        </div>
        <div class="flex flex-col flex-shrink-0 mb-5 md:mx-32 mx-5 rounded-lg overflow-auto border border-gray-300">
            <table class="divide-y divide-gray-200 text-center">
                <thead class="bg-gray-50">
                <tr>
                    {#each players as player}
                        <th class="px-3 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{player.name ?? player.id}</th>
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
        <div class="flex flex-col flex-grow-0 md:mx-20 mx-5 mb-5 rounded-lg border border-gray-300 overflow-auto">
            <table class="relative divide-y divide-gray-200 text-center">
                <thead>
                <tr class="divide-x divide-gray-200">
                    <th class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Home</th>
                    <th class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Away</th>
                    {#each players as player, i}
                        <th class={`px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider`}>{player.name ?? player.id}</th>
                    {/each}
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                {#each games as game}
                    <tr class="divide-x divide-gray-200">
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-center">
                                <span class="font-medium">{game.home}</span>
                                <span class="text-sm font-light">{Math.round(game.teams[game.home].winPct * 100)}%</span>
                            </div>
                        </td>
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-center">
                                <span class="font-medium">{game.away}</span>
                                <span class="text-sm font-light">{Math.round(game.teams[game.away].winPct * 100)}%</span>
                            </div>
                        </td>
                        {#each players as player}
                            <td class={`px-3 md:px-6 py-4 whitespace-nowrap ${columnStyles(player.id, game)}`}>
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
