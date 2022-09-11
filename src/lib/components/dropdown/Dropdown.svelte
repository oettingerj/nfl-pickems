<script lang="ts">
	import classNames from 'classnames'
</script>

<div
	class={classNames(
		'origin-top-right absolute right-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none',
		$$restProps.class
	)}
	role="menu"
	tabindex="-1"
	on:click|stopPropagation
>
	{#if $$slots.header}
		<div class="px-4 py-3" role="none">
			<slot name="header" />
		</div>
	{/if}
	<div class="py-1" role="none">
		<slot />
	</div>
</div>
