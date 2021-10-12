<script lang="ts">
    import {page} from '$app/stores'
    import { googleLogin, setUser } from '$lib/services/firebase'
    import {goto} from '$app/navigation'

    import Card from '$lib/components/Card.svelte'
    import Button from '$lib/components/Button.svelte'

    let nextUrl = '/'
    if ($page.query.has('next')) {
        nextUrl = $page.query.get('next')
    }

    const login = async () => {
        const result = await googleLogin()
        await setUser(result.user)
        await goto(nextUrl)
    }
</script>

<div class="flex justify-center p-5 sm:p-20">
    <Card headerBgClass="bg-base-600">
        <div slot="header" class="flex flex-row text-white text-center text-lg font-medium items-center">
            <img src="/nfl-logo.svg" alt="NFL logo" class="h-20"/>
            <span class="text-2xl">NFL Pick 'Ems</span>
        </div>
        <div class="px-2 sm:px-16 py-8">
            <Button size="lg" on:click={login} class="px-10">
                <div slot="icon" class="px-1 py-1 mr-2 bg-white rounded-md">
                    <img src="/google-logo.svg" alt="Google logo" />
                </div>
                Sign in with Google
            </Button>
        </div>
    </Card>
</div>
