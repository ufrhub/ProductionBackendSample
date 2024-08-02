/********************* Import the required Packages *********************/
import { WebSocketServer } from "ws";
import PROCESS from "node:process";
import JSON_WEB_TOKEN from "jsonwebtoken"

/********************* Import the required files and functions *********************/
import {
    CONNECTION,
    UNAUTHORIZED,
    MESSAGE,
    PING,
    PONG,
    CLOSE,
    ERROR,
} from "./Utilities/Constants.js";
import { LOG_ERROR, LOG_INFO } from "./Utilities/WinstonLogger.js";

/*********************
 * Function to Initialize and Start a WebSocket server.
 * @param {Object} Server - The Express Server Instance to which the WebSocket Server will be attached.
 *********************/
const START_WEB_SOCKET_SERVER = (Server) => {
    /******* Create a new WebSocket Server instance and attach it to the provided Express server. *******/
    const WEB_SOCKET_SERVER = new WebSocketServer({ server: Server }, () => {
        /* Log an informational message indicating that the WebSocket Server is ready. */
        LOG_INFO({
            label: "WebSocket.js",
            service: "WebSocketServer",
            message: `WebSocket is ready...!, Worker ${PROCESS.pid} is listening WebSocket...!`,
        });
    });

    /******* Event listener for new WebSocket Connections. *******/
    WEB_SOCKET_SERVER.on(CONNECTION, (Socket, Request) => {
        /******* Extract the Host and Authorization token from the request headers. *******/
        const Host = Request.headers.host;
        const Token = Request.headers.authorization;

        /******* Check if the host matches the expected WebSocket host and if an Authorization token is provided. *******/
        if (Host === PROCESS.env.WEB_SOCKET_HOST && Token) {
            /******* Verify the provided JWT token using a Secret Key. *******/
            JSON_WEB_TOKEN.verify(Token, PROCESS.env.WEB_SOCKET_TOKEN_SECRET, (Error, Client) => {
                /* Close the Socket Connection with a "Policy Violation" code if verification fails. */
                if (Error) {
                    Socket.close(1008, UNAUTHORIZED); // Policy Violation
                    return;
                }

                /* Set the Authenticated Client data on the Socket. */
                Socket.Client = Client;

                /* Log information about the Authenticated Client. */
                LOG_INFO({
                    label: "WebSocket.js",
                    service: "Client Authentication",
                    message: `Client authenticated: ${JSON.stringify(Socket.Client)}`
                });
            });
        } else {
            /******* Close the Socket Connection with a "Policy Violation" code if the host or token is invalid. *******/
            Socket.close(1008, UNAUTHORIZED); // Policy Violation
            return;
        }

        /******* Store the Authenticated Client data for future use. *******/
        const Client = Socket.Client;

        if (Client) {
            /******* 
             * To get the Client's IP address:
             * - When behind a proxy like NGINX, use the "X-Forwarded-For" header.
             * - Otherwise, use the raw Socket's remote address.
             *******/
            // const IP = Request.headers['x-forwarded-for'].split(',')[0].trim();

            /******* The remote IP address can be obtained from the raw Socket. *******/
            const IP = Request.socket.remoteAddress;

            /* Log the Client's IP address along with the Client Information. */
            LOG_INFO({
                label: "WebSocket.js",
                service: "Remote Address",
                message: {
                    Client,
                    IP
                }
            });

            /******* Event listener for messages received from the Client. *******/
            Socket.on(MESSAGE, (data) => {
                /* Log the received message data. */
                LOG_INFO({
                    label: "WebSocket.js",
                    service: "Socket Message",
                    message: `WebSocket Message: ${data}`
                });
            });

            /******* Event listener for pings received from the Client. *******/
            Socket.on(PING, () => {
                /* Log the ping event. */
                LOG_INFO({
                    label: "WebSocket.js",
                    service: "Ping",
                    message: `Received ping from client ${Client.id}`
                });
            });
            
            /******* Event listener for pongs received from the Client. *******/
            Socket.on(PONG, () => {
                /* Log the pong event. */
                LOG_INFO({
                    label: "WebSocket.js",
                    service: "Pong",
                    message: `Received pong from client ${Client.id}`
                });
            });
        }

        /******* Event listener for errors occurring on the Socket. *******/
        Socket.on(ERROR, (error) => {
            /* Log the error message. */
            LOG_ERROR({
                label: "WebSocket.js",
                service: "Socket Error",
                message: `WebSocket Error: ${error.message}`
            });
        });

        /******* Event listener for when the Socket Connection is Closed. *******/
        Socket.on(CLOSE, (code, reason) => {
            /* Log the code and reason for the Connection Closure. */
            LOG_INFO({
                label: "WebSocket.js",
                service: "Socket Close",
                message: `WebSocket Closed: Code ${code}, Reason: ${reason}`
            });
        });
    });

    /******* Event listener for errors occurring on the WebSocket Server. *******/
    WEB_SOCKET_SERVER.on(ERROR, (error) => {
        /* Log the Server error message. */
        LOG_ERROR({
            label: "WebSocket.js",
            service: "WebSocket Server Error",
            message: `WebSocket Server Error: ${error.message}`
        });
    });

    /******* Event listener for when the WebSocket Server is Closed. *******/
    WEB_SOCKET_SERVER.on(CLOSE, () => {
        /* Log that the WebSocket Server has been Closed. */
        LOG_INFO({
            label: "WebSocket.js",
            service: "WebSocket Server Close",
            message: 'WebSocket Server Closed'
        });
    });
}

/********************* Export the function to Start the WebSocket Server. *********************/
export { START_WEB_SOCKET_SERVER };
