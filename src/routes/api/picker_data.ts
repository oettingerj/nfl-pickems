import type { RequestHandler } from '@sveltejs/kit'
import { getMatchups } from '$lib/services/espn'

export const get: RequestHandler = async ({ query }) => {
    const matchups = await getMatchups(query.get('week'))

    return {
        body: {
            matchups
        }
    }
}
