'use strict'

const cookie = require('cookie')

exports.setCookies = (response, data, options) => {
  if (options && options.maxAge) {
    options = Object.assign({}, options, {
      maxAge: options.maxAge / 1000,
      expires: new Date(Date.now() + options.maxAge)
    })
  }

  response.setHeader('Set-Cookie', Object.entries(data)
    .map(([key, value]) => cookie.serialize(key, value, options))
  )
}

exports.redirect = (response, location) => {
  response.setHeader('Location', location)
  response.statusCode = 302
  response.end()
}
