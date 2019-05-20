
const chai = require('chai')
const chaiString = require('chai-string')

chai.use(chaiString)
const expect = chai.expect

const authenticationMiddleware = require('../lib/authentication_router').router
const authenticationDevMiddleware = require('../lib/dev_router').router
const authroizationMiddlware = require('../lib/authorization_router').router

const auth = require('../')

describe('ms-auth index file', () => {
  it('exposes the Authentication Middleware', () => {
    expect(auth.authenticationMiddleware).to.equal(authenticationMiddleware)
  })
  it('exposes the Authorization Middleware', () => {
    expect(auth.authroizationMiddlware).to.equal(authroizationMiddlware)
  })
  it('exposes the Authentication Dev Middleware', () => {
    expect(auth.authenticationDevMiddleware).to.equal(authenticationDevMiddleware)
  })
})
