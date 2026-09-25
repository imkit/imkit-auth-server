const express = require('express');
const jwt = require('jsonwebtoken');
const pjson = require('../package.json');

const ALGORITHM = 'HS256';
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 365; // 1 year

// Tokens and decoded claims are credentials; never write them to logs.
function createAuthRouter(secret) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({
      version: pjson.version,
      apis: {
        verify: '/verify',
      },
    });
  });

  router.post('/verify', (req, res, next) => {
    const token = req.body && req.body.token;
    jwt.verify(token, secret, { algorithms: [ALGORITHM] }, (err, decoded) => {
      if (err) {
        err.status = 401;
        next(err);
        return;
      }
      res.json(decoded);
    });
  });

  // Issues a token for the posted claims. Anyone who can reach this endpoint can
  // mint a token for any user id, so it must stay on a private network.
  router.post('/sign', (req, res, next) => {
    const claims = { ...(req.body || {}) };
    claims.exp = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
    const expirationDate = new Date(claims.exp * 1000);
    jwt.sign(claims, secret, { algorithm: ALGORITHM }, (err, token) => {
      if (err) {
        err.status = 400;
        next(err);
        return;
      }
      res.json({ token, expirationDate });
    });
  });

  return router;
}

module.exports = { createAuthRouter };
