const AsyncHandlerPromise = (RequestHandler) => (Request, Response, Next) => {
    Promise.resolve(RequestHandler(Request, Response, Next)).catch((error) => Next(error));
}

const AsyncHandlerTryCatch = (RequestHandler) => async (Request, Response, Next) => {
    try {
        await RequestHandler(Request, Response, Next);
    } catch (error) {
        Response.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}

export { AsyncHandlerPromise, AsyncHandlerTryCatch };
