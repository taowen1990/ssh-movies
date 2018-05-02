const EventEmitter = require('events')
const InputHandler = require('./inputHandler.js')

module.exports = class Connection extends EventEmitter {
  constructor (client, authenticate) {
    super()

    this.id = `${client._sock._peername.address}:${client._sock._peername.port}`
    this.client = client
    this.cols = 0
    this.rows = 0
    this.channel = null
    this.player = null
    this.input = ''
    this.inputHandler = new InputHandler(this)

    this.client.on('authentication', (ctx) => { this.emit('authentication', this, ctx) })
    this.client.on('end', () => { this.emit('end', this) })

    client.on('session', (accept) => {
      const session = accept()

      session.on('pty', (accept, reject, info) => {
        this.cols = info.cols
        this.rows = info.rows
        accept()
      })

      session.on('shell', (accept, reject, info) => {
        this.channel = accept()
        this.channel.on('data', (d) => { this.inputHandler.handle(d) })
        this.emit('ready', this)
      })

      session.on('window-change', (accept, reject, info) => {
        this.cols = info.cols
        this.rows = info.rows
        if (typeof accept === 'function') { accept() }
      })
    })
  }

  write (message) {
    this.channel.write(message)
  }

  end () {
    this.client.end()
  }
}
