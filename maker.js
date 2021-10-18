const util = require('util')
const { exec } = require('child_process')
const { watch, writeFile, readFile } = require('fs/promises')
const path = require('path')

const { TapeObject, Query, Object, File } = require('./moralis')

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
    const localFile = await readFile(path.join(__dirname, filePath))

    console.log(localFile)

    const fileName = path.basename(filePath)

    const moralisFile = new File(fileName, {
        base64: localFile.toString('base64')
    })

    await moralisFile.saveIPFS({ useMasterKey: true })

    return moralisFile
}

async function saveMoralisVideo(tokenId, video) {
    const t = new TapeObject()
    
    const query = new Query(t)

    query.equalTo("tokenId", Number.parseInt(tokenId))

    const tape = await query.first()

    if (!tape) {
        throw 'saveMoralisVideo: cannot find tape with ID ' + tokenId
    }

    tape.set('video', video)

    await tape.save()

    return tape
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
    
        console.timeLog(t, `found tape recording ... ${e.filename}`)

        try {
            const video = await uploadIpfs(`tapes/${e.filename}`)

            console.timeLog(t, `uploaded to IPFS ... ${video.ipfs()}`)

            const { id } = await saveMoralisVideo(tokenId, video)

            console.timeLog(t, `updated metadata ... ${id}`)
        } catch (e) {
            console.timeLog(t, e.toString())
        }
    
        // await makeJsonMetadata(e)

        console.timeEnd(t)
    }
}

async function main() {
    watchAudio()

    watchShell()

    watchTapes()

    console.log(`tapes maker is running... ${new Date().toUTCString()}`)
}

main()