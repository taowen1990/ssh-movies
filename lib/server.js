const ssh2 = require('ssh2')
const fs = require('fs')
const path = require('path')
const colors = require('colors/safe')
const Connection = require('./connection.js')

const Players = {
  TestPlayer: require('./../players/test.js')
}

module.exports = class Server {
  constructor (bindip, port, logger) {
    this.bindip = bindip
    this.port = port
    this.logger = logger
    this.connections = {}

    const env = process.env.NODE_ENV || 'development'
    const hostKey = fs.readFileSync(path.join(__dirname, '..', 'keys', `${env}_rsa`))

    this.server = ssh2.Server({
      hostKeys: [hostKey]
    }, (client) => { this.onClient(client) })
  }

  onClient (client) {
    const connection = new Connection(client)
    this.connections[connection.id] = connection

    connection.on('authentication', (connection, ctx) => { this.authenticate(connection, ctx) })
    // connection.on('ready', (connection) => { this.play(connection) })
    connection.on('ready', (connection) => { this.welcome(connection) })
    connection.on('end', (connection) => { this.destroyConnection(connection) })

    this.logger.log(`New Connection: ${connection.id}`)
  }

  async authenticate (connection, ctx) {
    ctx.accept() // everyone is welcome!
  }

  async welcome (connection) {
    connection.write(colors.bgBlue.bold(`\r\n *** Welcome to the SSH Image Server! *** \r\n`))
    connection.write('You can type "q" at any time to return to this menu, and again to exit the server.\r\n\r\n')
    connection.write('Type `test` and then return for the test player.\r\n\r\n')
  }

  async play (connection) {
    let playerName = 'TestPlayer'
    this.logger.log(`Connection ${connection.id} playing "${playerName}"`)
    this.connections[connection.id].player = new Players[playerName](connection, this.logger)
    this.connections[connection.id].player.play()
  }

  async stop (connection) {
    if (this.connections[connection.id].player) { this.connections[connection.id].player.stop() }
    delete this.connections[connection.id].player
    this.logger.log(`Connection ${connection.id} stopped`)
  }

  async destroyConnection (connection) {
    this.stop(connection)
    delete this.connections[connection.id]
    this.logger.log(`Connection Destroyed: ${connection.id}`)
  }

  async start () {
    this.server.listen(this.port, this.bindip, () => {
      const address = this.server.address()
      this.logger.log(`Listening on ${address.address}:${address.port}`, 'warn')
    })
  }
}
