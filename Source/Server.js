/*********************
 * Import necessary packages and modules.
 * - dotenv: Loads environment variables from a .env file.
 * - path, url: Used for working with file paths and URLs.
 * - cluster: Used to create worker processes for handling tasks.
 * - os: Provides information about the operating system.
 * - process: Provides information and control over the current Node.js process.
 *********************/
import DOTENV from "dotenv";
import PATH from "node:path";
import URL from 'node:url';
import CLUSTER from "node:cluster";
import OPERATING_SYSTEM from "node:os";
import PROCESS from "node:process";

/*********************
 * Import custom modules and functions.
 * - CONNECT_DATABASE: Function to connect to the database.
 * - Constants: Various constant values used throughout the code.
 * - START_SERVER: Function to start the server.
 * - REDIS: Redis client for interacting with the Redis database.
 * - LOG_ERROR, LOG_WARN, LOG_INFO: Logging functions for different log levels.
 *********************/
import { CONNECT_DATABASE } from "./Database.js";
import {
    CONNECT,
    ONLINE,
    MESSAGE,
    SHUTDOWN,
    DATABASE_CONNECTED,
    EXIT,
    UNHANDLED_REJECTION,
    UNCAUGHT_EXCEPTION,
    SIGTERM,
    SIGINT,
    DISCONNECT,
    LISTENING,
    FORK,
} from "./Utilities/Constants.js";
import { START_SERVER } from "./Application.js";
import { REDIS } from "./Redis.js";
import { LOG_ERROR, LOG_WARN, LOG_INFO } from "./Utilities/WinstonLogger.js";

/*********************
 * Determine the directory name (__dirname) of the current module.
 * This is necessary because __dirname is not available when using ES modules.
 *********************/
const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

/*********************
 * Load environment variables from a .env file located one level above the current directory.
 * These variables are used to configure the application.
 *********************/
DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

/*********************
 * Determine the total number of CPU cores available on the system.
 * This is used to determine the number of worker processes to create.
 *********************/
const totalCPUs = OPERATING_SYSTEM.cpus().length;

/********************* An array to store the process IDs of the forked worker processes. *********************/
const ForkedWorkers = [];

/*********************
 * Set the scheduling policy for the cluster.
 * - On non-Windows platforms, set to Round-Robin (SCHED_RR) to distribute tasks evenly among workers.
 * - On Windows, use the default OS scheduling (SCHED_NONE).
 *********************/
if (PROCESS.platform !== 'win32') {
    CLUSTER.schedulingPolicy = CLUSTER.SCHED_RR; // Set to Round-Robin
} else {
    CLUSTER.schedulingPolicy = CLUSTER.SCHED_NONE; // Leave it to the Operating System
}

/*********************
 * An immediately invoked function expression (IIFE) that sets up the cluster functionality.
 * The function checks if the current process is the primary (master) process or a worker process.
 *********************/
