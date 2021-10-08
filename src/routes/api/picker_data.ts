import type { RequestHandler } from '@sveltejs/kit'
import { getMatchups } from '$lib/services/espn'

export const get: RequestHandler = async () => {
    const matchups = await getMatchups(5)

    return {
        body: {
            matchups
        }
    }
}
