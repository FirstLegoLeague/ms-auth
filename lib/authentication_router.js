'use strict'

const COOKIE_KEY = 'user'
const HEADER_KEY = 'auth-token'

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const config = require('config')
const logger = require('@first-lego-league/ms-logger')

const DEFAULTS = require('./defaults')

const router = express.Router()
const identityProviderUrl = config.get('idp')
const secret = process.env.SECRET || DEFAULTS.SECRET
const tokenExpiration = config.has('tokenExpiration') ? config.get('tokenExpiration') : DEFAULTS.TOKEN_EXPIRATION
const homeRoute = config.has('homeRoute') ? config.get('homeRoute') : DEFAULTS.HOME_ROUTE
let publicRoutes = ['/consume_token']
if (config.has('publicRoutes')) {
  publicRoutes = publicRoutes.concat(config.get('publicRoutes'))
}

router.use(cookieParser())

router.use((req, res, next) => {
  res.redirectToIdP = function () {
    res.redirect(`${identityProviderUrl}/login?callbackUrl=${req.host}/consume_token`)
  }
})

router.use((req, res, next) => {
  if (publicRoutes.includes(req.url)) {
    next()
    return
  }

  const existingAuthToken = req.get(HEADER_KEY) || req.cookies[COOKIE_KEY]
  if (existingAuthToken && jwt.verify(existingAuthToken, secret)) {
    next()
    return
  }
  logger().info('Redirecting to Identity Provider: No token found.')
  res.redirectToIdP()
})

router.get('/consume_token', (req, res, next) => {
  const token = req.query['token'] || req.params['token'] || req.body['token']
  if (!token) {
    logger().warn('Redirecting to Identity Provider: Found Illegal token.')
    res.redirectToIdP()
  } else if (!jwt.verify(token, secret)) {
    logger().warn('Redirecting to Identity Provider: Found Illegal token.')
    res.redirectToIdP()
  } else {
    res.cookie(COOKIE_KEY, token, { maxAge: tokenExpiration })
    res.redirect(homeRoute)
  }
})

exports.router = router
