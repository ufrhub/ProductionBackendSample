/*********************
 * Import custom modules and functions.
 * - ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch: Wrappers to handle asynchronous operations and error handling.
 * - API_ERROR: Custom error class for handling API errors.
 * - USER: Mongoose model representing the User schema.
 * - UPLOAD_FILE_ON_CLOUDINARY: Function to upload files to Cloudinary.
 * - API_RESPONSE: Custom class for standardized API responses.
 * - GENERATE_REFRESH_AND_ACCESS_TOKEN: Function to generate JWT access and refresh tokens.
 *********************/
import { ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";
import { UPLOAD_FILE_ON_CLOUDINARY } from "../Utilities/Cloudinary.js";
import { API_RESPONSE } from "../Utilities/ApiResponse.js";
import { GENERATE_REFRESH_AND_ACCESS_TOKEN } from "../Utilities/TokensGenerator.js";

/*********************
 * Define the REGISTER_NEW_USER controller.
 * - Handles user registration by validating input, checking for existing users, 
 *   uploading files to Cloudinary, creating the user in the database, and returning a response.
 *********************/
export const REGISTER_NEW_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    /*******
     * Destructure required fields from the request body.
     *******/
    const {
        username,
        email,
        fullName,
        password,
    } = Request.body;

    /*******
     * Validate that all required fields are provided and not empty.
     * - If any field is missing or empty, throw a Bad Request (400) error.
     *******/
    if (
        [username, email, fullName, password,].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new API_ERROR(400, "All fields are required...!"); // Bad Request
    }

    /*******
     * Check if a user with the same username or email already exists in the database.
     * - If such a user exists, throw a Bad Request (400) error.
     *******/
    const ExistingUser = await USER.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (ExistingUser) throw new API_ERROR(400, "User already exist...!"); // Bad Request

    /*******
     * Get the path of the avatar file from the uploaded files.
     * - If no avatar file is provided, throw a Bad Request (400) error.
     *******/
    const AvatarLocalPath = Request.files?.avatar[0]?.path;
    let CoverImageLocalPath;

    if (!AvatarLocalPath) throw new API_ERROR(400, "Avatar file is required...!"); // Bad Request

    /*******
     * Check if a cover image file was uploaded.
     * - If a cover image was uploaded, get its local file path.
     *******/
    if (Request.files && Array.isArray(Request.files.coverImage) && Request.files.coverImage.length > 0) {
        CoverImageLocalPath = Request.files.coverImage[0].path;
    }

    /*******
     * Upload the avatar and cover image files to Cloudinary.
     * - If the upload fails, throw an Internal Server Error (500) error.
     *******/
    const UploadAvatarOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(AvatarLocalPath);
    const UploadCoverImageOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(CoverImageLocalPath);

    if (!UploadAvatarOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading avatar...!");
    if (!UploadCoverImageOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading coverImage...!");

    /*******
     * Create a new user object in the database with the provided details and uploaded file URLs.
     * - If user creation fails, throw an Internal Server Error (500) error.
     *******/
    const CreatedUser = await USER.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: UploadAvatarOnCloudinary.url,
        coverImage: UploadCoverImageOnCloudinary?.url || "",
    });

    if (!CreatedUser) throw new API_ERROR(500, "Something went wrong while registering new User...!");

    /*******
     * Return a successful response with the user's ID.
     *******/
    return Response.status(201).json(
        new API_RESPONSE(200, CreatedUser._id, "User registered successfully...!")
    );
});

/*********************
 * Define the LOGIN_USER controller.
 * - Handles user login by validating input, checking for existing users,
 *   verifying the password, generating JWT tokens, and returning a response.
 *********************/
export const LOGIN_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and referesh token
    // send cookie

    /*******
     * Destructure required fields from the request body.
     * - Either `username` or `email` is required for login.
     * - `password` is also required.
     *******/
    const {
        username,
        email,
        password
    } = Request.body;

    /*******
     * Validate that either `username` or `email` is provided.
     * - If neither is provided, throw a Bad Request (400) error.
     *******/
    if (!username && !email) {
        throw new API_ERROR(400, "Username or email required...!");
    }

    /*******
     * Validate that the `password` is provided.
     * - If the password is missing, throw a Bad Request (400) error.
     *******/
    if (!password) {
        throw new API_ERROR(400, "Password required...!");
    }

    let User;

    /*******
     * Find the user in the database based on the provided `username` or `email`.
     * - If a user with the provided credentials does not exist, throw a Not Found (404) error.
     *******/
    if (username) {
        User = await USER.findOne({ username: username.toLowerCase() });
    } else if (email) {
        User = await USER.findOne({ email: email.toLowerCase() });
    }

    if (!User) throw new API_ERROR(404, "User does not exist with this username or email...!");

    /*******
     * Check if the provided password matches the user's stored password.
     * - If the password is incorrect, throw a Bad Request (400) error.
     *******/
    const isPasswordMatched = await User.isPasswordCorrect(password);

    if (!isPasswordMatched) throw new API_ERROR(400, "Incorrect password...!");

    /*******
     * Generate access and refresh tokens for the user.
     * - These tokens will be used for authentication and session management.
     *******/
    const { AccessToken, RefreshToken } = GENERATE_REFRESH_AND_ACCESS_TOKEN({ User });

    /*******
     * Prepare the user data to be returned in the response.
     * - Include only necessary fields and exclude sensitive data like passwords.
     *******/
    const UserData = {
        _id: User._id,
        username: User.username,
        email: User.email,
        fullName: User.fullName,
        avatar: User.avatar,
        coverImage: User.coverImage,
        watchHistory: User.watchHistory,
        accessToken: AccessToken,
        refreshToken: RefreshToken,
    }

    /*******
     * Define options for setting cookies.
     * - `httpOnly` ensures the cookie is only accessible by the web server.
     * - `secure` ensures the cookie is sent over HTTPS.
     *******/
    const CookieOptions = {
        httpOnly: true,
        secure: true
    }

    /*******
     * Send the response with the user data and set the access and refresh tokens in cookies.
     * - Return a success status (200) with the user data and tokens.
     *******/
    return Response.status(200)
        .cookie("accessToken", AccessToken, CookieOptions)
        .cookie("refreshToken", RefreshToken, CookieOptions)
        .json(
            new API_RESPONSE(
                200,
                {
                    user: UserData,
                },
                "User logged in Successfully...!"
            )
        );
});
