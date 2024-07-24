/********************* Import the required Packages *********************/
import WINSTON from 'winston';

/********************* Destructure namespaces from Winston.format *********************/
const { combine, timestamp, label, printf, json, colorize, simple } = WINSTON.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const LOGGER = WINSTON.createLogger({
    level: 'info',
    format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        json(),
        myFormat,
    ),
    defaultMeta: { service: 'user-service' },
    exitOnError: true,
    silent: false,
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new WINSTON.transports.File({
            filename: './Logs/error.log',
            level: 'error',
            format: json(),
        }),
        new WINSTON.transports.File({
            filename: './Logs/combined.log',
            level: 'info',
            format: json(),
        }),
        new WINSTON.transports.Console({
            handleExceptions: true,
            level: 'info',
            format: combine(
                colorize(),
                simple(),
            ),
        }),
    ],
    exceptionHandlers: [
        new WINSTON.transports.File({ filename: './Logs/exceptions.log' })
    ],
});

export { LOGGER };
