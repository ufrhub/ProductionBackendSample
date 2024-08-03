/*********************
 * Class to structure API responses consistently.
 * This class is used to format the response sent to the client, ensuring a standard format for success and error messages.
 *********************/
class ApiResponse {
    /*******
     * Constructor for the ApiResponse class.
     * - @param {number} statusCode - The HTTP status code for the response (e.g., 200, 404).
     * - @param {Object} data - The data to be included in the response. This can be any data object that the API returns.
     * - @param {string} [message="Success...!"] - A message to include with the response. Defaults to "Success...!".
     *******/
    constructor(statusCode, data, message = "Success...!") {
        /*******
         * Set the statusCode property to the provided status code.
         *******/
        this.statusCode = statusCode;

        /*******
         * Set the data property to the provided data object.
         *******/
        this.data = data;

        /*******
         * Set the message property to the provided message.
         *******/
        this.message = message;

        /*******
         * Determine success based on the statusCode. Success is true if the status code is less than 400.
         *******/
        this.success = statusCode < 400;
    }
}

/*********************
 * Export the ApiResponse class for use in other parts of the application.
 *********************/
export { ApiResponse };
