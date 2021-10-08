<script lang="ts">
    import classNames from 'classnames'

    export let rounded = true
    export let shadow = true
    export let headerBgClass = ''
    export let noPadding = false

    const hasHeader = $$slots.hasOwnProperty('header')
</script>

<div class={classNames('bg-white overflow-hidden border', $$restProps.class)}
     class:rounded-lg={rounded}
     class:shadow-lg={shadow}
     class:divide-y={hasHeader}
     class:divide-gray-200={hasHeader}
>
    {#if hasHeader}
        <div class={`px-4 py-5 sm:px-6 ${headerBgClass}`}>
            <slot name="header"></slot>
        </div>
    {/if}
    <div class={noPadding ? '' : 'px-4 py-5 sm:p-6'}>
        <slot></slot>
    </div>
</div>
