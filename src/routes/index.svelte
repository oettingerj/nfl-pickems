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
                winPcts: response.winPcts
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

    const players = Object.keys(picks)
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
            <img class="h-32" src="/nfl-logo.svg" alt="nfl logo">
            <h1 class="text-3xl">NFL PickEms 2.0</h1>
            <img class="h-32" src="/nfl-logo.svg" alt="nfl logo">
        </div>
        <div class="flex flex-col items-center mb-5">
            <h2 class="text-xl mb-1">Win Pcts</h2>
            <div class="rounded-lg items-center border border-gray-300 mx-32 overflow-auto">
                <table class="min-w-full divide-y divide-gray-200 text-center">
                    <thead class="bg-gray-50">
                    <tr>
                        {#each players as player}
                            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{player}</th>
                        {/each}
                    </tr>
                    </thead>
                    <tbody class="bg-white">
                    <tr>
                        {#each players as player}
                            <td class="px-6 py-4 whitespace-nowrap font-medium">
                                {Math.round(winPcts[player] * 100)}%
                            </td>
                        {/each}
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="mx-20 mb-10 rounded-lg border border-gray-300 overflow-auto">
            <table class="min-w-full divide-y divide-gray-200 text-center">
                <thead class="bg-gray-50">
                <tr class="divide-x divide-gray-200">
                    <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Home</th>
                    <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Away</th>
                    {#each players as player}
                        <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{player}</th>
                    {/each}
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                {#each games as game}
                    <tr class="divide-x divide-gray-200">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-center">
                                <span class="font-medium">{game.home}</span>
                                <span class="text-sm font-light">{Math.round(game.teams[game.home].winPct * 100)}%</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-center">
                                <span class="font-medium">{game.away}</span>
                                <span class="text-sm font-light">{Math.round(game.teams[game.away].winPct * 100)}%</span>
                            </div>
                        </td>
                        {#each players as player}
                            <td class="px-6 py-4 whitespace-nowrap">
                                {picks[player][game.id].pick} ({picks[player][game.id].weight})
                            </td>
                        {/each}
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}
