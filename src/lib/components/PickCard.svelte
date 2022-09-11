<script lang="ts">
	import Card from '$lib/components/Card.svelte'
	import type { Matchup } from '$lib/services/espn'
	import Team from '$lib/components/Team.svelte'

	export let matchup: Matchup
	export let onWinnerPick: (pick: string) => void

	export let dragDisabled: boolean

	const startDrag = (e) => {
		e.preventDefault()
		dragDisabled = false
	}
</script>

<Card noPadding class={$$restProps.class}>
	<div class="flex justify-between text-gray-800">
		<div class="flex flex-grow justify-around items-center md:p-3">
			<Team
				on:click={() => onWinnerPick(matchup.teams[0].abbr)}
				team={matchup.teams[0]}
				picked={matchup.pick === matchup.teams[0].abbr}
			/>
			<div class="flex flex-col text-center items-center">
				<span class="text-xl md:text-2xl font-semibold">vs</span>
				{#if matchup.odds}
					<span
						class="text-sm w-16 md:text-lg md:w-20 font-medium text-gray-600 mt-3"
						>{matchup.odds}</span
					>
				{/if}
			</div>
			<Team
				on:click={() => onWinnerPick(matchup.teams[1].abbr)}
				team={matchup.teams[1]}
				picked={matchup.pick === matchup.teams[1].abbr}
			/>
		</div>
		<div
			class="flex flex-col items-center justify-center px-3 md:px-10 bg-gray-100"
			style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
			on:mousedown={startDrag}
			on:touchstart={startDrag}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-8"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 10h16M4 14h16M4 18h16"
				/>
			</svg>
		</div>
	</div>
</Card>
