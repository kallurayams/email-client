const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const { logger } = require("./server/utils/logger");
const path = require("path");

//Load env variables
const config = require('./server/config/config');

//Connect to Mongodb Database
const mongoInitiate = require('./server/config/mongoose');
mongoInitiate();

app.use(cors())
    .use(helmet())
    .use(express.json());

//Log each incoming request
app.all("*/api*", function (req, res, next) {
    logger.info(`${req.method} ${req.url}`);
    next();
});

//Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err);
    process.exit(1);
});

//Handle unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

//Routes
const router = require('./server/routes/routes');
app.use(router);

//Middlewares
// app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

//Serve static files from public directory
// app.use(express.static(path.join(__dirname, '../client/public')));

// //Serve frontend for any other routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/public/index.html'));
// });

//Start server
app.listen(config.port, () => {
    logger.info(`Server is running!`);
});
