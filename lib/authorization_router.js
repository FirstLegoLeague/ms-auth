'use strict'

const TOKEN_KEY = 'auth-token'

const Router = require('router')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const { Logger } = require('@first-lego-league/ms-logger')

const secret = process.env.SECRET
const logger = new Logger()

exports.router = function (users) {
  const router = Router()

  router.use(cookieParser())

  router.use((req, res, next) => {
    const existingAuthToken = req.headers[TOKEN_KEY] || req.cookies[TOKEN_KEY]

    try {
      const user = jwt.verify(existingAuthToken, secret)
      if (users.includes(user.username)) {
        next()
      } else {
        logger.info(`User ${user.username} is unauthorized to perform this action`)
        res.statusCode = 403
        res.end('Forbidden')
      }
    } catch (err) {
      logger.info('Unauthorized: no user found')
      res.statusCode = 403
      res.end('Forbidden')
    }
  })

  return router
}
