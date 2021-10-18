import server from 'server'
import axios from 'axios'

const { get } = server.router

server({
    port: 3002
}, [
    get('/', () => {
        return 'response from 3002'        
    })
]).then(async () => {
    const res = await  axios.get('http://localhost:3001/')

    console.dir(res.data)
})