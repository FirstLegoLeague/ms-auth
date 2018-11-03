'use strict'
/* global describe it */

const express = require('express')
const chai = require('chai')
const chaiString = require('chai-string')
const request = require('supertest')

const authenticationRouter = require('../lib/authentication_router').router

chai.use(chaiString)
const expect = chai.expect
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
  app.use(authenticationRouter)

  it('Redirects to IDP if there is no Authentication Token', () => {
    request(app)
      .get('/')
      .expect(REDIRECTION_STATUS, correctlyRedirectsToIDP)
  })
})
