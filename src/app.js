require('dotenv').config();
const config = require('config');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const Logger = require('./utils/logger.js');
const clientsRouter = require('./middlewares/routers/clients_router.js');
const driversRouter = require('./middlewares/routers/drivers_router.js');
const ConnectionPoolFactory = require('./lib/factories/connection_pool_factory.js');
const errorMiddleware = require('./middlewares/main_error_handler.js');

const logger = new Logger();
const postgrePool = new ConnectionPoolFactory(logger).createPool();

const app = express();

app.use(bodyParser.json({ limit: '20mb' }));

// Enable CORS for all routes
app.use(cors());

// Add routers to the API
clientsRouter(app, logger, postgrePool);
driversRouter(app, logger, postgrePool);

// Add basic error middleware to handle all errors
errorMiddleware(app, logger);

// Start the app in the designated port and host

if (! module.parent) {
  let port = process.env.PORT || config.get('express.Port');
  let host = process.env.HOST || config.get('express.Host');
  app.listen(port, host, () => {
    console.log(`Petify Backend Server running on http://${host}:${port}`);
  });
}

module.exports = app;
