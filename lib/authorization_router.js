
const TOKEN_KEY = 'auth-token'

const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { Logger } = require('@first-lego-league/ms-logger')

const secret = process.env.SECRET
const logger = new Logger()

exports.router = function (users) {
  const router = express.Router()

  router.use(cookieParser())

  router.use((req, res, next) => {
    const existingAuthToken = req.get(TOKEN_KEY) || req.cookies[TOKEN_KEY]
    try {
      const user = jwt.verify(existingAuthToken, secret)
      if (users.includes(user.username)) {
        next()
      } else {
        logger.info(`User ${user.username} is unauthrozied to perform this action`)
        res.status(403).send('Forbidden')
      }
    } catch (err) {
      logger.info('Unauthorized: no user found')
      res.status(403).send('Forbidden')
    }
  })

  return router
}
