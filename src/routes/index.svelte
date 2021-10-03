<script lang="ts" context="module">
    import type { Load } from '@sveltejs/kit'
    import { getSubmissionLock } from '$lib/services/firebase'
    import { DateTime } from 'luxon'

    export const load: Load = async ({ page, session, fetch }) => {
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
                submissionLock,
                games: response.games,
                picks: response.picks,
                winPcts: response.winPcts,
                scores: response.scores
            }
        }
    }
</script>

<script lang="ts">
    import type { Game } from '$lib/services/espn'
    import type { Picks } from '$lib/services/firebase'

    export let submissionLock: boolean
    export let lockTime: DateTime

    export let games: Game[]
    export let picks: Picks
    export let winPcts: {}
    export let scores: {}

    const players = Object.keys(picks)

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

{#if !submissionLock}
    <div class="text-gray-800">
        <h3>Time to make your picks!</h3>
        <p>
            Picks lock for the week on {lockTime.toLocaleString()}. After this time, you will be able to
            see everyone's picks and odds.
        </p>
    </div>
{:else}
    <div class="flex flex-col text-gray-800">
        <div class="flex items-center justify-around">
            <img class="sm:h-32 h-20" src="/nfl-logo.svg" alt="nfl logo">
            <h1 class="sm:text-3xl text-lg">NFL PickEms 2.0</h1>
            <img class="sm:h-32 h-20" src="/nfl-logo.svg" alt="nfl logo">
        </div>
        <div class="flex flex-col items-center">
            <h2 class="text-xl mb-1">Scores</h2>
        </div>
        <div class="mb-5 md:mx-32 mx-5 overflow-auto rounded-lg border border-gray-300">
            <table class="min-w-full divide-y divide-gray-200 text-center">
                <thead class="bg-gray-50">
                <tr>
                    {#each players as player}
                        <th class="px-3 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{player}</th>
                    {/each}
                </tr>
                </thead>
                <tbody class="bg-white">
                <tr>
                    {#each players as player}
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div class="text-xl font-medium">{scores[player]}</div>
                            <div class="text-md text-gray-500">{Math.round(winPcts[player] * 100)}%</div>
                        </td>
                    {/each}
                </tr>
                </tbody>
            </table>
        </div>
        <div class="flex flex-col flex-grow-0 md:mx-20 mx-5 mb-10 rounded-lg border border-gray-300 overflow-auto" style="height: 70vh">
            <table class="min-w-full relative divide-y divide-gray-200 text-center">
                <thead>
                <tr class="divide-x divide-gray-200">
                    <th class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 rounded-tl-lg text-xs font-medium text-gray-500 uppercase tracking-wider">Home</th>
                    <th class="px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Away</th>
                    {#each players as player, i}
                        <th class={`px-3 md:px-6 py-3 sticky top-0 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider ${i === players.length - 1 ? 'rounded-tr-lg' : ''}`}>{player}</th>
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
                            <td class={`px-3 md:px-6 py-4 whitespace-nowrap ${columnStyles(player, game)}`}>
                                <span class="font-medium">{picks[player][game.id].pick}</span>
                                <span class="text-xs">({picks[player][game.id].weight})</span>
                            </td>
                        {/each}
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}
