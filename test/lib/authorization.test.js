'use strict'
/* global describe it before */

const connect = require('connect')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiString = require('chai-string')
const request = require('supertest')
const proxyquire = require('proxyquire')

chai.use(chaiString)
const expect = chai.expect

const { LoggerMock, logger } = require('../mocks/ms-logger.mock.js')

const authorizationModule = proxyquire('../../lib/authorization_router', { './logger': LoggerMock })

const AUTHORIZED_STATUS = 200
const UNAUTHORIZED_STATUS = 403
const AUTHORIZED_USERNAME = 'username'
const UNAUTHORIZED_USERNAME = 'unauthorized'
const AUTHORIZED_AUTH_TOKEN = jwt.sign({ username: AUTHORIZED_USERNAME }, process.env.SECRET)
const UNAUTHORIZED_AUTH_TOKEN = jwt.sign({ username: UNAUTHORIZED_USERNAME }, process.env.SECRET)

const authorizedUserMiddleware = chai.spy((req, res) => {
  res.statusCode = AUTHORIZED_STATUS
  res.end()
})

const app = connect()

function correctlyForbiddingAssertion (error, response) {
  if (error) {
    throw error
  }
  expect(response.statusCode).to.equal(UNAUTHORIZED_STATUS)
  expect(logger.info).to.have.been.called()
}

describe('Authorization Router', () => {
  before(() => {
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
