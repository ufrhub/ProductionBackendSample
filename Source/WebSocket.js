/********************* Import the required Packages *********************/
import { WebSocketServer } from "ws";
import PROCESS from "node:process";

/********************* Import the required files and functions *********************/
import {
    CONNECTION,
    MESSAGE,
    CLOSE,
    ERROR,
} from "./Utilities/Constants.js";
import { LOG_ERROR, LOG_INFO } from "./Utilities/WinstonLogger.js";

/********************* Start the Web Socket Server *********************/
const START_WEB_SOCKET_SERVER = (Server) => {
    const WEB_SOCKET_SERVER = new WebSocketServer({ server: Server }, () => {
        LOG_INFO({
            label: "WebSocket.js",
            service: "WebSocketServer",
            message: `WebSocket is ready...!, Worker ${PROCESS.pid} is listening WebSocket...!`,
        });
    });

    WEB_SOCKET_SERVER.on(CONNECTION, (Socket, Request) => {
        /******* How to get the IP address of the client? *******/
        // When the server runs behind a proxy like NGINX, the de-facto standard is to use the X-Forwarded-For header.
        // const IP = Request.headers['x-forwarded-for'].split(',')[0].trim();

        // The remote IP address can be obtained from the raw socket.
        const IP = Request.socket.remoteAddress;
        LOG_INFO({
            label: "WebSocket.js",
            service: "Remote Address",
            message: `IP: ${IP}`
        });

        Socket.on(MESSAGE, (data) => {
            LOG_INFO({
                label: "WebSocket.js",
                service: "Socket Message",
                message: `WebSocket Message: ${data}`
            });
        });

        Socket.on(ERROR, (error) => {
            LOG_ERROR({
                label: "WebSocket.js",
                service: "Socket Error",
                message: `WebSocket Error: ${error.message}`
            });
        });

        Socket.on(CLOSE, (code, reason) => {
            LOG_INFO({
                label: "WebSocket.js",
                service: "Socket Close",
                message: `WebSocket Closed: Code ${code}, Reason ${reason}`
            });
        });
    });

    WEB_SOCKET_SERVER.on(ERROR, (error) => {
        LOG_ERROR({
            label: "WebSocket.js",
            service: "WebSocket Server Error",
            message: `WebSocket Server Error: ${error.message}`
        });
    });

    WEB_SOCKET_SERVER.on(CLOSE, () => {
        LOG_INFO({
            label: "WebSocket.js",
            service: "WebSocket Server Close",
            message: 'WebSocket Server Closed'
        });
    });
}

export { START_WEB_SOCKET_SERVER };
