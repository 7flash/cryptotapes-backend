const moralis = require('moralis/node')

class TapeObject extends moralis.Object {
    static tableName = 'Tapes'

    constructor() {
        super(TapeObject.tableName)
    }
}

module.exports = TapeObject