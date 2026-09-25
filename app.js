const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const { createAuthRouter } = require('./routes/auth');

function createApp({ secret, logRequests = true } = {}) {
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  const app = express();

  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: false,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, CLIENT_KEY, Authorization, API_KEY',
  }));

  // 'dev' logs method, path, status and timing only; request bodies carry tokens.
  if (logRequests) {
    app.use(logger('dev'));
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/', createAuthRouter(secret));

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      message: err.message,
      error: { name: err.name, message: err.message },
    });
  });

  return app;
}

module.exports = { createApp };
