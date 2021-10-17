import server from 'server'

const { get, post } = server.router

const port = 3001

server({ port }, [
    post('/create', ctx => {
        return {status: 200, body: 'OK'}
    }),
    get('/', ctx => 'Hello from API'),
    get('/tapes/:creator', ctx => ({
        creator: ctx.params.creator,
        tapes: []
    }))
])

console.log(`server is running on port ${port} ... ${new Date().toUTCString()}`)