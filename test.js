const { Object, Query, TapeObject } = require('./moralis')

async function main() {
    // const tape = Object.extend('Tapes')

    const tape = new TapeObject()

    const query = new Query(tape)
    
    // const allTapes = await query.findAll()

    // console.dir(allTapes)

    const oneTape = await query.get('mv49oC5lFl2dpEXXU9J4imiI')

    console.dir(oneTape)

    const audioUrl = (await oneTape.get('audio')).url()

    console.log(audioUrl)
    
    oneTape.videoUrl = 'xxx'

    await oneTape.save()
}

main()