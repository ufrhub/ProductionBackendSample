/********************* Import the required Packages *********************/
import WEB_SOCKET from "ws";
import PROCESS from "node:process";

/********************* Import the required files and functions *********************/
import {
    CONNECTION,
    MESSAGE,
    CLOSE,
    ERROR,
} from "./Utilities/Constants.js";
import { LOG_INFO } from "./Utilities/WinstonLogger.js";

/********************* Import the required files and functions *********************/
const START_WEB_SOCKET_SERVER = (Server) => {
    const WEB_SOCKET_SERVER = new WEB_SOCKET.Server({ server: Server }, () => {
        LOG_INFO({
            label: "Connection",
            service: "WebSocket",
            message: `WebSocket is ready...!, Worker ${PROCESS.pid} is listening WebSocket...!`,
        });
    });

    WEB_SOCKET_SERVER.on(CONNECTION, (Socket, Request) => {
        /******* How to get the IP address of the client? *******/
        // When the server runs behind a proxy like NGINX, the de-facto standard is to use the X-Forwarded-For header.
        // const IP = Request.headers['x-forwarded-for'].split(',')[0].trim();

        // The remote IP address can be obtained from the raw socket.
        const IP = Request.socket.remoteAddress;
        LOG_INFO({ message: `IP: ${IP}` });

        Socket.on(ERROR, (error) => {
            LOG_ERROR({ message: `WebSocket Error: ${error.message}` });
        });

        Socket.on(CLOSE, (code, reason) => {
            LOG_INFO({ message: `WebSocket Closed: Code ${code}, Reason ${reason}` });
        });
    });

    WEB_SOCKET_SERVER.on(ERROR, (error) => {
        LOG_ERROR({ message: `WebSocket Server Error: ${error.message}` });
    });

    WEB_SOCKET_SERVER.on(CLOSE, () => {
        LOG_INFO({ message: 'WebSocket Server Closed' });
    });
}

export { START_WEB_SOCKET_SERVER };
