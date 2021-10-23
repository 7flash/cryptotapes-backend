const path = require('path')
const { exec } = require('child_process')

const assetName = 'video.webm'

const buildCommand = (input, output) => `
    docker run -v $(pwd):$(pwd) -w $(pwd) \
    jrottenberg/ffmpeg -stats \
    -y \
    -i assets/${assetName} \
    -i ${input} \
    -map 0:0 \
    -map 1:0 \
    ${output}
`

const videoExtension = 'webm'

module.exports = job => {
    const { tokenId, audioFilePath } = job.data

    const videoFilePath = path.join(__dirname, `../video/${tokenId}.${videoExtension}`)

    return new Promise((resolve, reject) => {
        exec(buildCommand(audioFilePath, videoFilePath), (err, stdout, stderr) => {
            if (err) {
                return reject(err)
            }

            resolve(videoFilePath)
        })
    })
}