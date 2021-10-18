const moralis = require('moralis/node')

require('dotenv').config()

class TapeObject extends moralis.Object {
    static tableName = 'Tapes'

    constructor() {
        super(TapeObject.tableName)
    }
}

moralis.initialize(
    process.env.MORALIS_APP_ID,
    process.env.MORALIS_KEY,
    process.env.MORALIS_SERVER_URL
)

moralis.serverURL = process.env.MORALIS_SERVER_URL

moralis.Object.registerSubclass(TapeObject.tableName, TapeObject)

module.exports = {
    TapeObject: TapeObject,
    Query: moralis.Query,
    Object: moralis.Object
}