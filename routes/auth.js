var express = require('express');
var router = express.Router();
var fs = require('fs');

var jwt = require('jsonwebtoken');

var pjson = require('../package.json');

var secret = pjson['jwt-secret'];
process.env.JWT_SECRET && (secret = process.env.JWT_SECRET);

/* GET configuration */
router.get('/', function(req, res, next) {
  res.json({
    "version": pjson.version,
    "apis": {
      "verify": "/verify",
    }
  });
});

router.post('/verify', function(req, res, next) {
  const token = req.body.token;
  jwt.verify(token, secret, function(err, decoded) {
    console.log('decoded=',decoded);
    if (err) {
      console.error(err);
      err.status = 401;
      next(err);
      return;
    }
    res.json(decoded);
  });
});

// Generate test token
router.post('/sign', function(req, res, next) {
  var claims = req.body;
  claims['exp'] = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  jwt.sign(claims, secret, function(err, token) {
    console.log(token);
    res.json({
      token: token
    });
  });
});

module.exports = router;
