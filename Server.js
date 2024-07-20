/********************* Import the required Packages *********************/
const Process = require('node:process');
const App = require('./App');

/********************* Set the port from environment variables or default to 7000 *********************/
const PORT = Process.env.PORT || 7000;

/********************* Function to start the Express Server *********************/
const StartServer = async () => {
    try {
        const Server = App.listen(PORT, () => {
            console.log({
                worker: `Worker ${Process.pid} started`,
                server: `Server is running on PORT = ${PORT}`,
            });
        });

        const GracefulShutdown = (exitCode) => {
            console.log(`Worker ${Process.pid} is shutting down...`);
            Server.close(() => {
                console.log(`Worker ${Process.pid} has shut down.`);
                Process.exit(exitCode);
            });
        };

        // Graceful shutdown for worker
        Process.on('message', (message) => {
            if (message === 'shutdown') {
                GracefulShutdown(0);
            }
        });

        // Handle unhandled promise rejections
        Process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            GracefulShutdown(1);
        });

        // Handle uncaught exceptions
        Process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            GracefulShutdown(1);
        });
    } catch (Error) {
        console.error('Error starting server:', Error);
        GracefulShutdown(1);
    }
};

/********************* Export the StartServer function *********************/
module.exports = StartServer;
