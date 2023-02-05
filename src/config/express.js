const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const responseTime = require('response-time');
const { logs } = require('./vars');
const routes = require('../api/routes');
const { handler, converter, notFound } = require('../api/middlewares/error');

/**
* Express instance
* @public app
*/
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// limit requests
app.use(rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
}));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// adds a X-Response-Time header to responses
app.use(responseTime());

// mount api routes
app.use('/', routes);

// if error is not an instanceOf APIError, convert it.
app.use(converter);

// catch 404 and forward to error handler
app.use(notFound);

// error handler, send stacktrace only during development
app.use(handler);

module.exports = app;
