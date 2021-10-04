<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { getSubmissionLock } from '$lib/services/firebase'

    export const load: Load = async ({ fetch }) => {
        const submissionLock = await getSubmissionLock()
        if (Date.now() >= submissionLock) {
            return {
                props: {
                    submissionLock: true
                }
            }
        }

        const response = await fetch('/api/picker_data').then((res) => res.json())

        return {
            props: {
                submissionLock: false,
                matchups: response.matchups,
                players: response.players
            }
        }
    }
</script>

<script lang="ts">

</script>
