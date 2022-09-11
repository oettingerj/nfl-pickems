<script lang="ts">
	import type { Game, Matchup } from '$lib/services/espn'
	import Header from '$lib/components/Header.svelte'
	import Button from '$lib/components/Button.svelte'
	import PickCard from '$lib/components/PickCard.svelte'
	import { dndzone, SOURCES, type DndEvent } from 'svelte-dnd-action'
	import { flip } from 'svelte/animate'
	import { Picks, submitPicksForUser } from '$lib/services/firebase'
	import { user } from '$lib/stores/user'
	import { orderBy } from 'lodash-es'

	export let data: {
		submissionLock: number
		matchups: Matchup[]
		currentWeek: string
		games: Game[]
		allPicks: Picks
	}

	let { submissionLock, matchups, currentWeek, games, allPicks } = data

	const AUTO_RANK_URL =
		'https://us-central1-nfl-pickems-5e76c.cloudfunctions.net/auto_rank'
	// const AUTO_RANK_URL = 'http://localhost:8080/auto_rank'

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
	let autoRanking = false
	let winPct

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
			await submitPicksForUser($user.id, picks, currentWeek).then(() =>
				alert(
					'Picks submitted! You may edit them here until picks lock for the week.'
				)
			)
		} else {
			alert('Unable to submit picks.')
		}
		submitting = false
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const autoRank = async () => {
		autoRanking = true
		const body = {
			games,
			picks: allPicks,
			user: $user.id,
			num_sims: 1000,
			num_ranks: 1000
		}

		const response = await fetch(AUTO_RANK_URL, {
			method: 'POST',
			body: JSON.stringify(body)
		}).then((res) => res.json())

		const rankings = response.rankings

		for (const matchup of matchups) {
			matchup.weight = rankings[matchup.pick]
		}

		matchups = orderBy(matchups, 'weight', 'desc')
		winPct = response.win_pct

		autoRanking = false
	}
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="flex flex-col">
	<Header />
	<div class="flex flex-col md:flex-row justify-around">
		{#if screenWidth < 768}
			<div class="flex items-center justify-end w-full mt-2">
				<Button
					loading={submitting}
					disabled={!canSubmit(matchups)}
					size="xl"
					class="mr-2"
					on:click={submitPicks}>Submit</Button
				>
			</div>
		{/if}
		<div class="my-10 px-5 md:px-36 w-full">
			<h2 class="text-2xl mb-5 font-medium text-center">Most Confident</h2>
			<section
				use:dndzone={{
					items: matchups,
					dragDisabled,
					flipDurationMs,
					dropTargetStyle: {}
				}}
				on:consider={handleDragConsider}
				on:finalize={handleDragFinalize}
				class="flex flex-col gap-5"
			>
				{#each matchups as matchup (matchup.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<PickCard
							class="w-full"
							{matchup}
							bind:dragDisabled
							onWinnerPick={(pick) => {
								matchup.pick = pick
							}}
						/>
					</div>
				{/each}
			</section>
			<h2 class="text-2xl mt-5 font-medium text-center">Least Confident</h2>
		</div>
		{#if screenWidth >= 768}
			<div class="flex flex-col items-center mr-10 mt-10">
				<Button
					loading={submitting}
					disabled={!canSubmit(matchups)}
					size="xl"
					class="mb-3"
					on:click={submitPicks}>Submit</Button
				>
				<!--                <Button loading={autoRanking} theme="secondary" on:click={autoRank}>Auto-Rank</Button>-->
				{#if winPct}
					<div
						class="border text-sm text-gray-600 border-gray-300 rounded-lg mt-3 p-3 text-center"
					>
						Estimated win: {Math.round(winPct * 100)}%
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
