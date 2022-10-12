<script lang="ts">
	export let rounded = true
	export let shadow = true
	export let headerBgClass = ''
	export let noPadding = false
	let className = ''
	export { className as class }

	const hasHeader = Object.hasOwn($$slots, 'header')
</script>

<div
	class="bg-white overflow-hidden border {className}"
	class:rounded-lg={rounded}
	class:shadow-lg={shadow}
	class:divide-y={hasHeader}
	class:divide-gray-200={hasHeader}
>
	{#if hasHeader}
		<div class={`px-4 py-5 sm:px-6 ${headerBgClass}`}>
			<slot name="header" />
		</div>
	{/if}
	<div class={noPadding ? '' : 'px-4 py-5 sm:p-6'}>
		<slot />
	</div>
</div>
