import MULTER from "multer";

const STORAGE = MULTER.diskStorage({
    destination: function (Request, File, Callback) {
        Callback(null, "./Public/Temporary");
    },
    filename: function (Request, File, Callback) {
        const UniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        Callback(null, File.fieldname + "-" + UniqueSuffix);
    }
});

export const UPLOAD = MULTER({ storage: STORAGE });
