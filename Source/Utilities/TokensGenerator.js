/*********************
 * Import custom modules and functions.
 * - ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch: Wrappers to handle asynchronous operations and error handling.
 * - 
 * - USER: Mongoose model representing the User schema.
 * - UPLOAD_FILE_ON_CLOUDINARY: Function to upload files to Cloudinary.
 * - 
 *********************/
import { USER } from "../Models/User.Model.js";
import { API_ERROR } from "./ApiError";

export const GENERATE_ACCESS_TOKEN = async ({ User, _id, username, email }) => {
    if (User) {

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
    }

    return null;
}

export const GENERATE_REFRESH_TOKEN = () => { }