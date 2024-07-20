const cluster = require('node:cluster');
const os = require('node:os');
const process = require('node:process');
const App = require('./App');

const totalCPUs = os.cpus().length;
const PORT = process.env.PORT || 7000;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Optionally restart the worker
        cluster.fork();
    });
} else {
    // Workers can share any TCP connection
    // In this case, it is an HTTP server
    App.listen((PORT), () => {
        console.log({
            worker_thread: `Worker ${process.pid} started`,
            server: `Server is running on PORT = ${PORT}`,
        });
    });
}
