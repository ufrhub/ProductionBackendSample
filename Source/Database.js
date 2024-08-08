/*********************
 * Import necessary packages and modules.
 * - dotenv: Loads environment variables from a .env file into process.env.
 * - path: Provides utilities for working with file and directory paths.
 * - url: Provides utilities for URL resolution and parsing.
 * - mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.
 * - process: Provides information and control over the current Node.js process.
 *********************/
import DOTENV from "dotenv";
import PATH from "node:path";
import URL from "node:url";
import MONGOOSE from "mongoose";
import PROCESS from "node:process";

/*********************
 * Import custom modules and functions.
 * - Constants: Various constant values used throughout the code.
 * - LOG_ERROR, LOG_WARN, LOG_INFO: Logging functions for different log levels.
 *********************/
import { DATABASE_NAME } from "./Utilities/Constants.js";
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
 * A flag to indicate whether the application is currently connected to MongoDB.
 * This helps prevent multiple connections from being established.
 *********************/
let isConnected = false;

/*********************
 * The URI for connecting to the MongoDB database.
 * It is retrieved from the environment variable MongoDB_URI.
 *********************/
const MongoDB_URI = PROCESS.env.MongoDB_URI;

/*********************
 * Asynchronously connects to the MongoDB database.
 * The function checks if the application is already connected or if the MongoDB URI is not set.
 * If the URI is available, it attempts to establish a connection using Mongoose.
 * If the connection is successful, it logs a confirmation message and sets the isConnected flag to true.
 * If there is an error during the connection, it logs the error and exits the process with an error code.
 *********************/
const CONNECT_DATABASE = async () => {
    if (isConnected) {
        console.log("Already connected to MongoDB");
        LOG_INFO({
            label: "Database.js",
            service: "isConnected",
            message: `Already connected to MongoDB`
        });

        return;
    }

    if (!MongoDB_URI) {
        throw new Error("MongoDB_URI environment variable is not set");
    }

    try {
        const ConnectionInstance = await MONGOOSE.connect(`${MongoDB_URI}/${DATABASE_NAME}`);
        isConnected = true;

        LOG_INFO({
            label: "Database.js",
            service: "Mongoose Connect",
            message: `MongoDB Database Connected...! \nDATABASE HOST = ${ConnectionInstance.connection.host}`
        });
    } catch (error) {
        LOG_ERROR({
            label: "Database.js",
            service: "Mongoose Connect catch",
            error: `MongoDB connection error: ${error}`
        });

        isConnected = false;
        PROCESS.exit(1)
    }
}

/*********************
 * Export the CONNECT_DATABASE function for use in other parts of the application.
 * This function handles the connection logic to the MongoDB database.
 *********************/
export { CONNECT_DATABASE };
