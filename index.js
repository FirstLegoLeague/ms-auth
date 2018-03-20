const DEFAULT_SECRET = '321LEGO';
const DEFAULT_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // day
const DEFAULT_HOME_ROUTE = '/';
const COOKIE_KEY = 'user';

var express = require('express'),
var cookieParser = require('cookie-parser'),
var jwt = require('jsonwebtoken'),
var config = require('config'),
var router = express.Router();

var identityProviderUrl = config.get('idp');
var secret = config.has('secret') ? config.get('secret') : DEFAULT_SECRET;
var tokenExpiration = config.has('tokenExpiration') ? config.get('tokenExpiration') : DEFAULT_TOKEN_EXPIRATION;
var homeRoute = config.has('homeRoute') ? config.get('homeRoute') : DEFAULT_HOME_ROUTE;
var publicRoutes = ['/consume_token'];
if(config.has('publicRoutes')) {
  publicRoutes = publicRoutes.concat(config.get('publicRoutes'));
}

router.use(cookieParser());

router.use((req, res, next) => {

  res.redirectToIdP = function() {
    res.redirect(`${identityProviderUrl}/login?callbackUrl=${req.host}/consume_token`);
  };

});

router.use((req, res, next) => {
  if(publicRoutes.includes(req.url) || (req.cookie[COOKIE_KEY] && jwt.verify(req.cookie[COOKIE_KEY], secret))) {
  	next();
  } else {
    res.redirectToIdP();
  }
});

router.get('/consume_token', (req, res, next) => {
  var token = req.query['token'] || req.params['token'] || req.body['token'];
  if(token && jwt.verify(token, secret)) {
    res.cookie(COOKIE_KEY, token, { maxAge: tokenExpiration });
    res.redirect(homeRoute);
  } else {
    res.redirectToIdP();
  }
});

module.export = router;
