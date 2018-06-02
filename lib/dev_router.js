'use strict'

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const DEV_USERNAME = 'development'
const DEFAULT_SECRET = '321LEGO'

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.use(cookieParser())


router.use('/', (req, res, next) => {
  let token = jwt.sign({ username: DEV_USERNAME }, DEFAULT_SECRET)
  res.cookie(USER_KEY, DEV_USERNAME, { maxAge: TOKEN_EXPIRATION })
  res.cookie(TOKEN_KEY, token, { maxAge: TOKEN_EXPIRATION })
})

exports.router = router
