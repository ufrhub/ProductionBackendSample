/********************* Import the required Packages *********************/
const Mongoose = require("mongoose");
const Process = require('node:process');
const DotEnv = require('dotenv');

/********************* Configure the Environment file *********************/
DotEnv.config();

/********************* Connection State *********************/
let isConnected = false;

/********************* MongoDB Uri *********************/
const URI = Process.env.MONGODB_URL;

/********************* Connect To MongoDB *********************/
const ConnectDatabase = async () => {
    if (isConnected) {
        console.log("Already connected to MongoDB");
        return;
    }

    try {
        await Mongoose.connect(URI);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (Error) {
        console.error("MongoDB connection error:", Error);
        isConnected = false;
        setTimeout(ConnectDatabase, 5000); // Retry after 5 seconds
    }
}

/********************* Export the ConnectDatabase function and Mongoose package *********************/
module.exports = { ConnectDatabase, Mongoose };
