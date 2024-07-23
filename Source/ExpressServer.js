/********************* Import the required Packages *********************/
import PROCESS from "node:process";

/********************* Import the required files and functions *********************/
import { APPLICATION } from "./Application.js";
import {
    MESSAGE,
    SHUTDOWN,
    UNHANDLED_REJECTION,
    UNCAUGHT_EXCEPTION
} from "./Utilities/Constants.js";

/********************* Set the port from environment variables or default to 7000 *********************/
const PORT = PROCESS.env.PORT || 7000;

/********************* Function to start the Express Server *********************/
const START_EXPRESS_SERVER = async () => {
    try {
        /* Start the server and listen on the specified port. Log the server and worker information. */
        const Server = await APPLICATION.listen((PORT), () => {
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
    } catch (error) {
        console.error(`Error starting server: ${error.message}`); // Log any error that occurs while starting the server.
        PROCESS.exit(1); // Exit the process with an error code.
    }
}

export { START_EXPRESS_SERVER };