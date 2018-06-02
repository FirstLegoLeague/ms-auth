'use strict'

const authRouter = require('./lib/authentication_router').router

module.authenticationMiddleware = authRouter.router
module.authenticationDevMiddleware = devRouter.router
