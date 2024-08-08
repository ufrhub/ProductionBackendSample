/*********************
 * Custom error class to handle API-related errors.
 * Extends the built-in Error class to include additional properties specific to API errors.
 *********************/
class API_ERROR extends Error {
    /*******
     * Constructor for the API_ERROR class.
     * - @param {number} statusCode - The HTTP status code associated with the error.
     * - @param {string} [message="Something went wrong"] - A descriptive error message. Defaults to "Something went wrong".
     * - @param {Array} [errors=[]] - An optional array of additional error details. Defaults to an empty array.
     * - @param {string} [stack=""] - An optional stack trace. If not provided, a stack trace will be generated.
     *******/
    constructor(
        statusCode,
        message = "Something went wrong...!",
        errors = [],
        stack = ""
    ) {
        /*******
         * Call the parent class constructor with the message parameter.
         *******/
        super(message);

        /*******
         * Set the statusCode property to the provided status code.
         *******/
        this.statusCode = statusCode;

        /*******
         * Set the success property to false to indicate an error state.
         *******/
        this.success = false;

        /*******
         * Set the data property to null as there is no associated data.
         *******/
        this.data = null;

        /*******
         * Set the message property to the provided error message.
         *******/
        this.message = message;

        /*******
         * Set the errors property to the provided array of additional error details.
         *******/
        this.errors = errors;

        /*******
         * If a custom stack trace is provided, set the stack property to it.
         * Otherwise, generate a stack trace using Error.captureStackTrace.
         *******/
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/*********************
 * Export the API_ERROR class for use in other parts of the application.
 *********************/
export { API_ERROR };
