const axios = require('axios')
const path = require('path')
const fs = require('fs')

const audioExtension = 'wav'

module.exports = job => {
    const { tokenId, audioUrl } = job.data

    const audioFilePath = path.resolve(__dirname, `../audio/${tokenId}.${audioExtension}`)

    return axios({
        url: audioUrl,
        method: 'GET',
        responseType: 'stream'
    }).then((response) => {
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(audioFilePath)

            writer.on('error', (err) => {
                reject(err)
            })

            writer.on('finish', () => {
                resolve(audioFilePath)
            })

            response.data.pipe(writer)
        })
    })
}