const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format
const colors = require('colors/safe')

const LogFormat = printf(info => {
  let levelFormat = colors.reset
  if (info.level === 'silly') { levelFormat = colors.dim }
  if (info.level === 'debug') { levelFormat = colors.dim }
  if (info.level === 'verbose') { levelFormat = colors.dim }
  if (info.level === 'warn') { levelFormat = colors.yellow }
  if (info.level === 'error') { levelFormat = colors.bold.red }

  return `${colors.dim(info.timestamp)} [${levelFormat(info.level)}]: ${info.message}`
})

module.exports = class Logger {
  constructor () {
    this.logger = createLogger({
      format: combine(
        timestamp(),
        LogFormat
      ),
      transports: [new transports.Console()],
      colorize: true
    })
  }

  log (message, level = 'info') {
    this.logger.log(level, message)
  }
}