(() => {
    if (CLUSTER.isPrimary) {
        /******* Primary (Master) process logic *******/

        // Log that the primary worker process is running
        LOG_INFO({
            label: "Server.js",
            service: "Primary Worker",
            message: `Primary Worker ${PROCESS.pid} is running...!`,
        });

        /******* 
         * Connect to Redis Database in the Primary Worker process
         * When the connection is successful, attempt to connect to the MongoDB database.
         * If successful, fork worker processes for each available CPU core.
         * If there's an error, log it.
         *******/
        REDIS.on(CONNECT, () => {
            // Log that the Redis is connected to the cloud
            LOG_INFO({
                label: "Server.js",
                service: "Redis Connection",
                message: `Redis is connected to the cloud...!`,
            });

            /* Connect to MongoDB Database in the Primary Worker process */
            CONNECT_DATABASE().then(() => {
                /* Create multiple worker processes, one for each available CPU core */
                for (let i = 0; i < totalCPUs; i++) {
                    CLUSTER.fork();
                }
            }).catch((error) => {
                // Log if error occured while connecting to the database
                LOG_ERROR({
                    label: "Server.js",
                    service: "Connection",
                    error: {
                        error: error.message,
                        message: `An error occured while connection to the Database`,
                    },
                });
            });
        });

        /******* 
         * Event Listener: A new worker process is created (forked).
         * Add the worker's process ID to the ForkedWorkers array.
         *******/
        CLUSTER.on(FORK, (worker) => {
            ForkedWorkers.push(worker.process.pid);
        });

        /******* 
         * Event Listener: A worker process is fully online and ready to handle tasks.
         * If the worker is in the ForkedWorkers array, send it a message that the database is connected.
         *******/
        CLUSTER.on(ONLINE, (worker) => {
            if (ForkedWorkers.includes(worker.process.pid)) {
                worker.send(DATABASE_CONNECTED);
            }
        });

        /******* 
         * Event Listener: A worker starts listening for connections on a specified address and port.
         * Log that the worker is listening.
         *******/
        CLUSTER.on(LISTENING, (worker, address) => {
            if (ForkedWorkers.includes(worker.process.pid)) return;

            LOG_INFO({
                label: "Server.js",
                service: "Listening",
                message: `Worker ${worker.process.pid} is listening on ${address.address}:${address.port}`,
            });
        });

        /******* 
         * Event Listener: A worker's IPC channel has disconnected.
         * Log that the worker has disconnected.
         *******/
        CLUSTER.on(DISCONNECT, (worker) => {
            LOG_WARN({
                label: "Server.js",
                service: "Disconnect",
                message: `Worker ${worker.process.pid} disconnected`,
            });
        });

        /******* 
         * Event Listener: A worker process exits.
         * Log the worker's exit details and fork a new worker process to replace the exited one.
         *******/
        CLUSTER.on(EXIT, (worker, code, signal) => {
            LOG_WARN({
                label: "Server.js",
                service: "Exit",
                message: `Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`,
            });

            // -- Optionally restart the worker
            /* Fork a new worker process to replace the one that exited */
            CLUSTER.fork();
        });

        /******* 
         * Event Listener: The Primary Worker receives a message from a worker.
         * Log the received message.
         *******/
        CLUSTER.on(MESSAGE, (worker, message, handle) => {
            LOG_INFO({
                label: "Server.js",
                service: "Primary Worker Message",
                message: `Primary Worker received message from worker ${worker.process.pid}: ${message}`,
            });
        });

        /******* 
         * Function: GracefullyShutdownWorkers
         * Gracefully shuts down worker processes.
         * - Sends a shutdown message to each worker.
         * - Logs the shutdown signal and waits for workers to shut down before exiting the primary worker process.
         *******/
        const GracefullyShutdownWorkers = (signal, exitCode = 0) => {
            LOG_WARN({
                label: "Server.js",
                service: "GracefullyShutdownWorkers",
                message: `Primary Worker ${PROCESS.pid} received signal: ${signal}. Shutting Down...!`,
            });

            /* Iterate over all worker processes and send a shutdown message */
            Object.values(CLUSTER.workers).forEach((worker) => {
                if (worker.isConnected()) {
                    worker.send(SHUTDOWN);
                }
            });

            /* Wait for workers to shut down gracefully before exiting */
            setTimeout(() => {
                PROCESS.exit(exitCode);
            }, 10000);
        }

        /******* 
         * Event Listener: Handle unhandled promise rejections.
         * Log the unhandled rejection and shut down the workers gracefully.
         *******/
        PROCESS.on(UNHANDLED_REJECTION, (reason, promise) => {
            LOG_ERROR({
                label: "Server.js",
                service: "Unhandled Rejection",
                error: `Unhandled Rejection at: ${promise} reason: ${reason}`,
            });

            GracefullyShutdownWorkers(UNHANDLED_REJECTION, 1);
        });

        /******* 
         * Event Listener: Handle uncaught exceptions.
         * Log the uncaught exception and shut down the workers gracefully.
         *******/
        PROCESS.on(UNCAUGHT_EXCEPTION, (error) => {
            LOG_ERROR({
                label: "Server.js",
                service: "Uncaught Error",
                error: `Uncaught Exception: ${error}`,
            });

            GracefullyShutdownWorkers(UNCAUGHT_EXCEPTION, 1);
        });

        /******* 
         * Event Listener: Handle SIGTERM signal (sent to terminate the process).
         * Shut down the workers gracefully.
         *******/
        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownWorkers(SIGTERM);
        });

        /******* 
         * Event Listener: Handle SIGINT signal (sent when user interrupts process from the terminal, e.g., Ctrl+C).
         * Shut down the workers gracefully.
         *******/
        PROCESS.on(SIGINT, () => {
            GracefullyShutdownWorkers(SIGINT);
        });
    } else if (CLUSTER.isWorker) {
        /******* Worker process logic *******/

        /******* 
         * Event Listener: Listen for messages from the Primary Worker process.
         * - If the message is DATABASE_CONNECTED, start the server.
         * - If the message is SHUTDOWN, log the shutdown and exit the worker process.
         *******/
        PROCESS.on(MESSAGE, (message) => {
            try {
                if (message === DATABASE_CONNECTED) {
                    /* Start the server */
                    START_SERVER();
                }

                if (message === SHUTDOWN) {
                    LOG_INFO({
                        label: "Server.js",
                        service: "Shutdown Worker",
                        message: `Worker ${PROCESS.pid} has shut down...!`,
                    });

                    /* Exit the worker process */
                    PROCESS.exit(0);
                }
            } catch (error) {
                /* Log any errors that occur during message handling */
                LOG_ERROR({
                    label: "Server.js",
                    service: "Message Catch",
                    error: error.message,
                });
            }
        });
    }
})();
