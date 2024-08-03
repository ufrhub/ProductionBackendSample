/*********************
 * Import necessary packages and modules.
 * - dotenv: Loads environment variables from a .env file into process.env.
 * - path: Provides utilities for working with file and directory paths.
 * - url: Provides utilities for URL resolution and parsing.
 * - Redis: A Redis client from the "ioredis" package.
 * - process: Provides information and control over the current Node.js process.
 *********************/
import DOTENV from "dotenv";
import PATH from "node:path";
import URL from 'node:url';
import { Redis } from "ioredis";
import PROCESS from "node:process";

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
 * Initialize a new Redis instance with the configuration options:
 * - host: The Redis server hostname (from the REDIS_HOST environment variable).
 * - port: The Redis server port (from the REDIS_PORT environment variable).
 * - password: The password for authenticating with the Redis server (from the REDIS_PASSWORD environment variable).
 *********************/
export const REDIS = new Redis({
    host: PROCESS.env.REDIS_HOST,
    port: PROCESS.env.REDIS_PORT,
    password: PROCESS.env.REDIS_PASSWORD,
});
