import server from 'server'

const { get, post } = server.router

server({
    port: 3001,
    security: false
}, [
    post('/create', (ctx) => {
        console.dir(ctx)
        
        return 'OK'
    })
])