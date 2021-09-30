<script lang="ts" context="module">
    import type { Load } from '@sveltejs/kit'
    import { getSubmissionLock } from '$lib/services/firebase'

    export const load: Load = async ({ page, session }) => {
        const submissionLock = await getSubmissionLock()

        return {
            props: {
                submissionLock
            }
        }
    }
</script>

<script lang="ts">
    import {DateTime} from 'luxon'

    export let submissionLock: number

    const lockTime = DateTime.fromMillis(submissionLock)
    const submissionsLocked = DateTime.now() >= lockTime
</script>

{#if submissionsLocked}
    <div>
        <h3>Time to make your picks!</h3>
        <p>
            Picks lock for the week on {lockTime.toLocaleString()}. After this time, you will be able to
            see everyone's picks and odds.
        </p>
    </div>
{:else}
    poop!
{/if}
