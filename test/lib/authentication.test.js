'use strict'
/* global describe it */

const express = require('express')
const chai = require('chai')
const chaiString = require('chai-string')
const request = require('supertest')
const rewire = require('rewire')

chai.use(chaiString)
const expect = chai.expect

const { LoggerMock } = require('../mocks/ms-logger.mock.js')

const authenticationModule = rewire('../../lib/authentication_router')
authenticationModule.__set__('logger', LoggerMock)

const REDIRECTION_STATUS = 302

function correctlyRedirectsToIDP (error, response) {
  if (error) {
    throw error
  }
  expect(response.statusCode).to.equal(REDIRECTION_STATUS)
  expect(response.headers['location']).to.startWith(process.env.MODULE_IDENTITY_PROVIDER_URL)
}

describe('Authentication Router', () => {
  const app = express()
  app.use(authenticationModule.router)

  it('redirects to IDP if there is no Authentication Token', () => {
    request(app)
      .get('/')
      .expect(REDIRECTION_STATUS, correctlyRedirectsToIDP)
      .then(() => {
        expect(LoggerMock.info).to.have.been.called.with('Redirecting to Identity Provider: No auth token found.')
      })
      .catch(() => expect(true).to.be.false())
  })
})
