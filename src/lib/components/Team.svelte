<script lang="ts">
    export let team
    export let picked = false

    const selectedStyles = 'border-green-300 shadow bg-green-50'
</script>

<div on:click class={`flex flex-col py-5 px-10 rounded-lg items-center cursor-pointer border ${picked ? selectedStyles : 'border-transparent'} border-4 hover:border-green-300`}>
    <img class="h-20" src={team.logo} alt="team logo"/>
    <h3 class="font-medium text-lg">{team.abbr}</h3>
</div>
