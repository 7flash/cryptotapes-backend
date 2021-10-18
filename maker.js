import util from 'util'
import { exec } from 'child_process'
import { watch, writeFile, readFile } from 'fs/promises'
import path from 'path'
import moralis from 'moralis'

const execAsync = util.promisify(exec)

async function makeShellScript (e) {
    const tokenId = path.parse(e.filename).name

    const shellScript = `
#!/bin/bash

docker run -v $(pwd):$(pwd) -w $(pwd) \
jrottenberg/ffmpeg -stats \
-i assets/video.webm \
-i audio/${e.filename} \
-map 0:0 \
-map 1:0 \
tapes/${tokenId}.webm
`

    const shellScriptPath = `shell/${tokenId}.sh`

    await writeFile(shellScriptPath, shellScript)

    return shellScriptPath
}

function sleep() {
    return new Promise(function (resolve) {
        setTimeout(resolve, 1000)
    })
}

async function makeTapeRecording (e) {
    await sleep()

    const cmd = `sh shell/${e.filename}`

    console.log(cmd)

    const { stdout, stderr } = await execAsync(cmd)
}

async function makeJsonMetadata (e) {
    const tokenId = path.parse(e.filename).name

    const image = `tapes/${e.filename}`

    const jsonMetadata = {
        tokenId,
        image
    }

    await writeFile(`metadata/${tokenId}.json`, JSON.stringify(jsonMetadata))
}

async function uploadIpfs(filePath) {
    return 'ipfs://'
}

async function saveMoralisVideo(tokenId, videoUrl) {
    const t = new TapeObject()

    const query = Query(t)

    query.equalTo("tokenId", tokenId)

    const results = await query.find()

    console.dir(results)

    const tape = results[0]

    tape.video = videoUrl

    await tape.save()
}

async function updateMoralisMetadata (e) {
    const tokenId = path.parse(e.filename).name

    // upload video to IPFS via moralis / pinata

    // update moralis object - then user can edit on frontend etc

    // and endpoint to read from moralis
}

async function watchAudio() {
    const audio = watch('audio')

    for await (const e of audio) {
        if (e.eventType !== 'rename') continue;

        const tokenId = path.parse(e.filename).name

        const t = `Token #${tokenId}`

        console.time(t)

        console.timeLog(t, `found new audio file ... ${new Date().toUTCString()}`)
    
        await makeShellScript(e)
    }
}

async function watchShell() {
    const shell = watch('shell')

    for await (const e of shell) {
        if (e.eventType !== 'rename') continue;

        const tokenId = path.parse(e.filename).name

        const t = `Token #${tokenId}`

        console.timeLog(t, `found shell script ... generate tape recording`)

        await makeTapeRecording(e)
    }
}

async function watchTapes() {
    const tapes = watch('tapes')

    for await (const e of tapes) {
        if (e.eventType !== 'rename') continue;

        const tokenId = path.parse(e.filename).name

        const t = `Token #${tokenId}`

        console.timeLog(t, 'found tape recording ... generate metadata')

        const url = await uploadIpfs()

        await saveMoralisVideo(tokenId, url)

        // await makeJsonMetadata(e)

        console.timeEnd(t)
    }
}

async function main() {
    moralis.initialize(
        process
    )

    watchAudio()

    watchShell()

    watchTapes()

    console.log(`tapes maker is running... ${new Date().toUTCString()}`)
}

main()