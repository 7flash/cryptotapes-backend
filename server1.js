import server from 'server'

const { get } = server.router

server({
    port: 3001
}, [
    get('/', () => 'response 3001')
])