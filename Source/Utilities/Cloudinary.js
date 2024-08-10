/*********************
 * Import necessary packages and modules.
 * - cloudinary: Provides methods for managing media files such as uploading images/videos.
 * - process: Provides information and control over the current Node.js process, including access to environment variables.
 * - fs: Provides methods for interacting with the file system, such as deleting files.
 *********************/
import { v2 as CLOUDINARY } from "cloudinary";
import PROCESS from "node:process";
import FILE_SYSTEM from "node:fs";

/*********************
 * Import custom modules and functions.
 * - LOG_ERROR: Function for logging error messages.
 * - LOG_INFO: Function for logging informational messages.
 *********************/
import { LOG_ERROR, LOG_INFO } from "./WinstonLogger.js";

/*********************
 * Configure Cloudinary with credentials from environment variables.
 * - cloud_name: Your Cloudinary cloud name.
 * - api_key: Your Cloudinary API key.
 * - api_secret: Your Cloudinary API secret.
 *********************/
CLOUDINARY.config({
    cloud_name: PROCESS.env.CLOUDINARY_CLOUD_NAME,
    api_key: PROCESS.env.CLOUDINARY_API_KEY,
    api_secret: PROCESS.env.CLOUDINARY_API_SECRET,
});

/*********************
 * Upload a local file to Cloudinary.
 * - LocalFilePath: Path to the file to be uploaded.
 * - If LocalFilePath is not provided, return null.
 * - If LocalFilePath is provided, upload the file to Cloudinary with automatic resource type detection.
 * - On success, logs the response from Cloudinary and returns it.
 * - After a successful upload, delete the local file using `unlinkSync` to prevent leftover files.
 * - On failure, deletes the local file using `unlinkSync` to ensure that the failed upload does not leave unwanted files on the filesystem.
 * - Logs the error and returns null if the upload fails or LocalFilePath is not provided.
 *********************/
const UPLOAD_FILE_ON_CLOUDINARY = async (LocalFilePath) => {
    try {
        if (!LocalFilePath) return null;

        const Response = await CLOUDINARY.uploader.upload(LocalFilePath, {
            resource_type: "auto"
        });

        LOG_INFO({
            label: "Cloudinary.js",
            service: "UPLOAD_FILE_ON_CLOUDINARY try",
            message: Response,
        });

        FILE_SYSTEM.unlinkSync(LocalFilePath);
        return Response;
    } catch (error) {
        FILE_SYSTEM.unlinkSync(LocalFilePath);

        LOG_ERROR({
            label: "Cloudinary.js",
            service: "UPLOAD_FILE_ON_CLOUDINARY catch",
            error: error.message,
        });

        return null;
    }
}

/*********************
 * Export the UPLOAD_FILE_ON_CLOUDINARY function for use in other modules.
 *********************/
export { UPLOAD_FILE_ON_CLOUDINARY };
