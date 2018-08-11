'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { Logger } = require('@first-lego-league/ms-logger')

const TOKEN_KEY = 'auth-token'
const USERNAME_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const HOME_ROUTE = '/'
const DEFAULT_SECRET = '321LEGO'

const router = new express.Router()
const logger = new Logger()

const secret = process.env.SECRET || DEFAULT_SECRET
const publicRoutes = ['/consume_token']

router.use(cookieParser())

router.use((req, res, next) => {
  res.redirectToIdP = function () {
    res.redirect(`${process.env.MODULE_IDENTITY_PROVIDER_URL}/login?callbackUrl=${req.hostname}:${process.env.PORT}${req.path}consume_token`)
  }

  next()
})

router.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    next()
    return
  }

  const existingAuthToken = req.get(TOKEN_KEY) || req.cookies[TOKEN_KEY]
  try {
    jwt.verify(existingAuthToken, secret)
    next()
  } catch (err) {
    logger.info('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  }
})

router.get('/consume_token', (req, res) => {
  const token = req.query.token || req.params.token || req.body.token
  if (!token) {
    logger.warn('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  } else {
    try {
      const verifiedUser = jwt.verify(token, secret)
      req.user = verifiedUser
      res.cookie(USERNAME_KEY, verifiedUser.username, { maxAge: TOKEN_EXPIRATION })
      res.cookie(TOKEN_KEY, token, { maxAge: TOKEN_EXPIRATION })
      res.redirect(HOME_ROUTE)
    } catch (err) {
      logger.warn('Redirecting to Identity Provider: Found Illegal auth token.')
      res.redirectToIdP()
    }
  }
})

router.get('/logout', (req, res) => {
  res.clearCookie(TOKEN_KEY)
  res.clearCookie(USERNAME_KEY)
  res.redirect(`${process.env.MODULE_IDENTITY_PROVIDER_URL}/logout?callbackUrl=${req.hostname}:${process.env.PORT}${req.path.replace('logout', '')}consume_token`)
})

exports.router = router
