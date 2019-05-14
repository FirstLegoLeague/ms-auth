'use strict'

const Router = require('router')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const url = require('url')

const { Logger } = require('./logger')

const TOKEN_KEY = 'auth-token'
const USERNAME_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const HOME_ROUTE = '/'

const router = new Router()
const logger = new Logger()

const secret = process.env.SECRET
const publicRoutes = ['/consume_token']

router.use(cookieParser())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.use((req, res, next) => {
  res.redirectToIdP = function () {
    const { pathname, host } = url.parse(req.url)
    res.setHeader('Location', process.env.MODULE_IDENTITY_PROVIDER_URL +
      `/login?callbackUrl=${host}${pathname}${pathname.endsWith('/') ? '' : '/'}consume_token`)
    res.statusCode = 302
    res.end()
  }

  next()
})

router.use((req, res, next) => {
  if (publicRoutes.includes(url.parse(req.url).pathname)) {
    return next()
  }

  const existingAuthToken = req.headers[TOKEN_KEY] || req.cookies[TOKEN_KEY]
  try {
    jwt.verify(existingAuthToken, secret)
    next()
  } catch (err) {
    logger.info('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  }
})

router.use('/consume_token', (req, res) => {
  const token = url.parse(req.url, true).query.token || req.body.token
  if (!token) {
    logger.warn('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  } else {
    try {
      const verifiedUser = jwt.verify(token, secret)
      req.user = verifiedUser

      const expirationOptions = {
        maxAge: TOKEN_EXPIRATION / 1000,
        expires: new Date(Date.now() + TOKEN_EXPIRATION)
      }

      res.setHeader('Set-Cookie', [
        cookie.serialize(USERNAME_KEY, verifiedUser.username, expirationOptions),
        cookie.serialize(TOKEN_KEY, token, expirationOptions)
      ])

      res.setHeader('Location', HOME_ROUTE)
      res.statusCode = 302
      res.end()
    } catch (err) {
      logger.warn('Redirecting to Identity Provider: Found Illegal auth token.')
      res.redirectToIdP()
    }
  }
})

router.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', [
    cookie.serialize(USERNAME_KEY, '', { expires: new Date(1) }),
    cookie.serialize(TOKEN_KEY, '', { expires: new Date(1) })
  ])

  const { host, pathname } = url.parse(req.url)
  res.setHeader('Location', process.env.MODULE_IDENTITY_PROVIDER_URL +
    `/logout?callbackUrl=${host}${pathname.replace('logout', '')}consume_token`)
  res.statusCode = 302
  res.end()
})

exports.router = router
