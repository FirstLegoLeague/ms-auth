'use strict'

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const config = require('config')
const { Logger } = require('@first-lego-league/ms-logger')

const DEFAULTS = require('./defaults')

const router = express.Router()
const logger = new Logger()

const identityProviderUrl = config.get('idp')
const secret = process.env.SECRET || DEFAULTS.SECRET
const homeRoute = config.has('homeRoute') ? config.get('homeRoute') : DEFAULTS.HOME_ROUTE
let publicRoutes = ['/consume_token']
if (config.has('publicRoutes')) {
  publicRoutes = publicRoutes.concat(config.get('publicRoutes'))
}

router.use(cookieParser())

router.use((req, res, next) => {
  res.redirectToIdP = function () {
    res.redirect(`${identityProviderUrl}/login?callbackUrl=${req.host}${req.path}/consume_token`)
  }
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
