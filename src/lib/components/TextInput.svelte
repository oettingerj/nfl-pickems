<script lang="ts">
    import classNames from 'classnames'
    import { uniqueId } from 'lodash-es'

    export let label = ''
    export let placeholder = ''
    export let value
    export let onSubmit: () => void
    export let inputClass = ''

    const id = uniqueId('input_')

    const onKeyDown = (event) => {
        // Submit on enter key press
        if (onSubmit !== undefined && event.keyCode === 13) {
            onSubmit()
        }
    }
</script>

<div class={$$restProps.class}>
    {#if label.length > 0}
        <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
    {/if}
    <div class={classNames('relative rounded-md shadow-sm', label ? 'mt-1' : '')}>
        {#if $$slots.icon}
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <slot name="icon"/>
            </div>
        {/if}
        <input {id} on:keydown={onKeyDown} bind:value type="text" class="focus:ring-base-500 focus:border-base-500 block w-full sm:text-sm rounded-md {inputClass}" {placeholder}>
    </div>
</div>
