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
import { REGISTER_NEW_USER, } from "../Controllers/User.Controller.js";

/*********************
 * Define a route for the "/registerNewUser" endpoint.
 * - ROUTER.route("/registerNewUser"): This defines a route path.
 * - .post(REGISTER_NEW_USER): This specifies that the route will handle POST requests
 *   and maps the REGISTER_NEW_USER controller function to this route.
 *********************/
ROUTER.route("/registerNewUser").post(REGISTER_NEW_USER);

/*********************
 * Export the Router instance.
 * - This allows the ROUTER to be used in other parts of the application, typically
 *   in a main application file where all routes are centralized.
 *********************/
export default ROUTER;
