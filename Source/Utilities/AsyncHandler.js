/********************* 
 * AsynchronousHandler is a higher-order function that takes a RequestHandler
 * function as an argument and returns a new function. This returned function
 * wraps the RequestHandler in a Promise to handle asynchronous errors.
 *********************/
const AsynchronousHandler = (RequestHandler) => (Request, Response, Next) => {
    /*******
     * The RequestHandler is called with the Request, Response, and Next
     * arguments. If the handler returns a promise, Promise.resolve() will
     * ensure that it's handled. If an error occurs, it will be caught and
     * passed to the Next() function, which is an Express middleware function
     * for handling errors.
     *******/
    Promise.resolve(RequestHandler(Request, Response, Next)).catch((error) => Next(error));
}

/********************* 
 * AsyncHandlerTryCatch is another higher-order function for handling asynchronous
 * operations, but it uses the try-catch syntax. It takes a RequestHandler function
 * and returns an async function.
 *********************/
const AsyncHandlerTryCatch = (RequestHandler) => async (Request, Response, Next) => {
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
        })
    }
}

/*********************
 * Exporting both AsynchronousHandler and AsyncHandlerTryCatch so they can be
 * used in other modules. These functions are typically used in Express.js
 * applications to wrap route handlers, ensuring that any errors in asynchronous
 * operations are properly caught and handled.
 *********************/
export { AsynchronousHandler, AsyncHandlerTryCatch };
