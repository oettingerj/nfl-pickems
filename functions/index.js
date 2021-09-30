const functions = require('firebase-functions')

let svelteKitServer
exports.svelteKit = functions.region("us-central1").https.onRequest(async (request, response) => {
    if (!svelteKitServer) {
        functions.logger.info("Initialising SvelteKit SSR entry")
        svelteKitServer = require("./svelteKit").default
        functions.logger.info("SvelteKit SSR entry initialised!")
    }
    functions.logger.info("Requested resource: " + request.originalUrl)
    return svelteKitServer(request, response)
})
