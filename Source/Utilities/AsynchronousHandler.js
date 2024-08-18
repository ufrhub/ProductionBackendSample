/*********************
 * Import custom modules and functions.
 * - API_ERROR: Custom error class for handling API errors.
 * - LOG_ERROR: Logging functions for error logs.
 *********************/
import { API_ERROR } from "./ApiError.js";
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
         * Throws a new instance of the custom API_ERROR class.
         * - `error?.statusCode || 500`: Uses the error's code property as the HTTP status code, or defaults to 500 if not available.
         * - `error?.message`: The error message to be included in the response.
         * - `[error]`: An array containing the original error object, useful for additional context.
         * - `error?.stack`: The stack trace for debugging purposes, passed along with the error.
         * This effectively propagates the error, ensuring that it can be caught and logged by other middleware.
         *******/
        throw new API_ERROR(error?.statusCode || 500, error?.message, [error], error?.stack);
    }
}

/*********************
 * Exporting both AsynchronousHandler and AsyncHandlerTryCatch so they can be
 * used in other modules. These functions are typically used in Express.js
 * applications to wrap route handlers, ensuring that any errors in asynchronous
 * operations are properly caught and handled.
 *********************/
export { ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch };
