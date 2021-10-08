<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'

    export const load: Load = async ({ page, session }) => {
        return {

        }
    }
</script>

<script lang="ts">
    import '../app.css'
</script>

<div class="min-h-screen bg-gray-50">
    <slot></slot>
</div>
