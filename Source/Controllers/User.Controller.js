import { ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch } from "../Utilities/AsynchronousHandler.js";
import { API_ERROR } from "../Utilities/ApiError.js";
import { USER } from "../Models/User.Model.js";
import { UPLOAD_FILE_ON_CLOUDINARY } from "../Utilities/Cloudinary.js";
import { API_RESPONSE } from "../Utilities/ApiResponse.js";

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

    const ExistingUser = await USER.findOne({
        $or: [{ username }, { email }]
    });

    if (ExistingUser) throw new API_ERROR(400, "User already exist...!"); // Bad Request

    const AvatarLocalPath = Request.files?.avatar[0]?.path;
    let CoverImageLocalPath;

    if (!AvatarLocalPath) throw new API_ERROR(400, "Avatar file is required...!"); // Bad Request

    if (Request.files && Array.isArray(Request.files.coverImage) && Request.files.coverImage.length > 0) {
        CoverImageLocalPath = Request.files.coverImage[0].path;
    }

    const UploadAvatarOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(AvatarLocalPath);
    const UploadCoverImageOnCloudinary = await UPLOAD_FILE_ON_CLOUDINARY(CoverImageLocalPath);

    if (!UploadAvatarOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading avatar...!");
    if (!UploadCoverImageOnCloudinary) throw new API_ERROR(500, "Something went wrong while uploading coverImage...!");

    const CreatedUser = await USER.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: UploadAvatarOnCloudinary.url,
        coverImage: UploadCoverImageOnCloudinary?.url || "",
    });

    if (!CreatedUser) throw new API_ERROR(500, "Something went wrong while registering new User...!");

    return Response.status(201).json(
        new API_RESPONSE(200, CreatedUser._id, "User registered successfully...!")
    );
});
