const Logger = require('./lib/logger.js')
const Server = require('./lib/server.js')

const PORT = process.env.PORT || 2222
const BINDIP = process.env.BIND || '0.0.0.0'

const logger = new Logger()
const server = new Server(BINDIP, PORT, logger)

server.start()
