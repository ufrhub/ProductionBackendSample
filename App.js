/********************* Load environment variables from .env file *********************/
require('dotenv').config();

/********************* Import the required Packages *********************/
const Express = require("express");
const Process = require('node:process');
const Cors = require("cors");
const Helmet = require('helmet');
const Morgan = require('morgan');
const RateLimit = require("express-rate-limit");

/********************* Create an instance of the Express application *********************/
const App = Express();

/********************* Set the port from environment variables or default to 7000 *********************/
const PORT = Process.env.PORT || 7000;

/********************* Define allowed origins for CORS from environment variables or default to localhost *********************/
const AllowedOrigins = Process.env.CORS_ORIGINS ? Process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];

/********************* Define CORS options *********************/
const CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || AllowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: Process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: Process.env.CORS_ALLOWED_HEADERS || "Content-Type, Authorization",
    credentials: Process.env.CORS_CREDENTIALS === "true",
    preflightContinue: Process.env.CORS_PREFLIGHT_CONTINUE === "true",
    optionsSuccessStatus: parseInt(Process.env.CORS_OPTION_SUCCESS_STATUS) || 200
}

/********************* Use middleware to parse JSON requests *********************/
App.use(Express.json());

/********************* Use CORS middleware with the defined options *********************/
App.use(Cors(CorsOptions));

/********************* Use Helmet middleware to secure HTTP headers *********************/
App.use(Helmet()); // It helps increase security by setting various HTTP headers that protect against common web vulnerabilities

/********************* Use Morgan middleware for logging in 'combined' format *********************/
App.use(Morgan('combined')); // Use 'combined' for more detailed logs

/********************* Define rate limit options *********************/
const Limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, Please try again later.", // Message to send when rate limit is exceeded
});

/********************* Use rate limit middleware *********************/
App.use(Limiter);

/********************* Declare the Routes *********************/
App.get("/api/v1/test", (Request, Response) => {
    Response.json(
        [
            {
                message: `App is running on port ${PORT}...!`, // Send a JSON response with a message
            }
        ]
    )
})

/********************* Error handling middleware *********************/
App.use((Error, Request, Response, Next) => {
    console.error(Error.stack); // Log error details for internal use
    Response.status(500).send('Something broke!'); // Generic message for users
});

/********************* Catch-all for 404 - Not Found *********************/
App.use((Request, Response, Next) => {
    Response.status(404).send('Route not found'); // Send a 404 status and message
});

/********************* Export the Express App *********************/
module.exports = App;
