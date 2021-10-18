import server from 'server'

const { get, post } = server.router

server({
    port: 3001,
    security: false
}, [
    post('/record', (ctx) => {
        const { audio } = ctx.body.object
        
        const { ethAddress } = ctx.body.user

        console.dir(audio, { depth: null })
        
        console.log({ ethAddress })
    
        return 'OK'
    })
])