const appRoot = require("app-root-path")
const winston = require("winston")

const options = {
    file: {
        level: "info",
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false
    },

    console: {
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true,
    }
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(options.console),
      new winston.transports.File(options.file)
    ]
  });

logger.stream = {
    write: (message, encoding)=> { logger.info(message)}
}

module.exports = logger