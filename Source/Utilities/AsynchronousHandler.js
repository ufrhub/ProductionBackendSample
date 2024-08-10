/*********************
 * Import custom modules and functions.
 * - LOG_ERROR: Logging functions for error logs.
 *********************/
import { LOG_ERROR } from "./WinstonLogger.js";

/********************* 
 * AsynchronousHandler is a higher-order function that takes a RequestHandler
 * function as an argument and returns a new function. This returned function
 * wraps the RequestHandler in a Promise to handle both synchronous and asynchronous errors.
 *********************/
const ASYNCHRONOUS_HANDLER = (RequestHandler) => {
    /*******
     * The middleware function is returned here, which takes in three parameters:
     * - Request: The incoming HTTP request object from the client.
     * - Response: The HTTP response object used to send a response back to the client.
     * - Next: A callback function that passes control to the next middleware in the Express stack.
     * This returned function wraps the original RequestHandler function and includes error-handling logic.
     *******/
    return (Request, Response, Next) => {
        try {
            /*******
             * The RequestHandler is called with the Request, Response, and Next
             * arguments. If the handler returns a promise, Promise.resolve() will
             * ensure that it's handled. If an error occurs during the execution of
             * the handler, it will be caught and passed to the Next() function,
             * which is an Express middleware function for handling errors.
             *******/
            Promise.resolve(RequestHandler(Request, Response, Next))
                .catch((error) => {
                    // Log the error
                    LOG_ERROR({
                        label: "AsynchronousHandler.js",
                        service: "catch",
                        error: `Error in RequestHandler: ${error}`
                    });

                    /*******
                     * Pass the error to the next middleware function for handling.
                     *******/
                    Next(error);
                });
        } catch (error) {
            // If a synchronous error occurs, log the error
            LOG_ERROR({
                label: "AsynchronousHandler.js",
                service: "catch",
                error: `Synchronous error in RequestHandler: ${error}`
            });

            /*******
             * Pass the error to the next middleware function for handling.
             *******/
            Next(error);
        }
    }
}

/********************* 
 * AsyncHandlerTryCatch is another higher-order function for handling asynchronous
 * operations, but it uses the try-catch syntax. It takes a RequestHandler function
 * and returns an async function.
 *********************/
const ASYNCHRONOUS_HANDLER_TryCatch = (RequestHandler) => async (Request, Response, Next) => {
    try {
        /*******
         * The RequestHandler is awaited here, meaning it can handle asynchronous
         * operations. If the operation is successful, nothing else happens.
         *******/
        await RequestHandler(Request, Response, Next);
    } catch (error) {
        /*******
         * If an error is thrown, it's caught in this block. The error response
         * is sent back to the client with a status code. If the error object
         * has a 'code' property, it's used as the status code; otherwise, a
         * default of 500 (Internal Server Error) is used. The response contains
         * a success flag set to false and the error message.
         *******/
        Response.status(error.code || 500).json({
            success: false,
            message: error.message
        });
    }
}

/*********************
 * Exporting both AsynchronousHandler and AsyncHandlerTryCatch so they can be
 * used in other modules. These functions are typically used in Express.js
 * applications to wrap route handlers, ensuring that any errors in asynchronous
 * operations are properly caught and handled.
 *********************/
export { ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch };
