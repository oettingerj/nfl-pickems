<script lang="ts">
	import classNames from 'classnames'

	export let bgOverlay = false
	export let visible: boolean
	export let onHide: () => void
	export let anchored = false
	// Outer = wrapper div
	export let outerClass = ''
	// Inner = modal content
	export let innerClass = ''
</script>

<svelte:window on:click={onHide} />

{#if visible}
	<div
		class={classNames(
			'z-10',
			anchored ? 'absolute' : 'fixed inset-0',
			outerClass
		)}
		role="dialog"
		aria-modal="true"
		on:click|stopPropagation
	>
		<div
			class={classNames(
				'flex items-end justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0',
				anchored ? '' : 'min-h-screen'
			)}
		>
			{#if bgOverlay}
				<div
					on:click={onHide}
					class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					aria-hidden="true"
				/>
			{/if}

			<!-- From Tailwind: This element is to trick the browser into centering the modal contents. -->
			{#if !anchored}
				<span
					class="hidden sm:inline-block sm:align-middle sm:h-screen"
					aria-hidden="true">&#8203;</span
				>
			{/if}

			<div
				class={classNames(
					'inline-block border align-bottom bg-white p-4 text-left rounded-lg transform shadow-xl sm:align-middle sm:max-w-lg sm:w-full',
					innerClass
				)}
			>
				<div class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
					<button
						on:click={onHide}
						type="button"
						class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<span class="sr-only">Close</span>
						<!-- Heroicon name: outline/x -->
						<svg
							class="h-6 w-6"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<slot />
			</div>
		</div>
	</div>
{/if}
