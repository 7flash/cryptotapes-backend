import server from 'server'
import fs from 'fs'
import axios from 'axios'
import path from 'path'

const { get, post } = server.router

async function saveAudio({ tokenId, ethAddress, url }) {
    const audioPath = path.join(__dirname, `audio/${tokenId}.webm`)
    
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
    post('/record', async (ctx) => {
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
])