/*********************
 * Import necessary packages and modules.
 * - jsonwebtoken: Library for creating and verifying JSON Web Tokens (JWTs).
 * - process: Node.js process module to access environment variables.
 *********************/
import JSON_WEB_TOKEN from "jsonwebtoken";
import PROCESS from "node:process";

/*********************
 * Import custom modules and functions.
 * - ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch: Wrappers to handle asynchronous operations and error handling.
 * - API_ERROR: Custom error class for handling API errors.
 * - USER: Mongoose model representing the User schema.
 *********************/
import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";

/*********************
 * Define the AUTHENTICATE_USER middleware.
 * - This middleware authenticates the user by verifying the JWT access token.
 * - If authentication is successful, the user's data is attached to the request object.
 * - If authentication fails, an appropriate error is thrown.
 *********************/
export const AUTHENTICATE_USER = ASYNCHRONOUS_HANDLER(async (Request, Response, Next) => {
    try {
        /*******
         * Extract the JWT token from either cookies or the Authorization header.
         * - If no token is found, throw a 401 Unauthorized error.
         *******/
        const Token = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!Token) throw new API_ERROR(401, "Unauthorized request...!");

        /*******
         * Verify the extracted token using the secret key stored in environment variables.
         * - If the token is invalid or expired, this will throw an error.
         *******/
        const DecodedToken = await JSON_WEB_TOKEN.verify(Token, PROCESS.env.ACCESS_TOKEN_SECRET);

        /*******
         * Find the user in the database using the ID from the decoded token.
         * - The password and refresh token are excluded from the returned data.
         * - If the user does not exist, throw a 401 Unauthorized error.
         *******/
        const User = await USER.findById(DecodedToken._id).select("-password -refreshToken");
        if (!User) throw new API_ERROR(401, "Invalid Access Token...!");

        /*******
         * Attach the authenticated user data to the request object.
         * - This allows access to the user data in subsequent middleware or routes.
         *******/
        Request.User = User;

        /*******
         * Call the next middleware or route handler.
         *******/
        Next();
    } catch (error) {
        /*******
         * If an error occurs during the authentication process:
         * - A new API_ERROR is thrown with a status code of 500 (Internal Server Error).
         * - The original error message, additional error details, and stack trace are included.
         *******/
        throw new API_ERROR(500, error?.message, [error], error.stack);
    }
});
