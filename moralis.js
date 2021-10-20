const moralis = require('moralis/node')
const TapeObject = require('./tapeObject')

require('dotenv').config()

moralis.initialize(
    process.env.MORALIS_APP_ID,
    process.env.MORALIS_KEY,
    process.env.MORALIS_SERVER_URL
)

moralis.serverURL = process.env.MORALIS_SERVER_URL
moralis.masterKey = process.env.MORALIS_KEY

moralis.Object.registerSubclass(TapeObject.tableName, TapeObject)

module.exports = moralis