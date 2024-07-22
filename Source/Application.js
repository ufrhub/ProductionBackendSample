/********************* Import the required Packages *********************/
import DOTENV from "dotenv";
import PATH from "path";
import URL from 'url';
import EXPRESS from "express";
import PROCESS from "node:process";
import CORS from "cors";
import HELMET from "helmet";
import RATE_LIMIT from "express-rate-limit";
import MORGAN from "morgan";

/********************* Get the directory name of the current module *********************/
const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

/********************* Load environment variables from .env file *********************/
DOTENV.config({
    path: PATH.resolve(__dirname, '../.env')
});

/********************* Import The Routers *********************/
import TestRouters from "./Routes/TestRouters.js";

/********************* Create an instance of the Express application *********************/
const APPLICATION = EXPRESS();

/********************* Use middleware to parse JSON requests *********************/
APPLICATION.use(EXPRESS.json());

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
}

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

/********************* Export the Express App *********************/
export { APPLICATION };
