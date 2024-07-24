/********************* Import the required Packages *********************/
import DOTENV from "dotenv";
import PATH from "path";
import URL from 'url';
import CLUSTER from "node:cluster";
import OPERATING_SYSTEM from "node:os";
import PROCESS from "node:process";

/********************* Import the required files and functions *********************/
import { CONNECT_DATABASE } from "./Database.js";
import {
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
import APPLICATION from "./Application.js";

/********************* Get the directory name of the current module *********************/
const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

/********************* Load environment variables from .env file *********************/
DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

/********************* Get the number of CPU cores available *********************/
const totalCPUs = OPERATING_SYSTEM.cpus().length;

/********************* Store the forked workers *********************/
const isWorkerForked = [];

/********************* Set the Cluster scheduling policy *********************/
if (PROCESS.platform === 'win32') {
    CLUSTER.schedulingPolicy = CLUSTER.SCHED_RR; // Set to Round-Robin
} else {
    CLUSTER.schedulingPolicy = CLUSTER.SCHED_NONE; // Leave it to the Operating System
}

/********************* Handle the Cluster functionality *********************/
(() => {
    if (CLUSTER.isPrimary) {
        console.info(`Primary Worker ${PROCESS.pid} is running...!`); // Log the Primary Worker process ID

        /* Connect to MongoDB Database in the Primary Worker process */
        CONNECT_DATABASE().then(() => {
            for (let i = 0; i < totalCPUs; i++) {
                CLUSTER.fork();
            }
        }).catch((error) => {
            console.error({
                error: error,
                message: `An error occured while connection to the Database`,
            });
        });

        /* Triggered When: A new worker process is created. */
        CLUSTER.on(FORK, (worker) => {
            console.log(`Worker ${worker.process.pid} forked`);
            isWorkerForked.push(worker.process.pid);
        });

        /* Triggered When: A worker process is fully online and ready to handle tasks. */
        CLUSTER.on(ONLINE, (worker) => {
            console.log(`Worker ${worker.process.pid} is online`);
            if (isWorkerForked.includes(worker.process.pid)) {
                worker.send(DATABASE_CONNECTED);
            }
        });

        /* Triggered When: A worker starts listening for connections on a specified address and port. */
        CLUSTER.on(LISTENING, (worker, address) => {
            console.log(`Worker ${worker.process.pid} is listening on ${address.address}:${address.port}`);
        });

        /* Triggered When: A worker's IPC channel has disconnected. */
        CLUSTER.on(DISCONNECT, (worker) => {
            console.log(`Worker ${worker.process.pid} disconnected`);
        });

        /* Triggered When: A worker process exits. */
        CLUSTER.on(EXIT, (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`); // Log worker exit details
            // -- Optionally restart the worker
            /* Fork a new worker process to replace the one that exited */
            CLUSTER.fork();
        });

        /* Triggered When: The Primary Worker receives a message from a worker. */
        CLUSTER.on(MESSAGE, (worker, message, handle) => {
            console.log(`Primary Worker received message from worker ${worker.process.pid}: ${message}`);
        });

        /* Gracefully shutdown workers function to handle gracefully shutdown workers */
        const GracefullyShutdownWorkers = (signal, exitCode = 0) => {
            console.info(`Primary Worker ${PROCESS.pid} received signal: ${signal}. Shutting Down...!`);
            /* Iterate over all worker processesr */
            Object.values(CLUSTER.workers).forEach((worker) => {
                /* Send a shutdown message to each worker */
                if (worker.isConnected()) {
                    worker.send(SHUTDOWN);
                }
            });
            /* Wait for workers to shutdown gracefully before exiting the Primary Worker process */
            setTimeout(() => {
                PROCESS.exit(exitCode);
            }, 10000);
        }

        /* Handle unhandled promise rejections. */
        PROCESS.on(UNHANDLED_REJECTION, (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            GracefullyShutdownWorkers(UNHANDLED_REJECTION, 1);
        });

        /* Handle uncaught exceptions. */
        PROCESS.on(UNCAUGHT_EXCEPTION, (error) => {
            console.error(`Uncaught Exception: ${error}`);
            GracefullyShutdownWorkers(UNCAUGHT_EXCEPTION, 1);
        });

        /* Triggered: SIGTERM is typically sent to request a process to terminate. */
        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownWorkers(SIGTERM);
        });

        /* Triggered: SIGINT is typically sent when a user interrupts a process from the terminal, usually by pressing Ctrl+C. */
        PROCESS.on(SIGINT, () => {
            GracefullyShutdownWorkers(SIGINT);
        });
    } else if (CLUSTER.isWorker) {
        /* Listen for messages from the Primary Worker process */
        PROCESS.on(MESSAGE, (message) => {
            try {
                if (message === DATABASE_CONNECTED) {
                    /* Start the server */
                    APPLICATION.StartServer();
                }

                if (message === SHUTDOWN) {
                    console.info(`Worker ${PROCESS.pid} has shut down...!`);
                    /* Exit the worker process */
                    PROCESS.exit(0);
                }
            } catch (error) {
                /* Log the error message */
                console.error(error.message);
            }
        });
    }
})();
