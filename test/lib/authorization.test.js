'use strict'
/* global describe it before */

const express = require('express')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiString = require('chai-string')
const request = require('supertest')
const rewire = require('rewire')

chai.use(chaiString)
const expect = chai.expect

const { LoggerMock } = require('../mocks/ms-logger.mock.js')

const authorizationModule = rewire('../../lib/authorization_router')
authorizationModule.__set__('logger', LoggerMock)

const AUTHORIZED_STATUS = 200
const UNAUTHORIZED_STATUS = 403
const AUTHORIZED_USERNAME = 'username'
const UNAUTHORIZED_USERNAME = 'unauthorized'
const AUTHORIZED_AUTH_TOKEN = jwt.sign({ username: AUTHORIZED_USERNAME }, process.env.SECRET)
const UNAUTHORIZED_AUTH_TOKEN = jwt.sign({ username: UNAUTHORIZED_USERNAME }, process.env.SECRET)

const authorizedUserMiddleware = chai.spy((req, res) => res.sendStatus(AUTHORIZED_STATUS))

const app = express()

function correctlyForbiddingAssertion (error, response) {
  if (error) {
    throw error
  }
  expect(response.statusCode).to.equal(UNAUTHORIZED_STATUS)
  expect(LoggerMock.info).to.have.been.called()
}

describe('Authorization Router', () => {
  before(() => {
    // app.use(authenticationRouter)
    app.use(authorizationModule.router([AUTHORIZED_USERNAME]))
    app.use(authorizedUserMiddleware)
  })

  it('forbid if user is missing', () => {
    request(app)
      .get('/')
      .expect(UNAUTHORIZED_STATUS, correctlyForbiddingAssertion)
  })

  it('forbid if user is unauthorized', () => {
    request(app)
      .get('/')
      .set('auth-token', UNAUTHORIZED_AUTH_TOKEN)
      .expect(UNAUTHORIZED_STATUS, correctlyForbiddingAssertion)
  })

  it('does not forbid if user is authorized from cookie', done => {
    request(app)
      .get('/')
      .set('cookie', `auth-token=${AUTHORIZED_AUTH_TOKEN}`)
      .expect(AUTHORIZED_STATUS, error => {
        if (error) {
          throw error
        }
        done()
      })
  })

  it('does not forbid if user is authorized from header', done => {
    request(app)
      .get('/')
      .set('auth-token', AUTHORIZED_AUTH_TOKEN)
      .expect(AUTHORIZED_STATUS, error => {
        if (error) {
          throw error
        }
        done()
      })
  })
})
