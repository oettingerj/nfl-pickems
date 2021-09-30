<script lang="ts">
    import classNames from 'classnames'

    export let header = false
</script>

{#if header}
    <th scope="col" class={classNames('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', $$restProps.class)}>
        <slot/>
    </th>
{:else}
    <td class={classNames('px-6 py-4 whitespace-nowrap text-sm text-gray-500', $$restProps.class)}>
        <slot/>
    </td>
{/if}
