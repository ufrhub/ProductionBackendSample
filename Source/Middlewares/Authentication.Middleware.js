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
 * - EXTRACT_FROM_STRING: Helper function that returns an object containing the extracted substrings.
 * - USER: Mongoose model representing the User schema.
 *********************/
import { ASYNCHRONOUS_HANDLER } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { EXTRACT_FROM_STRING } from "../Utilities/HelperFunctions.js";
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
        const AuthorizationHeader = Request.cookies?.accessToken || Request.header("Authorization")?.replace("Bearer ", "");
        if (!AuthorizationHeader) throw new API_ERROR(401, "Unauthorized request...!");

        /*******
         * Extract a specific part of the Authorization header.
         * - `ExtractBefore: "."`: Extracts the substring up to the second occurrence of a period.
         * - `CountExtractBefore: 2`: Specifies to count and extract up to the second occurrence.
         * - `OriginalString: AuthorizationHeader`: The full Authorization header string.
         * - `CharactersToExtractBefore: 24`: Extracts up to 24 characters before the specified position.
         * - The extracted substring is stored in `ExtractedAuthorizationHeader`.
         *******/
        const ExtractedAuthorizationHeader = EXTRACT_FROM_STRING({
            ExtractBefore: ".",
            CountExtractBefore: 2,
            OriginalString: AuthorizationHeader,
            CharactersToExtractBefore: 24,
        });

        /*******
         * Assign the extracted token string to the `Token` variable.
         * - `UpdatedString` is the extracted part from the previous operation.
         *******/
        const Token = ExtractedAuthorizationHeader.UpdatedString;

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
         * - A new API_ERROR is thrown with a status code.
         * - The original error message, additional error details, and stack trace are included.
         *******/
        throw new API_ERROR(error?.statusCode, error?.message, [error], error?.stack);
    }
});
