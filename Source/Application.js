/*********************
 * Import necessary packages and modules.
 * - dotenv: Loads environment variables from a .env file.
 * - path, url: Used for working with file paths and URLs.
 * - express: Web framework for building server-side applications.
 * - http: Provides HTTP server and client functionality.
 * - cookie-parser: Middleware for parsing cookies attached to client requests.
 * - process: Provides information and control over the current Node.js process.
 * - cors: Middleware for enabling CORS (Cross-Origin Resource Sharing).
 * - helmet: Helps secure HTTP headers for security purposes.
 * - express-rate-limit: Middleware to limit repeated requests to public APIs.
 * - morgan: HTTP request logger middleware for Node.js.
 *********************/
import DOTENV from "dotenv";
import PATH from "node:path";
import URL from "node:url";
import EXPRESS from "express";
import HTTP from "node:http";
import COOKIE_PARSER from "cookie-parser";
import PROCESS from "node:process";
import CORS from "cors";
import HELMET from "helmet";
import RATE_LIMIT from "express-rate-limit";
import MORGAN from "morgan";

/*********************
 * Import custom modules and functions.
 * - Constants: Various constant values used throughout the code.
 * - START_WEB_SOCKET_SERVER: Function to start a WebSocket server.
 * - LOG_ERROR, LOG_WARN, LOG_INFO: Logging functions for different log levels.
 *********************/
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
import { LOG_ERROR, LOG_WARN, LOG_INFO } from "./Utilities/WinstonLogger.js";

/*********************
 * Determine the directory name (__dirname) of the current module.
 * This is necessary because __dirname is not available when using ES modules.
 * - __filename: The file URL of the current module.
 * - __dirname: The directory name of the current module.
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
 * Create an instance of the Express application, which will be used to define routes and middleware.
 *********************/
const APPLICATION = EXPRESS();

/*********************
 * Middleware to parse incoming JSON payloads with a body size limit of 16kb.
 * This helps in handling JSON requests safely and efficiently.
 *********************/
APPLICATION.use(EXPRESS.json({ limit: "16kb" }));

/*********************
 * Middleware to parse incoming URL-encoded payloads with a body size limit of 16kb.
 * This is useful for parsing form data.
 *********************/
APPLICATION.use(EXPRESS.urlencoded({ extended: true, limit: "16kb" }));

/*********************
 * Serve static files (e.g., images, CSS, JavaScript) from the "public" directory under the "/static" URL path.
 *********************/
APPLICATION.use('/static', EXPRESS.static("public"));

/*********************
 * Middleware to parse cookies from the incoming request.
 * This is useful for managing session information or other data stored in cookies.
 *********************/
APPLICATION.use(COOKIE_PARSER());

/*********************
 * Define the allowed origins for CORS (Cross-Origin Resource Sharing) based on environment variables.
 * If not specified, default to allowing requests from "http://localhost:3000".
 *********************/
const AllowedOrigins = PROCESS.env.CORS_ORIGINS ? PROCESS.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];

/*********************
 * Define the CORS options for handling cross-origin requests.
 * - origin: Specifies the allowed origins for CORS.
 * - methods: Specifies the allowed HTTP methods.
 * - allowedHeaders: Specifies the allowed headers in requests.
 * - credentials: Specifies whether credentials are allowed.
 * - preflightContinue: Specifies whether to pass the request to the next handler if preflight checks pass.
 * - optionsSuccessStatus: Specifies the status code to return for successful OPTIONS requests.
 *********************/
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

/********************* 
 * Use the CORS middleware with the defined options to enable cross-origin requests. 
 *********************/
APPLICATION.use(CORS(CorsOptions));

/*********************
 * Use the Helmet middleware to set various HTTP headers that help secure the application.
 * This helps protect against common vulnerabilities such as cross-site scripting and clickjacking.
 *********************/
APPLICATION.use(HELMET());

/*********************
 * Define the rate limit options to prevent abuse and limit the number of requests from a single IP.
 * - windowMs: Time window in milliseconds (15 minutes).
 * - max: Maximum number of requests allowed within the time window.
 * - message: Message to send when the rate limit is exceeded.
 *********************/
const Limiter = RATE_LIMIT({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, Please try again later.",
});

/*********************
 * Use the rate limit middleware with the defined options to protect the application from excessive requests.
 *********************/
APPLICATION.use(Limiter);

/*********************
 * Use the Morgan middleware for logging HTTP requests in the 'combined' format.
 * This provides detailed logs including information such as the client IP, request method, status code, and more.
 *********************/
APPLICATION.use(MORGAN('combined'));

/*********************
 * Import router modules for handling specific routes.
 * - Test.Routes: Router module for handling test-related routes.
 * - User.Routes: Router module for handling user-related routes.
 *********************/
import TestRouters from "./Routes/Test.Routes.js";
import USER_ROUTERS from "./Routes/User.Routes.js";

/*********************
 * Define the routes for the application.
 * - /health: A simple health check endpoint that responds with the worker's process ID.
 * - /api/v1: A route prefix for version 1 of the API, handled by the TestRouters module.
 *********************/
