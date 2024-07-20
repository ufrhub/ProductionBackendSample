const Cluster = require('node:cluster');
const OS = require('node:os');
const Process = require('node:process');
const App = require('./App');

const totalCPUs = OS.cpus().length;
const PORT = Process.env.PORT || 7000;

const StartServer = () => {
    // Workers can share any TCP connection
    // In this case, it is an HTTP server
    App.listen((PORT), () => {
        console.log({
            worker_thread: `Worker ${Process.pid} started`,
            server: `Server is running on PORT = ${PORT}`,
        });
    });
};

if (Cluster.isMaster) {
    console.log(`Master ${Process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        Cluster.fork();
    }

    Cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`);
        // Optionally restart the worker
        Cluster.fork();
    });

    Cluster.on('error', (error) => {
        console.error(`Cluster error: ${error.message}`);
    });

    // Graceful shutdown
    const GracefulShutdown = (signal) => {
        console.log(`Master ${Process.pid} received ${signal}. Shutting down...`);
        Object.values(Cluster.workers).forEach((worker) => {
            worker.send('shutdown');
        });
        setTimeout(() => Process.exit(0), 10000); // Wait for workers to shutdown gracefully
    };

    Process.on('SIGTERM', () => GracefulShutdown('SIGTERM'));
    Process.on('SIGINT', () => GracefulShutdown('SIGINT'));
} else {
    Process.on('message', (message) => {
        if (message === 'shutdown') {
            console.log(`Worker ${Process.pid} is shutting down...`);
            App.close(() => {
                console.log(`Worker ${Process.pid} has shut down.`);
                Process.exit(0);
            });
        }
    });

    StartServer();
}
