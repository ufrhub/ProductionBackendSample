/********************* Import the required Packages *********************/
import MONGOOSE from "mongoose";
import PROCESS from "node:process";

/********************* Import the required files and functions *********************/
import { DATABASE_NAME } from "./Utilities/Constants.js";

/********************* Connection State *********************/
let isConnected = false;

/********************* MongoDB Uri *********************/
const MongoDB_URI = PROCESS.env.MongoDB_URI;

/********************* Connect To MongoDB *********************/
const CONNECT_DATABASE = async () => {
    if (isConnected) {
        console.log("Already connected to MongoDB");
        return;
    }

    if (!MongoDB_URI) {
        throw new Error("MongoDB_URI environment variable is not set");
    }

    try {
        const ConnectionInstance = await MONGOOSE.connect(`${MongoDB_URI}/${DATABASE_NAME}`);
        isConnected = true;
        console.info(`\nMongoDB Database Connected...! \nDATABASE HOST = ${ConnectionInstance.connection.host}`);
    } catch (Error) {
        console.error(`MongoDB connection error: ${Error}`);
        isConnected = false;
        PROCESS.exit(1)
    }
}

/********************* Export the ConnectDatabase function *********************/
export { CONNECT_DATABASE };
