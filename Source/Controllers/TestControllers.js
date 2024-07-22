export const TestGetRequest = (Request, Response) => {
    Response.json(
        [
            {
                message: `App is running on port ${process.env.PORT}...!`, // Send a JSON response with a message
            }
        ]
    );
}
