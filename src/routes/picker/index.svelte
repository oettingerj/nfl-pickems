<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { getPicksForUser, getSubmissionLock, getWeeks } from '$lib/services/firebase'
    import { browser } from '$app/env'
    import {orderBy} from 'lodash-es'

    export const load: Load = async ({ fetch, page }) => {
        const weeks = await getWeeks()
        const currentWeek = weeks[weeks.length - 1]
        const submissionLock = await getSubmissionLock(currentWeek)
        if (Date.now() >= submissionLock) {
            return {
                props: {
                    submissionLock
                }
            }
        }

        const query = page.query

        let url = `/api/picker_data?week=${currentWeek}`
        if (query.has('uid')) {
            url = url.concat(`&uid=${query.get('uid')}`)
        }

        const response = await fetch(url).then((res) => res.json())

        return {
            props: {
                submissionLock,
                matchups: response.matchups,
                currentWeek
            }
        }
    }
</script>

<script lang="ts">
    import type { Matchup } from '$lib/services/espn'
    import Header from '$lib/components/Header.svelte'
    import Button from '$lib/components/Button.svelte'
    import PickCard from '$lib/components/PickCard.svelte'
    import {dndzone, SOURCES} from 'svelte-dnd-action'
    import {flip} from 'svelte/animate'
    import {submitPicksForUser} from '$lib/services/firebase'
    import {user} from '$lib/stores/user'

    export let submissionLock: number
    export let matchups: Matchup[]
    export let currentWeek: string

    let dragDisabled = true
    const flipDurationMs = 200

    let screenWidth = 600

    const handleDragConsider = (event: CustomEvent<DndEvent>) => {
        matchups = event.detail.items as Matchup[]
    }

    const handleDragFinalize = (event: CustomEvent<DndEvent>) => {
        matchups = event.detail.items as Matchup[]

        if (event.detail.info.source === SOURCES.POINTER) {
            dragDisabled = true
        }
    }

    let submitting = false

    const canSubmit = (picks) => {
        if (Date.now() >= submissionLock) {
            return false
        }

        for (const matchup of picks) {
            if (!matchup.pick) {
                return false
            }
        }

        return true
    }

    const submitPicks = async () => {
        submitting = true
        if (canSubmit(matchups)) {
            const picks = {}
            for (let i = 0; i < matchups.length; i++) {
                const matchup = matchups[i]
                picks[matchup.id] = {
                    pick: matchup.pick,
                    weight: matchups.length - i
                }
            }
            await submitPicksForUser($user.uid, picks, currentWeek)
        } else {
            alert('Unable to submit picks.')
        }
        submitting = false
    }
</script>

<svelte:window bind:innerWidth={screenWidth}/>

<div class="flex flex-col">
    <Header/>
    <div class="flex flex-col md:flex-row justify-around">
        {#if screenWidth < 768}
            <div class="flex items-center justify-end w-full mt-2">
                <Button loading={submitting} disabled={!canSubmit(matchups)} size="xl" class="mr-2" on:click={submitPicks}>Submit</Button>
            </div>
        {/if}
        <div class="my-10 px-5 md:px-36 w-full">
            <h2 class="text-2xl mb-5 font-medium text-center">Most Confident</h2>
            <section use:dndzone={{
                items: matchups,
                dragDisabled,
                flipDurationMs,
                dropTargetStyle: {}
            }} on:consider={handleDragConsider} on:finalize={handleDragFinalize} class="flex flex-col gap-5">
                {#each matchups as matchup (matchup.id)}
                    <div animate:flip={{duration: flipDurationMs}}>
                        <PickCard class="w-full" {matchup} bind:dragDisabled={dragDisabled} onWinnerPick={(pick) => {matchup.pick = pick}}/>
                    </div>
                {/each}
            </section>
            <h2 class="text-2xl mt-5 font-medium text-center">Least Confident</h2>
        </div>
        {#if screenWidth >= 768}
            <div class="mr-10">
                <Button loading={submitting} disabled={!canSubmit(matchups)} size="xl" class="mt-10" on:click={submitPicks}>Submit</Button>
            </div>
        {/if}
    </div>
</div>
