const Queue = require('bull')
const path = require('path')

const webhookQueue = new Queue('webhook')
const saveAudioQueue = new Queue('save audio')
const attachVideoQueue = new Queue('attach video')
const uploadVideoQueue = new Queue('upload video')
const updateMetadataQueue = new Queue('update metadata')
const uploadQueue = new Queue('upload audio')

saveAudioQueue.process(path.join(__dirname, `jobs/saveAudio`))
attachVideoQueue.process(path.join(__dirname, './jobs/attachVideo'))
uploadVideoQueue.process(path.join(__dirname, './jobs/uploadVideo'))
updateMetadataQueue.process(path.join(__dirname, './jobs/updateMetadata'))

webhookQueue.process(async job => {
    const { tokenId, audio } = job.data.body.object
    
    console.time(tokenId)

    return { tokenId, audio }
})

webhookQueue.addListener('completed', job => {
    const { audio, tokenId } = job.returnvalue

    const audioUrl = audio.url

    console.timeLog(tokenId, `webhook triggered ... ${audioUrl}`)

    saveAudioQueue.add({
        tokenId,
        audioUrl
    })
})

webhookQueue.addListener('failed', job => {
    console.error(job.stacktrace)
})

uploadQueue.process(async job => {
    const tokenId = 1

    const audioFilePath = job.data.audioFilePath

    console.time(tokenId)
    
    console.timeLog(tokenId, `completed upload audio ... ${audioFilePath}`)
    
    attachVideoQueue.add({
        tokenId,
        audioFilePath
    })
})

saveAudioQueue.addListener('completed', job => {
    const tokenId = job.data.tokenId
    const audioFilePath = job.returnvalue

    console.timeLog(tokenId, `completed save audio ... ${audioFilePath}`)

    attachVideoQueue.add({
        tokenId,
        audioFilePath
    })
})

attachVideoQueue.addListener('completed', (job) => {
    const tokenId = job.data.tokenId
    const videoFilePath = job.returnvalue
    
    console.timeLog(tokenId, `completed attach video ... ${videoFilePath}`)

    uploadVideoQueue.add({
        tokenId,
        videoFilePath
    })
})

uploadVideoQueue.addListener('completed', (job) => {
    const tokenId = job.data.tokenId
    const video = job.returnvalue

    console.timeLog(tokenId, `completed upload video ... ${video.url}`)

    updateMetadataQueue.add({
        tokenId,
        video
    })
})

updateMetadataQueue.addListener('completed', job => {
    const tokenId = job.data.tokenId
    const { objectId } = job.returnvalue

    console.timeLog(tokenId, `completed update metadata ... ${objectId}`)

    console.timeEnd(tokenId)
})

saveAudioQueue.addListener('failed', job => {
    const tokenId = job.data.tokenId

    console.timeLog(tokenId,  job.stacktrace)
})

attachVideoQueue.addListener('failed', job => {
    const tokenId = job.data.tokenId

    console.timeLog(tokenId, job.stacktrace)
})

uploadVideoQueue.addListener('failed', job => {
    const tokenId = job.data.tokenId

    console.timeLog(tokenId, job.stacktrace)
})

updateMetadataQueue.addListener('failed', job => {
    const tokenId = job.data.tokenId

    console.timeLog(tokenId, job.stacktrace)
})

console.log(`process has started ... ${new Date().toUTCString()}`)