/*********************
 * Import custom modules and functions.
 * - USER: Mongoose model representing the User schema.
 * - INSERT_INTO_STRING: Helper function to insert string into another string.
 * - API_ERROR: Custom error class for handling API errors.
 *********************/
import { USER } from "../Models/User.Model.js";
import { INSERT_INTO_STRING } from "./HelperFunctions.js";
import { API_ERROR } from "./ApiError.js";

/*********************
 * GENERATE_REFRESH_AND_ACCESS_TOKEN
 * - This function generates access and refresh tokens for a user.
 * - The function accepts an object that can contain either the `User` object itself, or the user's `_id`, `username`, or `email`.
 * - Depending on the input, it fetches the user from the database and generates the tokens.
 * - If the user does not exist, it throws an API_ERROR.
 *********************/
export const GENERATE_REFRESH_AND_ACCESS_TOKEN = async ({ User, _id, username, email }) => {
    try {
        /*******
         * If the `User` object is provided directly:
         * - Generate access and refresh tokens.
         * - Store the generated refresh token in the `refreshToken` field of the `User` object.
         * - Save the updated `User` object to the database without triggering validation.
         * - Modify and return the AccessToken and RefreshToken.
         *******/
        if (User) {
            const AccessToken = await User.GenerateAccessToken();
            const RefreshToken = await User.GenerateRefreshToken(AccessToken);

            /*******
             * Store the generated refresh token in the `refreshToken` field of the `User` object.
             * - This line assigns the newly generated `RefreshToken` to the `refreshToken` field of the `User` instance.
             * - Storing the refresh token in the database allows it to be invalidated if needed, enhancing security.
             *******/
            User.refreshToken = RefreshToken;

            /*******
             * Save the updated `User` object to the database without triggering validation.
             * - The `save` method is called to persist the changes made to the `User` object, including the new `refreshToken`.
             * - `{ validateBeforeSave: false }`: Disables validation checks before saving, which can be useful if other fields are incomplete 
             *   or if validation is unnecessary for this specific operation.
             *******/
            await User.save({ validateBeforeSave: false });

            /*******
             * Modify the AccessToken by inserting the User's `_id` before the second occurrence of the "." character.
             * - This uses the `INSERT_INTO_STRING` function to insert the `_id` into the token string.
             * - The modified token enhances the token structure with additional information.
             *******/
            const UpdatedAccessToken = INSERT_INTO_STRING({
                InsertBefore: ".",
                CountInsertBefore: 2,
                OriginalString: AccessToken,
                InsertStringBefore: User._id,
            });

            /*******
             * Return the modified AccessToken and the RefreshToken.
             *******/
            return { AccessToken: UpdatedAccessToken, RefreshToken };
        }

        /*******
         * If the user's `_id` is provided:
         * - Find the user by `_id` in the database.
         * - If the user is not found, throw an API_ERROR with a message indicating that the user does not exist.
         * - If the user is found, generate access and refresh tokens.
         * - Store the generated refresh token in the `refreshToken` field of the `AvailableUser` object.
         * - Save the updated `AvailableUser` object to the database without triggering validation.
         * - Modify and return the AccessToken and RefreshToken.
         *******/
        if (_id) {
            const AvailableUser = await USER.findById(_id);

            if (!AvailableUser) {
                throw new API_ERROR(500, "User does not exist with this _id...!");
            }

            const AccessToken = await AvailableUser.GenerateAccessToken();
            const RefreshToken = await AvailableUser.GenerateRefreshToken(AccessToken);

            /*******
             * Store the generated refresh token in the `refreshToken` field of the `AvailableUser` object.
             * - This line assigns the newly generated `RefreshToken` to the `refreshToken` field of the `AvailableUser` instance.
             * - Storing the refresh token in the database allows it to be invalidated if needed, enhancing security.
             *******/
            AvailableUser.refreshToken = RefreshToken;

            /*******
             * Save the updated `AvailableUser` object to the database without triggering validation.
             * - The `save` method is called to persist the changes made to the `AvailableUser` object, including the new `refreshToken`.
             * - `{ validateBeforeSave: false }`: Disables validation checks before saving, which can be useful if other fields are incomplete 
             *   or if validation is unnecessary for this specific operation.
             *******/
            await AvailableUser.save({ validateBeforeSave: false });

            /*******
             * Modify the AccessToken by inserting the User's `_id` before the second occurrence of the "." character.
             * - This uses the `INSERT_INTO_STRING` function to insert the `_id` into the token string.
             * - The modified token enhances the token structure with additional information.
             *******/
            const UpdatedAccessToken = INSERT_INTO_STRING({
                InsertBefore: ".",
                CountInsertBefore: 2,
                OriginalString: AccessToken,
                InsertStringBefore: _id,
            });

            /*******
             * Return the modified AccessToken and the RefreshToken.
             *******/
            return { AccessToken: UpdatedAccessToken, RefreshToken };
        }

        /*******
         * If the user's `username` or `email` is provided:
         * - Find the user by `username` or `email` in the database.
         * - If the user is not found, throw an API_ERROR with a message indicating that the user does not exist.
         * - If the user is found, generate access and refresh tokens.
         * - Store the generated refresh token in the `refreshToken` field of the `AvailableUser` object.
         * - Save the updated `AvailableUser` object to the database without triggering validation.
         * - Modify and return the AccessToken and RefreshToken.
         *******/
        if (username || email) {
            const AvailableUser = await USER.findOne({
                $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
            });

            if (!AvailableUser) {
                throw new API_ERROR(500, "User does not exist with this username or email...!");
            }

            const AccessToken = await AvailableUser.GenerateAccessToken();
            const RefreshToken = await AvailableUser.GenerateRefreshToken(AccessToken);

            /*******
             * Store the generated refresh token in the `refreshToken` field of the `AvailableUser` object.
             * - This line assigns the newly generated `RefreshToken` to the `refreshToken` field of the `AvailableUser` instance.
             * - Storing the refresh token in the database allows it to be invalidated if needed, enhancing security.
             *******/
            AvailableUser.refreshToken = RefreshToken;

            /*******
             * Save the updated `AvailableUser` object to the database without triggering validation.
             * - The `save` method is called to persist the changes made to the `AvailableUser` object, including the new `refreshToken`.
             * - `{ validateBeforeSave: false }`: Disables validation checks before saving, which can be useful if other fields are incomplete 
             *   or if validation is unnecessary for this specific operation.
             *******/
            await AvailableUser.save({ validateBeforeSave: false });

            /*******
             * Modify the AccessToken by inserting the User's `_id` before the second occurrence of the "." character.
             * - This uses the `INSERT_INTO_STRING` function to insert the `_id` into the token string.
             * - The modified token enhances the token structure with additional information.
             *******/
            const UpdatedAccessToken = INSERT_INTO_STRING({
                InsertBefore: ".",
                CountInsertBefore: 2,
                OriginalString: AccessToken,
                InsertStringBefore: AvailableUser._id,
            });

            /*******
             * Return the modified AccessToken and the RefreshToken.
             *******/
            return { AccessToken: UpdatedAccessToken, RefreshToken };
        }

        /*******
         * If none of the conditions are met, return null.
         *******/
        return null;
    } catch (error) {
        /*******
         * If an error occurs during the process, throw an API_ERROR with the statusCode, 
         *   error message, errors and error stack for debugging.
         *******/
        throw new API_ERROR(error?.statusCode, error?.message, [error], error.stack);
    }
}
