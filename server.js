import server from 'server'

const { get, post } = server.router

server({
    port: 3001
}, [
    post('/create', (ctx) => {
        console.dir(ctx)
        
        return 'OK'
    })
])