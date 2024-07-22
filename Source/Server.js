/********************* Import the required Packages *********************/
import DOTENV from "dotenv";
import PATH from "path";
import { fileURLToPath } from 'url';
import CLUSTER from "node:cluster";
import OPERATING_SYSTEM from "node:os";
import PROCESS from "node:process";

/********************* Import the required files and functions *********************/
import { ConnectDatabase } from "./Database.js";
import { App } from "./App.js";
import { ONLINE, MESSAGE, SHUTDOWN, UNHANDLED_REJECTION, UNCAUGHT_EXCEPTION, DATABASE_CONNECTED, EXIT, ERROR, SIGTERM, SIGINT, DISCONNECT, LISTENING, FORK } from "./Constants.js";

/********************* Get the directory name of the current module *********************/
const __filename = fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

/********************* Load environment variables from .env file *********************/
DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

/********************* Set the port from environment variables or default to 7000 *********************/
const PORT = PROCESS.env.PORT || 7000;

/********************* Function to start the Express Server *********************/
const StartServer = async () => {
    try {
        /* Start the server and listen on the specified port. Log the server and worker information. */
        const Server = await App.listen((PORT), () => {
            console.info({
                worker: `Worker ${PROCESS.pid} started`,
                server: `Server is running on PORT = ${PORT}`,
            });
        });

        /* Define a function for graceful shutdown, which takes an exit code as a parameter. */
        const GracefullyShutdownServer = (exitCode) => {
            console.info(`Worker ${PROCESS.pid} is shutting down...!`);
            Server.close(() => {
                console.log(`Worker ${PROCESS.pid} has shut down...!`);
                PROCESS.exit(exitCode);
            });
        }

        /* Listen for 'message' events on the process. */
        PROCESS.on(MESSAGE, (message) => {
            // Handle shutdown requests.
            if (message === SHUTDOWN) {
                GracefullyShutdownServer(0); // Gracefully shut down with exit code 0.
            }
        });

        /* Handle unhandled promise rejections. */
        PROCESS.on(UNHANDLED_REJECTION, (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            GracefullyShutdownServer(1); // Gracefully shut down with exit code 1.
        });

        /* Handle uncaught exceptions. */
        PROCESS.on(UNCAUGHT_EXCEPTION, (error) => {
            console.error(`Uncaught Exception: ${error}`);
            GracefullyShutdownServer(1); // Gracefully shut down with exit code 1.
        });
    } catch (Error) {
        console.error(`Error starting server: ${Error.message}`); // Log any error that occurs while starting the server.
        PROCESS.exit(1); // Exit the process with an error code.
    }
}

/********************* Get the number of CPU cores available *********************/
const totalCPUs = OPERATING_SYSTEM.cpus().length;

/********************* Store the forked workers *********************/
const isWorkerForked = [];

/********************* Handle the Cluster functionality *********************/
(() => {
    if (CLUSTER.isMaster) {
        console.info(`Master ${PROCESS.pid} is running...!`); // Log the master process ID

        /* Connect to MongoDB Database in the master process */
        ConnectDatabase().then(() => {
            for (let i = 0; i < totalCPUs; i++) {
                CLUSTER.fork();
            }
        }).catch((Error) => {
            console.error({
                error: Error,
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

        /* Triggered When: The master receives a message from a worker. */
        CLUSTER.on(MESSAGE, (worker, message, handle) => {
            console.log(`Master received message from worker ${worker.process.pid}: ${message}`);
        });

        /* Gracefully shutdown workers function to handle gracefully shutdown workers */
        const GracefullyShutdownWorkers = (signal) => {
            console.info(`Master ${PROCESS.pid} received signal: ${signal}. Shutting Down...!`);
            /* Iterate over all worker processesr */
            Object.values(CLUSTER.workers).forEach((worker) => {
                /* Send a shutdown message to each worker */
                if (worker.isConnected()) {
                    worker.send(SHUTDOWN);
                }
            });
            /* Wait for workers to shutdown gracefully before exiting the master process */
            setTimeout(() => {
                PROCESS.exit(0);
            }, 10000);
        }

        /* Triggered: SIGTERM is typically sent to request a process to terminate. */
        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownWorkers(SIGTERM);
        });

        /* Triggered: SIGINT is typically sent when a user interrupts a process from the terminal, usually by pressing Ctrl+C. */
        PROCESS.on(SIGINT, () => {
            GracefullyShutdownWorkers(SIGINT);
        });
    } else {
        /* Listen for messages from the master process */
        PROCESS.on(MESSAGE, (message) => {
            if (message === DATABASE_CONNECTED) {
                /* Start the server */
                StartServer();
            }

            if (message === SHUTDOWN) {
                console.info(`Worker ${PROCESS.pid} has shut down...!`);
                /* Exit the worker process */
                PROCESS.exit(0);
            }
        });
    }
})();
