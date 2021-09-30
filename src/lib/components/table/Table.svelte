<script lang="ts">
    import classNames from 'classnames'
</script>

<div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class={classNames('overflow-hidden border-b border-gray-200', $$restProps.class)}>
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <slot name="header"/>
                    </thead>
                    <tbody>
                        <slot/>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
