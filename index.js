const DEFAULT_SECRET = '321LEGO';

var express = require('express'),
var cookieParser = require('cookie-parser'),
var jwt = require('jsonwebtoken'),
var config = require('config'),
var router = express.Router();

var secret = config.has('secret') ? config.get('secret') : DEFAULT_SECRET;
var identityProviderUrl = config.get('idp');

router.use(cookieParser());

router.use((req, res, next) => {
  if(req.url === '/consume_token') {
  	next();
  } else if(req.cookie['user'] && jwt.verify(req.cookie['user'], secret)) {
    next();
  } else {
    res.redirect(`${identityProviderUrl}/login?callback_url=${req.host}/consume_token`);
  }
});

router.get('/consume_token', (req, res, next) => {
  var auth_token = req.query['token'] || req.params['token'] || req.body['token'];
  if(req.cookie['user'] && jwt.verify(req.cookie['user'], secret)) {
    res.cookie('user', token, { maxAge: 24 * 60 * 60 * 1000 /* day */ });
    res.redirect('/');
  } else {
    res.redirect(`${identityProviderUrl}/login?callback_url=${req.host}/consume_token`);
  }
});

module.export = router;