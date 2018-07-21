'use strict'

const TOKEN_KEY = 'auth-token'
const DEFAULT_SECRET = '321LEGO'

const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const secret = process.env.SECRET || DEFAULT_SECRET

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
        res.status(403).send('Forbidden')
      }
    } catch (err) {
      res.status(403).send('Forbidden')
    }
  })

  return router

}
