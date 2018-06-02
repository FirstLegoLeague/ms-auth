'use strict'

exports.authenticationMiddleware = require('./lib/authentication_router').router
exports.authenticationDevMiddleware = require('./lib/dev_router').router
