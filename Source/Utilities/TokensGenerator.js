/*********************
 * Import custom modules and functions.
 * - API_ERROR: Custom error class for handling API errors.
 * - USER: Mongoose model representing the User schema.
 *********************/
import { USER } from "../Models/User.Model.js";
import { API_ERROR } from "./ApiError";

export const GENERATE_REFRESH_AND_ACCESS_TOKEN = async ({ User, _id, username, email }) => {
    if (User) {
        const AccessToken = User.GenerateAccessToken();
        const RefreshToken = User.GenerateRefreshToken();

        return { AccessToken, RefreshToken };
    }

    if (_id) {
        const AvailableUser = await USER.findById(_id);

        if (!AvailableUser) {
            throw new API_ERROR(500, "Incorrect _id provided...!",
                [
                    { label: "TokensGenerator.js", service: "GENERATE_ACCESS_TOKEN", error: `Incorrect _id provided...!` }
                ]
            );
        }

        const AccessToken = User.GenerateAccessToken();
        const RefreshToken = User.GenerateRefreshToken();

        return { AccessToken, RefreshToken };
    }

    if (username || email) {
        const AvailableUser = await USER.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
        });

        if (!AvailableUser) {
            throw new API_ERROR(500, "Incorrect username or email provided...!",
                [
                    { label: "TokensGenerator.js", service: "GENERATE_ACCESS_TOKEN", error: `Incorrect username or email provided...!` }
                ]
            );
        }

        const AccessToken = User.GenerateAccessToken();
        const RefreshToken = User.GenerateRefreshToken();

        return { AccessToken, RefreshToken };
    }

    return null;
}
