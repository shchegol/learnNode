const config = require('config')
const server = require('./server')

let port = config.get('port')
let hostname = config.get('hostname')

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`))