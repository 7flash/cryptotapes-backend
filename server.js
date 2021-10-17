import server from 'server'
import path from 'path'
import { rename } from 'fs/promises'
import cors from 'cors'

const { get, post } = server.router

const { header } = server.reply

const port = 3001

const corsMiddleware = server.utils.modern(
    cors({
        origin: ['http://localhost:8080']
    })
)

server({ port }, corsMiddleware, [
    post('/record', ctx => {
        console.dir(ctx.params)

        console.dir(ctx.query)
    }),

    get('/record', ctx => {
        console.dir(ctx.params)

        console.dir(ctx.query)
    }),

    get('/', ctx => 'Hello from API'),

    get('/tapes/:creator', ctx => ({
        creator: ctx.params.creator,
        tapes: []
    })),

    // maybe file initially should be saved to moralis too

    // how do we check user is owner of given token id

    // probably should call moralis cloud function

    // and that function will execute post action via webhook

    // because moralis performs authentication

    post('/create', async ctx => {
        console.log('here...')

        console.dir(ctx.params)

        const tokenId = ctx.params.tokenId

        const audio = ctx.files.audio

        const tempPath = audio.path

        if (path.extname(audio.originalname).toLowerCase() !== '.webm') {
            throw 'invalid file format'
        }

        const newPath = path.join(__dirname, `audio/${tokenId}.webm`)

        await rename(tempPath, newPath)
        
        return {status: 200, body: 'OK'}
    })
]).then(ctx => {
    console.log(`server is running on port ${ctx.options.port} ... ${new Date().toUTCString()}`)    
})