<script lang="ts">
    import classNames from 'classnames'

    export let index
</script>

<tr class={classNames(index % 2 === 0 ? 'bg-gray-50' : 'bg-white', $$restProps.class)} on:click>
    <slot/>
</tr>
