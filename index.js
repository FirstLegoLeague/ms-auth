'use strict'

const DEFAULT_SECRET = '321LEGO'
const DEFAULT_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const DEFAULT_HOME_ROUTE = '/'
const COOKIE_KEY = 'user'
const HEADER_KEY = 'auth-token' // Following the FIRST LEGO League System module standard v1.0

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const config = require('config')

const router = express.Router()
const identityProviderUrl = config.get('idp')
const secret = config.has('secret') ? config.get('secret') : DEFAULT_SECRET
const tokenExpiration = config.has('tokenExpiration') ? config.get('tokenExpiration') : DEFAULT_TOKEN_EXPIRATION
const homeRoute = config.has('homeRoute') ? config.get('homeRoute') : DEFAULT_HOME_ROUTE
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
  res.redirectToIdP()
})

router.get('/consume_token', (req, res, next) => {
  const token = req.query['token'] || req.params['token'] || req.body['token']
  if (token && jwt.verify(token, secret)) {
    res.cookie(COOKIE_KEY, token, { maxAge: tokenExpiration })
    res.redirect(homeRoute)
  } else {
    res.redirectToIdP()
  }
})

module.export = router
