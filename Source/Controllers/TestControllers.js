export const TestGetRequest = (Request, Response) => {
    for (let i = 0; i < 10000000000; i++) {

    }
    Response.json(
        [
            {
                message: `Worker ${process.pid} is handling the task...!`, // Send a JSON response with a message
            }
        ]
    );
}

export const TestGetRequest2 = (Request, Response) => {
    for (let i = 0; i < 30000000000; i++) {

    }
    Response.json(
        [
            {
                message: `Worker ${process.pid} is handling the task 2...!`, // Send a JSON response with a message
            }
        ]
    );
}

export const TestGetRequest3 = (Request, Response) => {
    for (let i = 0; i < 50000000000; i++) {

    }
    Response.json(
        [
            {
                message: `Worker ${process.pid} is handling the task 3...!`, // Send a JSON response with a message
            }
        ]
    );
}
