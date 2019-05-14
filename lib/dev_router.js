'use strict'

const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const Router = require('router')

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const DEFAULT_USERNAME = 'development'

exports.router = function (fakeUsername) {
  const router = new Router()
  const username = fakeUsername || DEFAULT_USERNAME

  router.use(cookieParser())

  router.use((req, res, next) => {
    const token = jwt.sign({ username }, process.env.SECRET)
    const expirationOptions = {
      maxAge: TOKEN_EXPIRATION / 1000,
      expires: new Date(Date.now() + TOKEN_EXPIRATION)
    }

    req.username = username
    res.setHeader('Set-Cookie', [
      cookie.serialize(USER_KEY, username, expirationOptions),
      cookie.serialize(TOKEN_KEY, token, expirationOptions)
    ])

    next()
  })

  return router
}
