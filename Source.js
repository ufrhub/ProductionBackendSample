const Cluster = require('node:cluster');
const OS = require('node:os');
const Process = require('node:process');
const App = require('./App');

const totalCPUs = OS.cpus().length;
const PORT = Process.env.PORT || 7000;

if (Cluster.isMaster) {
    console.log(`Master ${Process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        Cluster.fork();
    }

    Cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Optionally restart the worker
        Cluster.fork();
    });
} else {
    // Workers can share any TCP connection
    // In this case, it is an HTTP server
    App.listen((PORT), () => {
        console.log({
            worker_thread: `Worker ${Process.pid} started`,
            server: `Server is running on PORT = ${PORT}`,
        });
    });
}
