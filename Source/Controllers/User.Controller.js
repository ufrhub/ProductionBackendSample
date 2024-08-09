import { ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch } from "../Utilities/AsyncHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";
import { UPLOAD_FILE_ON_CLOUDINARY } from "../Utilities/Cloudinary.js";

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

    const {
        username,
        email,
        fullName,
        password,
    } = Request.body;

    if (
        [username, email, fullName, password,].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new API_ERROR(400, "All fields are required...!"); // Bad Request
    }

    const existingUser = await USER.findOne({
        $or: [{ username: username }, { email: email }]
    });

    if (existingUser) throw new API_ERROR(400, "User already exist...!"); // Bad Request

    const avatarLocalPath = Request.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (!avatarLocalPath) throw new API_ERROR(400, "Avatar file is required...!"); // Bad Request

    if (Request.files && Array.isArray(Request.files.coverImage) && Request.files.coverImage.length > 0) {
        coverImageLocalPath = Request.files.coverImage[0].path;
    }

    const uploadAvatarOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(avatarLocalPath);
    const uploadCoverImageOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(coverImageLocalPath);

    if (!uploadAvatarOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading avatar...!");
    if (!uploadCoverImageOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading coverImage...!");

    USER.create({
        username,
        email,
        fullName,
        password,
        avatar: uploadAvatarOnCloudinary.url
    })
});
