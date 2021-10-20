const server = require('server')
const Queue = require('bull')

const moralis = require('./moralis')
const metadata = require('./metadata')

const { get, post } = server.router

const queue = new Queue('webhook')

server({
    port: 3001,
    security: false
}, [
    get('/contract', async (ctx) => {
        return metadata.contractMetadata
    }),

    get('/token/:tokenId', async (ctx) => {
        const { tokenId } = ctx.params

        if (tokenId == 1) {
            return metadata.sampleTapeMetadata
        } else {
            return metadata.emptyTapeMetadata
        }
    }),

    post('/afterSaveTape', async (ctx) => {
        queue.add({
            body: ctx.body
        })
    })
]).then((ctx) => console.log('server listening on port ' + ctx.options.port))