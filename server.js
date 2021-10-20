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
    "image": "https://gateway.pinata.cloud/ipfs/QmW9GUSf2u8S6q96KAr1Umq1J3c7vpXHJQVJhP6kma5Fr4",
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
    "description": `
    10 thousand unique tape recordings immutably minted on the Ethereum Blockchain. 
The crypto tape recordings project is a user-generated NFT audio experiment whereby participants can add a unique voice recording to the metadata of their NFT. 

The generated NFT is a video of our CTR10000 tape recorder containing each user’s voice recording, the lyrics of their recording, and the title. 

Our goal is to find out how far we can take a user-generated experiment. We believe everyone is unique and has extraordinary creative powers when you connect with your primal inclinations. We hope unique, stories, songs, poems, raps and spoken words are added to the user’s own NFT and that a thriving community erupts that are using these vocals and lyrics in tracks, merch, memes…

Participants have agreed that their recording becomes public domain and be released under creative commons license. Meaning everyone is free to create derivative works from your recording. This free use of creative material is ultimately how value flows back to your NFT and increases the power of this community…
    `,
    "image": "https://gateway.pinata.cloud/ipfs/QmT2tGGknubS36nqGKeXC5kqXbipktNNtfcAR33D5c7PPo",
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