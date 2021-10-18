const server = require('server')
const fs = require('fs')
const axios = require('axios')
const path = require('path')
const { TapeObject, Query } = require('./moralis')

const { get, post } = server.router

async function saveAudio({ tokenId, ethAddress, url }) {
    const audioPath = `${path.resolve()}/audio/${tokenId}.webm`
    
    const writer = fs.createWriteStream(audioPath)
    
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    writer.on('error', function (err) {
        console.log(`failed downloading file... ${err.toString()} ... ${new Date()}`)
    })

    writer.on('finish', function () {
        console.log(`successfully saved file... ${audioPath}`)
    })
}

server({
    port: 3001,
    security: false
}, [
    get('/token/:tokenId', async (ctx) => {
        const { tokenId } = ctx.params

        const t = new TapeObject()

        const query = new Query(t)

        query.equalTo('tokenId', Number.parseInt(tokenId))

        const tape = await query.first()

        if (tape) {
            return {
                'name': tape.get('title'),
                'image': tape.get('video').ipfs(),
                'external_url': tape.get('video').ipfs(),
                'description': tape.get('lyrics'),
                'attributes': [
                    {
                        'trait_type': 'rarity',
                        'value': 'rare'
                    },
                    {
                        'trait_type': 'link',
                        'display_value': 'Audio Link',
                        'value': tape.get('audio')
                    }
                ]
            }
        } else {
            return {
                'name': 'Empty Tape',
                'image': ''
            }
        }

        // read from moralis
    }),

    post('/afterSaveTape', async (ctx) => {
        const { audio, tokenId } = ctx.body.object
        
        const { ethAddress } = ctx.body.user

        const { url } = audio

        saveAudio({
            tokenId,
            ethAddress,
            url
        })

        return 'OK'
    })
]).then((ctx) => console.log('server listening on port ' + ctx.options.port))