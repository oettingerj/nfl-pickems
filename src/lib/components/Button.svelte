<script lang="ts">
    import classNames from 'classnames'

    export let theme: 'primary' | 'secondary' | 'white' = 'primary'
    export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
    export let selected = false
    export let disabled = false

    const themes = {
        primary: 'text-white bg-base-600 hover:bg-base-700 disabled:bg-base-600 border border-transparent',
        secondary: 'text-base-700 bg-base-100 hover:bg-base-200 disabled:bg-base-100 border border-transparent',
        white: 'text-gray-700 bg-white hover:bg-gray-50 disabled:bg-white border border-gray-300',
        none: ''
    }

    const selectedThemes = {
        white: 'text-base-500 bg-base-50 border border-transparent'
    }

    const sizes = {
        sm: 'px-3 py-2 text-sm leading-4 rounded-md',
        md: 'px-4 py-2 text-sm rounded-md',
        lg: 'px-4 py-2 text-base rounded-md',
        xl: 'px-6 py-3 text-base rounded-md'
    }
</script>

<button {disabled} class={classNames('button cursor-pointer inline-flex items-center disabled:cursor-default disabled:opacity-50', selected ? selectedThemes[theme] : themes[theme], sizes[size], $$restProps.class)} on:click>
    {#if $$slots.icon}
        <div class="-ml-1 mr-2">
            <slot name="icon"/>
        </div>
    {/if}
    <slot/>
</button>
