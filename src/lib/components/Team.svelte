<script lang="ts">
	export let team
	export let picked = false

	const selectedStyles = 'border-green-300 shadow bg-green-50'
</script>

<div
	on:click
	class={`flex flex-col m-2 md:m-0 px-5 py-5 md:px-10 rounded-lg items-center cursor-pointer border ${
		picked ? selectedStyles : 'border-transparent'
	} border-4 hover:border-green-300`}
>
	<img class="md:w-20" src={team.logo} alt="team logo" />
	<h3 class="font-medium text-lg">{team.abbr}</h3>
	<span class="text-sm text-gray-500">{team.record}</span>
</div>
