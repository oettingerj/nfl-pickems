<script lang="ts">
	import {uid} from 'radash'

	export let label = ''
	export let placeholder = ''
	export let value: string
	export let onSubmit: () => void
	export let inputClass = ''
	let className = ''
	export { className as class }

	const id = uid(7)

	const onKeyDown = (event) => {
		// Submit on enter key press
		if (onSubmit !== undefined && event.keyCode === 13) {
			onSubmit()
		}
	}
</script>

<div class={className}>
	{#if label.length > 0}
		<label for={id} class="block text-sm font-medium text-gray-700"
			>{label}</label
		>
	{/if}
	<div class="relative rounded-md shadow-sm {label ? 'mt-1' : ''}">
		{#if $$slots.icon}
			<div
				class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
			>
				<slot name="icon" />
			</div>
		{/if}
		<input
			{id}
			on:keydown={onKeyDown}
			bind:value
			type="text"
			class="focus:ring-base-500 focus:border-base-500 block w-full sm:text-sm rounded-md {inputClass}"
			{placeholder}
		/>
	</div>
</div>
