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

const emptyTapeMetadata = {
    "name": "Empty Tape",
    "image": "https://gateway.pinata.cloud/ipfs/QmVgHb2gUgKbmNFmfLBor1iyNdSWFW1UVJmvideSWUAjXN",
    "external_url": "https://cryptotaperecordings.com",
    "description": "Available for masterpiece recording",
    "attributes": [
        {
            "trait_type": "rarity",
            "value": "gold"
        }
    ]
}

const sampleTapeMetadata = {
    "name": "Sample Song",
    "image": "https://gateway.pinata.cloud/ipfs/QmVgHb2gUgKbmNFmfLBor1iyNdSWFW1UVJmvideSWUAjXN",
    "animation_url": "https://gateway.pinata.cloud/ipfs/QmW9GUSf2u8S6q96KAr1Umq1J3c7vpXHJQVJhP6kma5Fr4",
    "external_url": "https://api.cryptotaperecordings.com/token/1",
    "description": `
    J'ai cherché Agapé, j'ai cherché Agapé, j'ai cherché Agapé 
J'ai cherché Agapé, j'ai cherché Agapé, j'ai cherché Agapé 
J'ai cherché Agapé, j'ai cherché Agapé, j'ai cherché Agapé 
J'ai cherché Agapé, j'ai cherché Agapé, j'ai cherché Agapé 
    `,
    "attributes": [
        {
            "trait_type": "rarity",
            "value": "gold"
        },
        {
            "trait_type": "audio",
            "value": "https://gateway.pinata.cloud/ipfs/QmV55qseMjrj8HdFhx2qmJ6XSpUXwisjafJkGJyfhDG5Rw"
        }
    ]
}

const contractMetadata = {
    "name": "Crypto Tape Recordings",
    "description": "Crypto Tape Recordings",
    "image": "https://lh3.googleusercontent.com/vTSa1cI53mEPhAZPt4K2ZfB7kvXycO3ZiWMDoNwTAeFQYx48oA25cf1_3k6yRc7EXwWgDnxVaBukRR2RI8e0Och1zFCdBlmzGfPub_w",
    "external_link": "https://cryptotaperecordings.com",
    "seller_fee_basis_points": 100,
    "fee_recipient": "0x583Bf0Dc5a0e8FcCbCE42c946a03690f961AD2F8"
  }

server({
    port: 3001,
    security: false
}, [
    get('/contract', async (ctx) => {
        return contractMetadata
    }),

    get('/token/:tokenId', async (ctx) => {
        const { tokenId } = ctx.params

        if (tokenId == 1) {
            return sampleTapeMetadata
        } else {
            return emptyTapeMetadata
        }

        const t = new TapeObject()

        const query = new Query(t)

        query.equalTo('tokenId', Number.parseInt(tokenId))

        const tape = await query.first()

        if (tape) {
            return {
                'name': tape.get('title'),
                'image': tape.get('video').url(),
                'external_url': tape.get('video').url(),
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
        try {
            const { audio, tokenId } = ctx.body.object

            const { ethAddress } = ctx.body.user

            const { url } = audio

            saveAudio({
                tokenId,
                ethAddress,
                url
            })
        } catch (e) { }

        return 'OK'
    })
]).then((ctx) => console.log('server listening on port ' + ctx.options.port))