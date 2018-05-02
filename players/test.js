const colors = require('colors/safe')
const INTERVAL = 1000
const COLORS = [ 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white' ]
const SpecialChars = {
  clear: '\033[3J', // eslint-disable-line
  // reset: '\033c' // eslint-disable-line
}

module.exports = class Player {
  constructor (connection, logger) {
    this.connection = connection
    this.loggger = logger
    this.timer = null
    this.frame = 0
  }

  play () {
    this.tick()
    this.timer = setInterval(this.tick.bind(this), INTERVAL)
  }

  tick () {
    this.frame++
    this.clear()

    let counter = this.frame
    while (counter > COLORS.length) { counter = counter - COLORS.length }
    const color = COLORS[counter]

    let grid = this.solidBackground(color)
    this.sendFrame(grid)
    this.connection.write(colors.gray(`frame ${this.frame} @ ${new Date()}`))
  }

  stop () {
    clearInterval(this.timer)
  }

  clear () {
    this.connection.write(SpecialChars.clear)
  }

  solidBackground (color = 'black') {
    let bgColor = `bg${color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}`
    let grid = []
    for (let i = 0; i < this.connection.rows; i++) {
      let row = []
      for (let j = 0; j < this.connection.cols; j++) {
        row.push(colors[bgColor](' '))
      }
      grid.push(row)
    }

    return grid
  }

  sendFrame (grid) {
    let msg = ''
    grid.forEach((row) => {
      row.forEach((pixel) => { msg += pixel })
      msg += '\r\n'
    })
    this.connection.write(msg)
  }
}
