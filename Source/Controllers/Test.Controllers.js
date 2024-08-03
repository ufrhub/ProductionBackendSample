import { REDIS } from "../Redis.js";

export const TestGetRequest = async (Request, Response) => {
    const Currencies = await REDIS.get("TestGetRequest:currencies");

    if (Currencies) {
        return Response.json(
            {
                message: `Worker ${process.pid} is handling the task...! message from redis`, // Send a JSON response with a message
                data: JSON.parse(Currencies)
            }
        );
    }

    fetch('https://freetestapi.com/api/v1/currencies')
        .then(response => response.json())
        .then(async (json) => {
            await REDIS.setex("TestGetRequest:currencies", 20, JSON.stringify(json));

            return Response.json(
                {
                    message: `Worker ${process.pid} is handling the task...!`, // Send a JSON response with a message
                    data: json
                }
            );
        });
}

export const TestPostRequest = async (Request, Response) => {
    const { data } = Request.body;

    const Data = await REDIS.get("TestPostRequest:todos");

    if (Data) {
        return Response.json(
            {
                message: `Worker ${process.pid} is handling the task...! message from redis`, // Send a JSON response with a message
                requestedData: data,
                data: JSON.parse(Data)
            }
        );
    }

    fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => response.json())
        .then(async (json) => {
            await REDIS.setex("TestPostRequest:todos", 20, JSON.stringify(json));

            return Response.json(
                {
                    message: `Worker ${process.pid} is handling the task...!`, // Send a JSON response with a message
                    requestedData: data,
                    data: json
                }
            );
        });
}
