'use strict'

const express = require('express')

exports.router = function (users) {
  const router = express.Router()

  router.use((req, res, next) => {
    if (users.includes(req.username)) {
      next()
    } else {
      res.status(403).send('Forbidden')
    }
  })

  return router

}