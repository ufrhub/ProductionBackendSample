/*********************
 * Import necessary packages and modules.
 * - multer: Middleware for handling multipart/form-data, primarily used for uploading files.
 *********************/
import MULTER from "multer";

/*********************
 * Configure Multer Storage
 * - STORAGE: Multer disk storage configuration for handling file uploads.
 * - destination: Defines the directory where uploaded files will be stored.
 * - filename: Generates a unique filename for each uploaded file to avoid conflicts.
 *********************/
const STORAGE = MULTER.diskStorage({
    /*******
     * Directory where uploaded files will be saved.
     *******/
    destination: function (Request, File, Callback) {
        Callback(null, "./Public/Temporary");
    },
    filename: function (Request, File, Callback) {
        /*******
         * Create a unique filename using the current timestamp and a random number.
         *******/
        const UniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        Callback(null, File.fieldname + "-" + UniqueSuffix);
    }
});

/*********************
 * Create and Export Multer Upload Instance
 * - UPLOAD: Multer middleware instance configured with the defined storage.
 * - This instance will be used in route handlers to handle file uploads.
 *********************/
export const UPLOAD = MULTER({ storage: STORAGE });
