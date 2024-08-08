import { ASYNCHRONOUS_HANDLER, ASYNCHRONOUS_HANDLER_TryCatch } from "../Utilities/AsyncHandler.js";

export const REGISTER_NEW_USER = ASYNCHRONOUS_HANDLER(async (Request, Response) => {
    return Response.status(200).json({
        message: "OK",
    });
});
