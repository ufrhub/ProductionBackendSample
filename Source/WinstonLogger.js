/********************* Import the required Packages *********************/
import WINSTON from 'winston';

/********************* Destructure namespaces from Winston.format *********************/
const { combine, timestamp, label, json, colorize, simple } = WINSTON.format;

const LOGGER = (Label = "Winset Logger", Service = "user-service") => {
    return WINSTON.createLogger({
        level: 'debug',
        format: combine(
            label({ label: Label }),
            timestamp(),
            json(),
        ),
        defaultMeta: { service: Service },
        exitOnError: false,
        silent: false,
        transports: [
            /* Write all logs with importance level of 'error' or less to 'error.log' */
            new WINSTON.transports.File({
                filename: './Logs/error.log',
                level: 'error',
                format: json(),
            }),
            /* Write all logs with importance level of 'warn' or less to 'warning.log' */
            new WINSTON.transports.File({
                filename: './Logs/warning.log',
                level: 'warn',
                format: json(),
            }),
            /* Write all logs with importance level of 'info' or less to 'information.log' */
            new WINSTON.transports.File({
                filename: './Logs/information.log',
                level: 'info',
                format: json(),
            }),
            /* Write all logs with importance level of 'debug' or less to 'debug.log' */
            new WINSTON.transports.File({
                filename: './Logs/debug.log',
                level: 'debug',
                format: json(),
            }),
            /* Console transport for debugging and development */
            new WINSTON.transports.Console({
                handleExceptions: true,
                level: 'debug',
                format: combine(
                    colorize(),
                    simple(),
                ),
            }),
        ],
        exceptionHandlers: [
            new WINSTON.transports.File({ filename: './Logs/exceptions.log' })
        ],
        rejectionHandlers: [
            new WINSTON.transports.File({ filename: './Logs/rejections.log' })
        ],
    });
};

const LOG_INFO = ({ label = "Winset Logger", service = "user-service", message = "" }) => {
    const logger = LOGGER(label, service);
    logger.info(message);
}

const LOG_ERROR = ({ label = "Winset Logger", service = "user-service", error = "" }) => {
    const logger = LOGGER(label, service);
    logger.error(error);
}

const LOG_WARN = ({ label = "Winset Logger", service = "user-service", message = "" }) => {
    const logger = LOGGER(label, service);
    logger.warn(message);
}

const LOG_DEBUG = ({ label = "Winset Logger", service = "user-service", message = "" }) => {
    const logger = LOGGER(label, service);
    logger.debug(message);
}

export { LOG_INFO, LOG_ERROR, LOG_WARN, LOG_DEBUG };
