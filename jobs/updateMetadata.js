const TapeObject = require('../tapeObject')
const moralis = require("../moralis")

module.exports = job => {
    const { tokenId, video } = job.data

    const query = new moralis.Query(new TapeObject())

    query.equalTo('tokenId', tokenId)

    return query.first().then((tapeObject) => {
        if (!tapeObject) throw 'token not ofund'

        tapeObject.set('video', video)

        return tapeObject.save()
    })
}
