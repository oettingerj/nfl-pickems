<script lang="ts">
	import classNames from 'classnames'

	export let theme: 'primary' | 'secondary' | 'white' = 'primary'
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
	export let selected = false
	export let disabled = false
	export let loading = false

	const themes = {
		primary:
			'text-white bg-base-600 hover:bg-base-700 disabled:bg-base-600 border border-transparent',
		secondary:
			'text-base-700 bg-base-100 hover:bg-base-200 disabled:bg-base-100 border border-transparent',
		white:
			'text-gray-700 bg-white hover:bg-gray-50 disabled:bg-white border border-gray-300',
		none: ''
	}

	const selectedThemes = {
		white: 'text-base-500 bg-base-50 border border-transparent'
	}

	const sizes = {
		sm: 'px-3 py-2 text-sm leading-4 rounded-md',
		md: 'px-4 py-2 text-sm rounded-md',
		lg: 'px-4 py-2 rounded-md',
		xl: 'px-6 py-3 rounded-md'
	}

	const basicClasses =
		'button cursor-pointer inline-flex justify-center items-center disabled:cursor-default disabled:opacity-50'
</script>

{#if !loading}
	<button
		{disabled}
		class={classNames(
			basicClasses,
			selected ? selectedThemes[theme] : themes[theme],
			sizes[size],
			$$restProps.class
		)}
		on:click
	>
		{#if $$slots.icon}
			<div class="-ml-1 mr-2">
				<slot name="icon" />
			</div>
		{/if}
		<slot />
	</button>
{:else}
	<button
		disabled
		class={classNames(
			basicClasses,
			selected ? selectedThemes[theme] : themes[theme],
			sizes[size],
			$$restProps.class
		)}
	>
		<svg
			class="animate-spin h-5 w-5"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
			/>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	</button>
{/if}
