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
 * - LOGIN_USER: This function will handle the logic for logging in a user.
 * - LOGOUT_USER: This function will handle the logic for logging out a user.
 *********************/
import { REGISTER_NEW_USER, LOGIN_USER, LOGOUT_USER } from "../Controllers/User.Controller.js";

/*********************
 * Import custom middleware functions.
 * - UPLOAD: A Multer middleware instance configured to handle file uploads. 
 *   This middleware is used for handling multipart/form-data, which is primarily used for uploading files.
 *   The storage configuration defines where and how the uploaded files are stored.
 * - AUTHENTICATE_USER: Middleware function that verifies the user's authentication status 
 *   by checking the validity of the access token. This middleware ensures that only authenticated 
 *   users can access certain routes, such as logging out.
 *********************/
import { UPLOAD } from "../Middlewares/Multer.Middleware.js";
import { AUTHENTICATE_USER } from "../Middlewares/Authentication.Middleware.js"

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
 * Define a route for the "/logout" endpoint.
 * - ROUTER.route("/logout"): Defines a route path for user logout.
 *
 * Middleware:
 * - AUTHENTICATE_USER: This middleware function is executed before the LOGOUT_USER controller. 
 *   It verifies the user's authentication status by checking the access token. If the user is 
 *   authenticated, the request proceeds to the LOGOUT_USER function; otherwise, an error is returned.
 *
 * Controller:
 * - LOGOUT_USER: This function handles the logic for logging out the user, including clearing 
 *   the user's authentication tokens from cookies and the database.
 *
 * Summary:
 * - When a POST request is made to "/logout", the AUTHENTICATE_USER middleware first verifies the user's 
 *   authentication status, and if successful, the LOGOUT_USER function processes the logout request.
 *********************/
ROUTER.route("/logout").post(AUTHENTICATE_USER, LOGOUT_USER);

/*********************
 * Export the Router instance.
 * - This allows the ROUTER to be used in other parts of the application, typically
 *   in a main application file where all routes are centralized.
 *********************/
export default ROUTER;
