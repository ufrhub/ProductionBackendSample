import { v2 as CLOUDINARY } from "cloudinary";
import PROCESS from "node:process";
import FILE_SYSTEM from "node:fs";

/*********************
 * Import custom modules and functions.
 * - LOG_ERROR: Logging functions for error logs.
 *********************/
import { LOG_ERROR, LOG_INFO } from "./WinstonLogger.js";

CLOUDINARY.config({
    cloud_name: PROCESS.env.CLOUDINARY_CLOUD_NAME,
    api_key: PROCESS.env.CLOUDINARY_API_KEY,
    api_secret: PROCESS.env.CLOUDINARY_API_SECRET,
});

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

export { UPLOAD_FILE_ON_CLOUDINARY };
