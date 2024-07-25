/********************* Import the required Packages *********************/
import DOTENV from "dotenv";
import PATH from "path";
import URL from 'url';
import EXPRESS from "express";
import HTTP from "node:http";
import COOKIE_PARSER from "cookie-parser";
import PROCESS from "node:process";
import CORS from "cors";
import HELMET from "helmet";
import RATE_LIMIT from "express-rate-limit";
import MORGAN from "morgan";

/********************* Import the required files and functions *********************/
import {
    ERROR,
    MESSAGE,
    SHUTDOWN,
    UNHANDLED_REJECTION,
    UNCAUGHT_EXCEPTION,
    SIGTERM,
    SIGINT,
} from "./Utilities/Constants.js";
import { START_WEB_SOCKET_SERVER } from "./WebSocket.js";

/********************* Import The Routers *********************/
import TestRouters from "./Routes/TestRouters.js";

/********************* Get the directory name of the current module *********************/
const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

/********************* Load environment variables from .env file *********************/
DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

/********************* Create an instance of the Express application *********************/
const APPLICATION = EXPRESS();

/********************* Use EXPRESS.json middleware to parse JSON requests with a body size limit of 16kb *********************/
APPLICATION.use(EXPRESS.json({ limit: "16kb" }));

/********************* Use EXPRESS.urlencoded middleware to parse incoming URL-encoded requests with a body size limit of 16kb *********************/
APPLICATION.use(EXPRESS.urlencoded({ extended: true, limit: "16kb" }));

/********************* Serve static files from the "public" directory *********************/
APPLICATION.use('/static', EXPRESS.static("public"));

/********************* Use the COOKIE_PARSER middleware to parse cookies attached to the client request object *********************/
APPLICATION.use(COOKIE_PARSER());

/********************* Define allowed origins for CORS from environment variables or default to localhost *********************/
const AllowedOrigins = PROCESS.env.CORS_ORIGINS ? PROCESS.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];

/********************* Define CORS options *********************/
const CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || AllowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: PROCESS.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: PROCESS.env.CORS_ALLOWED_HEADERS || "Content-Type, Authorization",
    credentials: PROCESS.env.CORS_CREDENTIALS === "true",
    preflightContinue: PROCESS.env.CORS_PREFLIGHT_CONTINUE === "true",
    optionsSuccessStatus: parseInt(PROCESS.env.CORS_OPTION_SUCCESS_STATUS) || 200
};

/********************* Use CORS middleware with the defined options *********************/
APPLICATION.use(CORS(CorsOptions));

/********************* Use Helmet middleware to secure HTTP headers *********************/
APPLICATION.use(HELMET()); // It helps increase security by setting various HTTP headers that protect against common web vulnerabilities

/********************* Define rate limit options *********************/
const Limiter = RATE_LIMIT({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, Please try again later.", // Message to send when rate limit is exceeded
});

/********************* Use Morgan middleware for logging in 'combined' format *********************/
APPLICATION.use(MORGAN('combined')); // Use 'combined' for more detailed logs

/********************* Use rate limit middleware *********************/
APPLICATION.use(Limiter);

/********************* Declare the Routes *********************/
APPLICATION.get('/health', (Request, Response) => {
    Response.status(200).send('OK');
});
APPLICATION.use("/api/v1", TestRouters);

/********************* Error handling middleware *********************/
APPLICATION.use((Error, Request, Response, Next) => {
    console.error(Error.stack); // Log error details for internal use
    Response.status(500).send('Something broke!'); // Generic message for users
});

/********************* Catch-all for 404 - Not Found *********************/
APPLICATION.use((Request, Response, Next) => {
    Response.status(404).send('Route not found'); // Send a 404 status and message
});

/********************* Set the port from environment variables or default to 7000 *********************/
const PORT = PROCESS.env.PORT || 7000;

/********************* Create an HTTP server using the Express application instance *********************/
const HTTP_SERVER = HTTP.createServer(APPLICATION);

/********************* Function to start the Express Server *********************/
const START_SERVER = async () => {
    try {
        /* Handle Application-specific Errors */
        APPLICATION.on(ERROR, (error) => {
            console.log("Application Error: ", error);
            throw error;
        });

        /* Start the web socket server. */
        START_WEB_SOCKET_SERVER(HTTP_SERVER);

        /* Start the http server and listen on the specified port. Log the server and worker information. */
        const Server = await HTTP_SERVER.listen((PORT), () => {
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

        /* Triggered: SIGTERM is typically sent to request a process to terminate. */
        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownServer(0); // Gracefully shut down with exit code 0.
        });

        /* Triggered: SIGINT is typically sent when a user interrupts a process from the terminal, usually by pressing Ctrl+C. */
        PROCESS.on(SIGINT, () => {
            GracefullyShutdownServer(0); // Gracefully shut down with exit code 0.
        });
    } catch (error) {
        console.error(`Error starting server: ${error.message}`); // Log any error that occurs while starting the server.
        PROCESS.exit(1); // Exit the process with an error code.
    }
}

/********************* Export the Express App *********************/
export { APPLICATION, START_SERVER };
