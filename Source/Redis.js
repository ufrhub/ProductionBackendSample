/********************* Import the required Packages *********************/
// You can also use `import { Redis } from "ioredis"`
// if your project is a TypeScript project,
// Note that `import Redis from "ioredis"` is still supported,
// but will be deprecated in the next major version.
import DOTENV from "dotenv";
import PATH from "node:path";
import URL from 'node:url';
import Redis from "ioredis";
import PROCESS from "node:process";

/********************* Get the directory name of the current module *********************/
const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

/********************* Load environment variables from .env file *********************/
DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
export const REDIS = new Redis({
    host: PROCESS.env.REDIS_HOST,
    port: PROCESS.env.REDIS_PORT,
    password: PROCESS.env.REDIS_PASSWORD,
});
