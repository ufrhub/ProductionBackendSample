/*********************
 * Import necessary packages and modules.
 * - mongoose: MongoDB object modeling tool to define schemas and interact with the MongoDB database.
 * - Schema: Mongoose's schema constructor used to define the structure of a MongoDB document.
 * - process: Node.js process module to access environment variables.
 * - bcrypt: Library for hashing and comparing passwords.
 * - jsonwebtoken: Library for creating and verifying JSON Web Tokens (JWTs).
 *********************/
import MONGOOSE, { Schema } from "mongoose";
import PROCESS from "node:process";
import BCRYPT from "bcryptjs";
import JSON_WEB_TOKEN from "jsonwebtoken";

/*********************
 * Import custom modules and functions.
 * - Constants: Various constant values used throughout the code.
 * - API_ERROR: Custom error class for handling API errors.
 *********************/
import { SAVE } from "../Utilities/Constants.js";
import { API_ERROR } from "../Utilities/ApiError.js";

/*********************
 * Define the User Schema
 * - USER_SCHEMA: Mongoose schema to define the structure of User documents in MongoDB.
 * - username: Unique identifier for the user, stored in lowercase.
 * - email: User's email address, also unique and stored in lowercase.
 * - fullName: User's full name.
 * - avatar: URL to the user's avatar image.
 * - coverImage: Optional URL to the user's cover image.
 * - watchHistory: Array of references to videos the user has watched.
 * - password: Hashed password for the user.
 * - refreshToken: Optional token used to refresh the user's session.
 * - Timestamps: Automatically adds createdAt and updatedAt fields.
 *********************/
const USER_SCHEMA = new Schema(
    {
        username: {
            type: String, // User's username.
            required: [true, "Username is required...!"],
            unique: true, // Must be unique.
            lowercase: true, // Convert to lowercase.
            trim: true, // Remove leading/trailing whitespace.
            index: true, // Create an index for efficient querying.
        },
        email: {
            type: String, // User's email address.
            required: [true, "Email is required...!"],
            unique: true, // Must be unique.
            lowercase: true, // Convert to lowercase.
            trim: true, // Remove leading/trailing whitespace.
        },
        fullName: {
            type: String, // Full name of the user.
            required: [true, "Name is required...!"],
            index: true, // Create an index for efficient querying.
        },
        avatar: {
            type: String, // Cloudinary Url to the user's avatar image.
            required: [true, "Avatar is required...!"],
        },
        coverImage: {
            type: String, // Cloudinary Url to the user's cover image.
            required: false,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId, // Reference to watched videos.
                required: false, // Not required.
                ref: "Videos", // Refers to the "Videos" model.
            }
        ],
        password: {
            type: String, // User's password.
            required: [true, "Password is required...!"],
        },
        refreshToken: {
            type: String, // Refresh token for the user.
            required: false, // Not required.
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

/*********************
 * Pre-save Middleware to Hash Passwords
 * - USER_SCHEMA.pre("save"): Mongoose middleware that runs before saving a document.
 * - If the password field is modified, it hashes the password before saving it to the database.
 * - The number of salt rounds for hashing is set to 12.
 *********************/
USER_SCHEMA.pre(SAVE, async function (Next) {
    if (!this.isModified("password")) return Next();

    const SaltRounds = 12;
    this.password = await BCRYPT.hash(this.password, SaltRounds);
    Next();
});

/*********************
 * Method to Check Password Validity
 * - isPasswordCorrect: Compares the provided password with the hashed password stored in the database.
 * - Returns true if the passwords match, false otherwise.
 *********************/
USER_SCHEMA.methods.isPasswordCorrect = async function (Password) {
    return await BCRYPT.compare(Password, this.password);
}

/*********************
 * Method to Generate Access Token
 * - GenerateAccessToken: Generates a JWT for the user that includes the user's ID, email, username, and full name.
 * - The token is signed with the ACCESS_TOKEN_SECRET from the environment variables and expires according to the ACCESS_TOKEN_EXPIRY.
 *********************/
USER_SCHEMA.methods.GenerateAccessToken = async function () {
    return await JSON_WEB_TOKEN.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        PROCESS.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: PROCESS.env.ACCESS_TOKEN_EXPIRY // Token expiration time
        },
    );
}

/*********************
 * Method to Generate Refresh Token
 * - GenerateRefreshToken: Generates a JWT that contains only the user's ID.
 * - The token is signed with the REFRESH_TOKEN_SECRET from the environment variables and expires according to the REFRESH_TOKEN_EXPIRY.
 *********************/
USER_SCHEMA.methods.GenerateRefreshToken = async function (AccessToken) {
    if (!AccessToken) {
        throw new API_ERROR(
            500,
            "Access Token not found...!",
            [
                {
                    label: "User.Model.js",
                    message: "Access Token not found...!",
                }
            ]
        );
    }

    return await JSON_WEB_TOKEN.sign(
        {
            _id: this._id,
            accessToken: AccessToken
        },
        PROCESS.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: PROCESS.env.REFRESH_TOKEN_EXPIRY // Token expiration time
        },
    );
}

/*********************
 * Create and Export the User Model
 * - USER: Mongoose model for the User schema.
 * - The model is exported so that it can be used to interact with the User collection in the MongoDB database.
 * 
 * Explanation:
 * - MONGOOSE.model("Users", USER_SCHEMA) creates a Mongoose model named "USER" based on the USER_SCHEMA.
 * - The "Users" argument specifies the name of the MongoDB collection that this model will interact with. 
 *   Mongoose automatically pluralizes the name, so "Users" corresponds to the "users" collection in MongoDB.
 * - The USER_SCHEMA defines the structure and validation of the documents within the "users" collection.
 * - By creating the USER model, you now have a class that allows you to perform CRUD operations 
 *   (Create, Read, Update, Delete) on documents in the "users" collection.
 * 
 * Example Usage:
 * - You can use the USER model to create a new user, find users, update user information, or delete users.
 * - For example, USER.create() can be used to add a new user to the collection, 
 *   and USER.find() can be used to retrieve user documents from the collection.
 *********************/
export const USER = MONGOOSE.model("Users", USER_SCHEMA);
