const server = require('server')
const Queue = require('bull')

const { modern } = server.utils

const moralis = require('./moralis')
const metadata = require('./metadata')

const { get, post, error } = server.router
const { header, status } = server.reply

const queue = new Queue('webhook')

const uploadQueue = new Queue('upload audio')

const attachVideoQueue = new Queue('attach video')

const cors = [
    ctx => header("Access-Control-Allow-Origin", "*"),
    ctx => header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-custom-header"),
    ctx => header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, HEAD, OPTIONS"),
    ctx => ctx.method.toLowerCase() === 'options' ? 200 : false
  ]

server(
    {
        port: 3001,
        security: false
    },
    modern(require('express-fileupload')()),
    cors,
    [
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
        console.log(`/afterSaveTape ${ctx.body.object.tokenId} ... ${new Date().toUTCString()}`)

        queue.add({
            body: ctx.body
        })
    }),

    post('/upload', async (ctx) => {
        console.dir(ctx.files)
        
        try {
            if (!ctx.files) throw 'no files'

            return new Promise((resolve, reject) => {
                req.files.audio.mv(audioFilePath, (err) => {
                    if (err) return reject(err)

                    const tokenId = 1

                    attachVideoQueue.add({
                        tokenId,
                        audioFilePath
                    })

                    return { tokenId, audioFilePath }
                })
            })
        } catch (error) {
            return error
        }
    })
]).then((ctx) => console.log('server listening on port ' + ctx.options.port))