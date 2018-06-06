'use strict'

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const DEFAULT_USERNAME = 'development'
const DEFAULT_SECRET = '321LEGO'

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

exports.router = function(fakeUsername) {
	const router = express.Router()
	const username = fakeUsername || DEFAULT_USERNAME

	router.use(cookieParser())

	router.use('/', (req, res, next) => {
	  let token = jwt.sign({ username }, DEFAULT_SECRET)
	  res.cookie(USER_KEY, username, { maxAge: TOKEN_EXPIRATION })
	  res.cookie(TOKEN_KEY, token, { maxAge: TOKEN_EXPIRATION })
	  next()
	})

	return router()
}