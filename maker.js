const util = require('util')
const { exec } = require('child_process')
const { watch, writeFile, readFile } = require('fs/promises')
const path = require('path')

const { TapeObject, Query, Object, File } = require('./moralis')

const execAsync = util.promisify(exec)

async function makeShellScript (e, resultPath) {
    const tokenId = path.parse(e.filename).name

    const shellScript = `
docker run -v $(pwd):$(pwd) -w $(pwd) \
jrottenberg/ffmpeg -stats \
-i assets/video.webm \
-i audio/${e.filename} \
-map 0:0 \
-map 1:0 \
${resultPath}
`

    return shellScript

    // const shellScriptPath = `shell/${tokenId}.sh`

    // await writeFile(shellScriptPath, shellScript)

    // return shellScriptPath
}

function sleep(s) {
    return new Promise(function (resolve) {
        setTimeout(resolve, 1000 * s)
    })
}

// move to server.js instead

function makeTapeRecording (cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                return reject('failed processing ... already exists?')
            }

            resolve(stdout.trim())
        })
    })
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

    const fileName = path.basename(filePath)

    const moralisFile = new File(fileName, {
        base64: localFile.toString('base64')
    })

    await moralisFile.save({ useMasterKey: true })

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

        try {
            console.timeLog(t, `found new audio file ... ${new Date().toUTCString()}`)
        
            const localVideoFile = `tapes/${tokenId}.webm`

            await sleep(15)

            const shell = await makeShellScript(e, localVideoFile)

            console.timeLog(t, `prepared shell script... ${shell.substring(shell.length - 13)}`)

            const logs = await makeTapeRecording(shell)

            console.timeLog(t, `combined video tape recording ... ` + localVideoFile)

            const remoteVideoFile = await uploadIpfs(localVideoFile) // `tapes/${e.filename}`

            console.timeLog(t, `uploaded to IPFS ... ${remoteVideoFile.url()}`) // remoteVideoFile.ipfs()

            const { id } = await saveMoralisVideo(tokenId, remoteVideoFile)

            console.timeLog(t, `updated metadata ... ${id}`)
        } catch (e) {
            console.timeLog(t, e.toString())
        }
    
    }
}

// async function watchShell() {
//     const shell = watch('shell')

//     for await (const e of shell) {
//         if (e.eventType !== 'rename') continue;

//         const tokenId = path.parse(e.filename).name

//         const t = `Token #${tokenId}`

//         console.timeLog(t, `found shell script ... generate tape recording`)

//         await makeTapeRecording(e)
//     }
// }

// async function watchTapes() {
//     const tapes = watch('tapes')

//     for await (const e of tapes) {
//         if (e.eventType !== 'rename') continue;

//         const tokenId = path.parse(e.filename).name

//         const t = `Token #${tokenId}`
    

//         // await makeJsonMetadata(e)

//         console.timeEnd(t)
//     }
// }

async function main() {
    watchAudio()

    // watchShell()

    // watchTapes()

    console.log(`tapes maker is running... ${new Date().toUTCString()}`)
}

main()