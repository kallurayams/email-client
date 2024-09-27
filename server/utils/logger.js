// Standard logging to the console
const winston = require("winston");

const logger = winston.createLogger({
    level: "info", //Default log level
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
                )
            ),
        })
    ]
});

module.exports = { logger };