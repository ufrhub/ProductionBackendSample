/********************* Import the required Packages *********************/
import WINSTON from 'winston';
import 'winston-daily-rotate-file';

/********************* Destructure namespaces from Winston.format *********************/
const { combine, timestamp, label, json, colorize, simple } = WINSTON.format;

/********************* Creates and configures a Winston logger instance *********************/
const LOGGER = (Label = "Winset Logger", Service = "user-service") => {
    return WINSTON.createLogger({
        level: 'debug', // Set the default log level to 'debug'
        format: combine(
            label({ label: Label }), // Add a label to each log
            timestamp(), // Add a timestamp to each log
            json(), // Format logs as JSON
        ),
        defaultMeta: { service: Service }, // Add default metadata
        exitOnError: false, // Prevent the process from exiting on an error
        silent: false, // Ensure logs are not suppressed
        transports: [
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-error.log', // File pattern for error logs
                level: 'error', // Log level
                format: json(), // JSON format for the file
                datePattern: 'YYYY-MM-DD', // Date pattern in filename
                zippedArchive: true, // Compress old log files
                maxSize: '20m', // Max file size
                maxFiles: '14d' // Retain files for 14 days
            }),
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-warn.log', // File pattern for warning logs
                level: 'warn', // Log level
                format: json(), // JSON format for the file
                datePattern: 'YYYY-MM-DD', // Date pattern in filename
                zippedArchive: true, // Compress old log files
                maxSize: '20m', // Max file size
                maxFiles: '14d' // Retain files for 14 days
            }),
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-info.log', // File pattern for info logs
                level: 'info', // Log level
                format: json(), // JSON format for the file
                datePattern: 'YYYY-MM-DD', // Date pattern in filename
                zippedArchive: true, // Compress old log files
                maxSize: '20m', // Max file size
                maxFiles: '14d' // Retain files for 14 days
            }),
            new WINSTON.transports.DailyRotateFile({
                filename: './Logs/%DATE%-debug.log', // File pattern for debug logs
                level: 'debug', // Log level
                format: json(), // JSON format for the file
                datePattern: 'YYYY-MM-DD', // Date pattern in filename
                zippedArchive: true, // Compress old log files
                maxSize: '20m', // Max file size
                maxFiles: '14d' // Retain files for 14 days
            }),
            new WINSTON.transports.Console({
                handleExceptions: true, // Handle exceptions in the console
                level: 'debug', // Console log level
                format: combine(
                    colorize(), // Colorize the output
                    simple(), // Simple format for console logs
                ),
            }),
        ],
        exceptionHandlers: [
            new WINSTON.transports.File({ filename: './Logs/exceptions.log' }) // File for exceptions
        ],
        rejectionHandlers: [
            new WINSTON.transports.File({ filename: './Logs/rejections.log' }) // File for rejections
        ],
    });
};

/********************* Function to log an error message *********************/
const LOG_ERROR = ({ label = "Winset Logger", service = "user-service", error = "" }) => {
    /* Create a logger instance with the specified label and service */
    const logger = LOGGER(label, service);
    /* Log the message at the 'debug' level */
    logger.error(error);
}

/********************* Function to log a warning message *********************/
const LOG_WARN = ({ label = "Winset Logger", service = "user-service", message = "" }) => {
    /* Create a logger instance with the specified label and service */
    const logger = LOGGER(label, service);
    /* Log the message at the 'debug' level */
    logger.warn(message);
}

/********************* Function to log an info message *********************/
const LOG_INFO = ({ label = "Winset Logger", service = "user-service", message = "" }) => {
    /* Create a logger instance with the specified label and service */
    const logger = LOGGER(label, service);
    /* Log the message at the 'debug' level */
    logger.info(message);
}

/********************* Function to log a debug message *********************/
const LOG_DEBUG = ({ label = "Winset Logger", service = "user-service", message = "" }) => {
    /* Create a logger instance with the specified label and service */
    const logger = LOGGER(label, service);
    /* Log the message at the 'debug' level */
    logger.debug(message);
}

/********************* Export the LOG_ERROR, LOG_WARN, LOG_INFO, and LOG_DEBUG functions *********************/
export { LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG };
