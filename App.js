require('dotenv').config();
const Express = require("express");
const Cors = require("cors");
const Helmet = require('helmet');
const Morgan = require('morgan'); // Logging middleware
const RateLimit = require("express-rate-limit"); // Rate limiting middleware

const App = Express();
const PORT = process.env.PORT || 7000;

const AllowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
const CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || AllowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS || "Content-Type, Authorization",
    credentials: process.env.CORS_CREDENTIALS === "true",
    preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === "true",
    optionsSuccessStatus: parseInt(process.env.CORS_OPTION_SUCCESS_STATUS) || 200
}
App.use(Cors(CorsOptions));
App.use(Helmet());
App.use(Express.json());
App.use(Morgan('combined')); // Use 'combined' for more detailed logs

// Rate limiting
const Limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, Please try again later."
});
App.use(Limiter);

/********************* Declare The Routes *********************/
App.get("/api/v1/test", (Request, Response) => {
    Response.json(
        [
            {
                message: `App is running on port ${PORT}...!`
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
    Response.status(404).send('Route not found');
});

module.exports = App;