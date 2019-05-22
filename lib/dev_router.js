
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const Router = require('router')

const { setCookies } = require('./common')

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

    req.username = username

    setCookies(res, {
      [USER_KEY]: username,
      [TOKEN_KEY]: token
    }, { maxAge: TOKEN_EXPIRATION })

    next()
  })

  return router
}