APPLICATION.get('/health', (Request, Response) => {
    Response.status(200).json(
        [
            {
                message: `Worker ${PROCESS.pid} is handling the task...!`, // Send a JSON response with a message
            }
        ]
    );
});
APPLICATION.use("/api/v1", TestRouters);
APPLICATION.use("/api/v1/user/", USER_ROUTERS);

/*********************
 * Error handling middleware to catch and respond to errors.
 * Logs the error details using the LOG_ERROR function and sends a generic error message to the client.
 *********************/
APPLICATION.use((Error, Request, Response, Next) => {
    LOG_ERROR({ label: "Application.js", service: "Middleware", error: Error.stack }); // Log error details for internal use
    Response.status(500).send('Something broke!'); // Generic message for users
});

/*********************
 * Middleware to handle 404 (Not Found) errors.
 * Sends a 404 status and message when a requested route is not found.
 *********************/
APPLICATION.use((Request, Response, Next) => {
    Response.status(404).send('Route not found'); // Send a 404 status and message
});

/*********************
 * Set the port on which the server will listen, based on environment variables or defaulting to 7000.
 *********************/
const PORT = PROCESS.env.PORT || 7000;

/*********************
 * Create an HTTP server using the Express application instance.
 * This allows for more control over the server, including WebSocket integration.
 *********************/
const HTTP_SERVER = HTTP.createServer(APPLICATION);

/*********************
 * Function to start the Express server.
 * - Handles errors specific to the application and starts the WebSocket server.
 * - Listens on the specified port and logs server and worker information.
 * - Sets up graceful shutdown procedures for various signals and errors.
 *********************/
const START_SERVER = async () => {
    try {
        /******* 
         * Event Listener: Handle Application-specific Errors 
         * Listen for 'error' events and log the error details.
         *******/
        APPLICATION.on(ERROR, (error) => {
            LOG_ERROR({ label: "Application.js", service: "Server", error: `Application Error: ${error.message}` });
            throw error;
        });

        /******* Start the web socket server. *******/
        START_WEB_SOCKET_SERVER(HTTP_SERVER);

        /******* Start the http server and listen on the specified port. Log the server and worker information. *******/
        const Server = await HTTP_SERVER.listen((PORT), () => {
            LOG_INFO({
                label: "Application.js",
                service: "HTTP_SERVER",
                message: {
                    worker: `Worker ${PROCESS.pid} started`,
                    server: `Server is running on PORT = ${PORT}`,
                }
            });
        });

        /******* 
         * Define a function for graceful shutdown, which takes an exit code as a parameter. 
         * Closes the server and exits the process with the specified exit code.
         *******/
        const GracefullyShutdownServer = (exitCode) => {
            LOG_INFO({
                label: "Application.js",
                service: "GracefullyShutdownServer",
                message: `Worker ${PROCESS.pid} is shutting down...!`
            });

            Server.close(() => {
                LOG_INFO({
                    label: "Application.js",
                    service: "Server.close",
                    message: `Worker ${PROCESS.pid} has shut down...!`
                });

                PROCESS.exit(exitCode);
            });
        }

        /******* 
         * Event Listener: Listen for 'message' events on the process.
         * Handle shutdown requests by gracefully shutting down the server.
         *******/
        PROCESS.on(MESSAGE, (message) => {
            if (message === SHUTDOWN) {
                GracefullyShutdownServer(0); // Gracefully shut down with exit code (0).
            }
        });

        /******* 
         * Event Listener: Handle unhandled promise rejections.
         * Log the error details and gracefully shut down the server.
         *******/
        PROCESS.on(UNHANDLED_REJECTION, (reason, promise) => {
            LOG_ERROR({
                label: "Application.js",
                service: "Unhandled Rejection",
                error: `Unhandled Rejection at: ${promise}, reason: ${reason}`
            });

            GracefullyShutdownServer(1); // Gracefully shut down with exit code (1).
        });

        /******* 
         * Event Listener: Handle uncaught exceptions.
         * Log the error details and gracefully shut down the server.
         *******/
        PROCESS.on(UNCAUGHT_EXCEPTION, (error) => {
            LOG_ERROR({
                label: "Application.js",
                service: "Uncaught Exception",
                error: `Uncaught Exception: ${error}`
            });

            GracefullyShutdownServer(1); // Gracefully shut down with exit code (1).
        });

        /******* 
         * Event Listener: Handle SIGTERM signal (sent to terminate the process). 
         * Gracefully shut down the server with exit code (0).
         *******/
        PROCESS.on(SIGTERM, () => {
            GracefullyShutdownServer(0);
        });

        /******* 
         * Event Listener: Handle SIGINT signal (sent when user interrupts process from the terminal, e.g., Ctrl+C). 
         * Gracefully shut down the server with exit code (0).
         *******/
        PROCESS.on(SIGINT, () => {
            GracefullyShutdownServer(0);
        });
    } catch (error) {
        /******* 
         * Log any error that occurs while starting the server.
         * Exit the process with an error code (1).
         *******/
        LOG_ERROR({
            label: "Application.js",
            service: "starting server catch",
            error: `Error starting server: ${error.message}`
        });

        PROCESS.exit(1);
    }
}

/*********************
 * Export the Express APPLICATION and the START_SERVER function for use in other modules.
 *********************/
export { APPLICATION, START_SERVER };
