<script lang="ts">
    import {user} from '$lib/stores/user'
    import {logOut} from '$lib/services/firebase'
    import {goto} from '$app/navigation'
    import classNames from 'classnames'

    import Button from '$lib/components/Button.svelte'
    import Dropdown from '$lib/components/dropdown/Dropdown.svelte'
    import DropdownRow from '$lib/components/dropdown/Row.svelte'

    let showDropdown = false

    const avatarClick = (event) => {
        event.stopPropagation()
        showDropdown = !showDropdown
    }

    const signOutClick = async () => {
        await logOut()
        await goto('/login')
    }
</script>

<svelte:window on:click={() => showDropdown = false} />

<div class={classNames('relative flex flex-row items-center justify-between bg-base-600 py-0 px-4', $$restProps.class)}>
    <div class="flex flex-row items-center">
        <img src="/nfl-logo.svg" alt="NFL logo" class="cursor-pointer" on:click={() => goto('/')} />
        <span class="font-medium text-white whitespace-pre">NFL Pick 'Ems</span>
    </div>
    <div>
    <!--Placeholder image for now until we have access to profile photos-->
        <Button theme="none" on:click={avatarClick} class="flex items-center">
            <span class="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-white border-2">
                {#if $user.photoURL}
                    <img src={$user.photoURL} alt="user"/>
                {:else}
                    <svg class="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {/if}
            </span>
        </Button>
        {#if showDropdown}
            <Dropdown class="mr-5 mt-3">
                <div slot="header">
                    <p class="text-sm" role="none">
                        Signed in as
                    </p>
                    <p class="text-sm font-medium text-gray-900 truncate" role="none">
                        {$user?.displayName}
                    </p>
                </div>
                <DropdownRow on:click={signOutClick}>
                    Sign Out
                </DropdownRow>
            </Dropdown>
        {/if}
    </div>
</div>
