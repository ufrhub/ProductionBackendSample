/********************* Import the required Packages *********************/
const Cluster = require('node:cluster');
const OS = require('node:os');
const Process = require('node:process');
const { ConnectDatabase } = require("./Database");
const StartServer = require('./Server');

/********************* Get the number of CPU cores available *********************/
const totalCPUs = OS.cpus().length;

/********************* Handle the Cluster functionality *********************/
if (Cluster.isMaster) {
    /******* Log the master process ID *******/
    console.log(`Master ${Process.pid} is running`);

    /******* Connect to MongoDB Database in the master process *******/
    ConnectDatabase().then(() => {
        /* Fork workers once the DB connection is established */
        for (let i = 0; i < totalCPUs; i++) { // Loop to create a worker process for each CPU core
            /* Fork a new worker process */
            const Worker = Cluster.fork();
            /* Send a message to the worker indicating the database is connected */
            Worker.send("DatabaseConnected");
        }
    }).catch((Error) => { // Handle any errors that occur during the database connection
        console.error({
            error: Error,
            message: `An error occured while connection to the Database`,
        });
    });

    /******* Handle worker process exit events *******/
    /* Event handler for when a worker process exits */
    Cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`); // Log worker exit details
        // -- Optionally restart the worker
        /* Fork a new worker process to replace the one that exited */
        Cluster.fork();
    });

    /******* Handle cluster errors *******/
    /* Event handler for cluster errors */
    Cluster.on('error', (error) => {
        console.error(`Cluster error: ${error.message}`); // Log the cluster error message
    });

    /******* Graceful shutdown function to handle graceful shutdown *******/
    const GracefulShutdown = (signal) => {
        console.log(`Master ${Process.pid} received ${signal}. Shutting down...`);
        /* Iterate over all worker processesr */
        Object.values(Cluster.workers).forEach((worker) => {
            /* Send a shutdown message to each worker */
            worker.send('Shutdown');
        });
        /******* Wait for workers to shutdown gracefully before exiting the master process *******/
        setTimeout(() => Process.exit(0), 10000);
    };

    /******* Set up listeners for shutdown signals *******/
    /* Handle SIGTERM signal for graceful shutdown */
    Process.on('SIGTERM', () => GracefulShutdown('SIGTERM'));
    /* Handle SIGINT signal for graceful shutdown */
    Process.on('SIGINT', () => GracefulShutdown('SIGINT'));
} else { // If this process is a worker process
    /******* Listen for messages from the master process *******/
    Process.on('message', (message) => {
        /* If the message indicates the database is connected */
        if (message === 'DatabaseConnected') {
            /* Start the server */
            StartServer();
        }

        /* If the message indicates a shutdown */
        if (message === 'Shutdown') {
            console.log(`Worker ${Process.pid} is shutting down...`);
            /* Close the server */
            App.close(() => {
                console.log(`Worker ${Process.pid} has shut down.`);
                /* Exit the worker process */
                Process.exit(0);
            });
        }
    });
}
