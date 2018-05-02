module.exports = class InputHandler {
  constructor (connection) {
    this.connection = connection
  }

  handle (buffer) {
    const letter = buffer.toString()

    // handle requests for disconnect from the client
    if (letter === 'q') {
      this.connection.end()
    }
  }
}
