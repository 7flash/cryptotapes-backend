const fs = require('fs')
const path = require('path')
const moralis = require("../moralis")

module.exports = job => {
    const { videoFilePath } = job.data

    const videoFileName = path.basename(videoFilePath)
    
    return new Promise((resolve, reject) => {
        fs.readFile(videoFilePath, (err, data) => {
            if (err) return reject(err)

            const file = new moralis.File(videoFileName, {
                base64: data.toString('base64')
            })
    
            file.save({ useMasterKey: true }).then((x) => {
                resolve(file)
            })
        })
    })
}