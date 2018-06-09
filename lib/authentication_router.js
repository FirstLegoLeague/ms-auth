'use strict'

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const HOME_ROUTE = '/'
const DEFAULT_SECRET = '321LEGO'

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { Logger } = require('@first-lego-league/ms-logger')

const router = express.Router()
const logger = new Logger()

const secret = process.env.SECRET || DEFAULT_SECRET
let publicRoutes = ['/consume_token']

router.use(cookieParser())

router.use((req, res, next) => {
  res.redirectToIdP = function () {
    res.redirect(`${process.env.MODULE_IDENTITY_PROVIDER_URL}/login?callbackUrl=${req.host}${req.path}/consume_token`)
  }

  next()
})

router.use((req, res, next) => {
  if (publicRoutes.includes(req.url)) {
    next()
    return
  }

  const existingAuthToken = req.get(TOKEN_KEY) || req.cookies[TOKEN_KEY]
  if (existingAuthToken && jwt.verify(existingAuthToken, secret)) {
    next()
    return
  }
  logger.info('Redirecting to Identity Provider: No auth token found.')
  res.redirectToIdP()
})

router.get('/consume_token', (req, res, next) => {
  const token = req.query['token'] || req.params['token'] || req.body['token']
  if (!token) {
    logger.warn('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  } else  {
    let verifiedUser = jwt.verify(token, secret)
    if (verifiedUser) {
      req.user = verifiedUser
      res.cookie(USER_KEY, verifiedUser, { maxAge: TOKEN_EXPIRATION })
      res.cookie(TOKEN_KEY, token, { maxAge: TOKEN_EXPIRATION })
      res.redirect(homeRoute)
    } else {
      logger.warn('Redirecting to Identity Provider: Found Illegal auth token.')
      res.redirectToIdP()
    }
  }
})

exports.router = router
