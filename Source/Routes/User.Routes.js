/*********************
 * Import necessary packages and modules.
 * - express: The Express.js framework for building web applications and APIs.
 *********************/
import EXPRESS from "express";

/*********************
 * Create a new Router instance.
 * - ROUTER: This instance is used to define route handlers for different HTTP requests.
 *********************/
const ROUTER = EXPRESS.Router();

/*********************
 * Import custom controller functions.
 * - REGISTER_NEW_USER: This function will handle the logic for registering a new user.
 *********************/
import { REGISTER_NEW_USER, LOGIN_USER } from "../Controllers/User.Controller.js";

/*********************
 * Import custom middleware functions.
 * - UPLOAD: A Multer middleware instance configured to handle file uploads. 
 *   This middleware is used for handling multipart/form-data, which is primarily used for uploading files.
 *   The storage configuration defines where and how the uploaded files are stored.
 *********************/
import { UPLOAD } from "../Middlewares/Multer.Middleware.js";

/*********************
 * Define a route for the "/registerNewUser" endpoint.
 * - ROUTER.route("/registerNewUser"): Defines a route path for user registration.
 * 
 * Middleware:
 * - UPLOAD.fields([...]): This middleware handles file uploads for the specified fields.
 *   - The `fields` method allows multiple file fields with different names to be uploaded.
 *   - `name: "avatar"`: Specifies that the uploaded file should be assigned to the `avatar` field.
 *   - `maxCount: 1`: Limits the number of files for this field to 1.
 *   - `name: "coverImage"`: Specifies that the uploaded file should be assigned to the `coverImage` field.
 *   - `maxCount: 1`: Limits the number of files for this field to 1.
 * 
 * Controller:
 * - REGISTER_NEW_USER: This function is called after the files are uploaded and handles the logic
 *   for registering a new user, including saving user data to the database.
 * 
 * Summary:
 * - When a POST request is made to "/registerNewUser", the UPLOAD middleware first handles the file uploads
 *   for `avatar` and `coverImage`, and then the REGISTER_NEW_USER function processes the request.
 *********************/
ROUTER.route("/register").post(
    UPLOAD.fields([
        {
            name: "avatar", // name should be same as in User.Model schema.
            maxCount: 1
        },
        {
            name: "coverImage", // name should be same as in User.Model schema.
            maxCount: 1
        }
    ]),
    REGISTER_NEW_USER
);

/********************* 
 * Define a route for the "/login" endpoint.
 * - ROUTER.route("/login"): Defines a route path for user login.
 *
 * Controller:
 * - LOGIN_USER: This function handles the logic for user login, 
 *   including verifying user credentials and generating authentication tokens.
 *********************/
ROUTER.route("/login").post(LOGIN_USER);

/*********************
 * Export the Router instance.
 * - This allows the ROUTER to be used in other parts of the application, typically
 *   in a main application file where all routes are centralized.
 *********************/
export default ROUTER;
