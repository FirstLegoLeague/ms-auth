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

const authenticationModule = proxyquire('../../lib/authentication_router', { './logger': LoggerMock })

const REDIRECTION_STATUS = 302
const NON_REDIRECTION_STATUS = 200
const USERNAME = 'username'
const CORRENT_AUTH_TOKEN = jwt.sign({ username: USERNAME }, process.env.SECRET)
const WRONG_AUTH_TOKEN = jwt.sign({ username: USERNAME }, `${process.env.SECRET}-123`)

const authenticatedUserMiddleware = chai.spy((req, res) => {
  res.statusCode = NON_REDIRECTION_STATUS
  res.end()
})

const app = connect()

function correctlyRedirectsToIdPAssertion (logLevel, logMessage, done) {
  return (error, response) => {
    if (error) {
      done(error)
      return
    }
    expect(response.statusCode).to.equal(REDIRECTION_STATUS)
    expect(response.headers['location']).to.startWith(process.env.MODULE_IDENTITY_PROVIDER_URL)
    if (logLevel) {
      expect(logger[logLevel]).to.have.been.called.with(logMessage)
    }
    done()
  }
}

describe('Authentication Router', () => {
  before(() => {
    app.use(authenticationModule.router)
    app.use(authenticatedUserMiddleware)
  })

  describe('redirects to IDP', () => {
    it('if there is no Authentication Token', done => {
      request(app)
        .get('/')
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })

    it('correctly even without a slash in the end of the route', done => {
      request(app)
        .get('/not-slash')
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })

    it('if there is a wrong Authentication Token in cookie', done => {
      request(app)
        .get('/')
        .set('cookie', `auth-token=${WRONG_AUTH_TOKEN}`)
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })

    it('if there is a wrong Authentication Token in header', done => {
      request(app)
        .get('/')
        .set('auth-token', WRONG_AUTH_TOKEN)
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })
  })

  describe('does not redirect to IDP', () => {
    it('if there is a correct Authentication Token in cookie', done => {
      request(app)
        .get('/')
        .set('cookie', `auth-token=${CORRENT_AUTH_TOKEN}`)
        .expect(NON_REDIRECTION_STATUS, () => {
          expect(authenticatedUserMiddleware).to.have.been.called()
          done()
        })
    })

    it('if there is a correct Authentication Token in header', done => {
      request(app)
        .get('/')
        .set('auth-token', CORRENT_AUTH_TOKEN)
        .expect(NON_REDIRECTION_STATUS, () => {
          expect(authenticatedUserMiddleware).to.have.been.called()
          done()
        })
    })
  })

  describe('/consume_token', () => {
    it('looks for the token in query', done => {
      request(app)
        .get(`/consume_token?token=${CORRENT_AUTH_TOKEN}`)
        .expect(NON_REDIRECTION_STATUS, () => {
          expect(authenticatedUserMiddleware).to.have.been.called()
          done()
        })
    })

    it('looks for the token in body', done => {
      request(app)
        .post('/consume_token')
        .send({ token: CORRENT_AUTH_TOKEN })
        .expect(NON_REDIRECTION_STATUS, () => {
          expect(authenticatedUserMiddleware).to.have.been.called()
          done()
        })
    })

    it('redirect if there is no token in the body or query', done => {
      request(app)
        .post('/consume_token')
        .send({ })
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })

    it('does not look for the token in cookies', done => {
      request(app)
        .get('/consume_token')
        .set('cookie', `auth-token=${CORRENT_AUTH_TOKEN}`)
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })

    it('does not look for the token in headers', done => {
      request(app)
        .get('/consume_token')
        .set('auth-token', CORRENT_AUTH_TOKEN)
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('info',
          'Redirecting to Identity Provider: No auth token found.', done))
    })

    it('rejects wrong tokens', done => {
      request(app)
        .get(`/consume_token?token=${WRONG_AUTH_TOKEN}`)
        .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion('warn',
          'Redirecting to Identity Provider: Found Illegal auth token.', done))
    })

    it('sets auth cookie', done => {
      request(app)
        .get(`/consume_token?token=${CORRENT_AUTH_TOKEN}`)
        .expect(REDIRECTION_STATUS, (err, response) => {
          if (err) {
            done(error)
            return
          }
          const cookies = response.headers['set-cookie'].map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
          const authCookieValue = cookies.find(([key]) => key === 'auth-token')[1]
          expect(authCookieValue).to.equal(CORRENT_AUTH_TOKEN)
          done()
        })
    })

    it('sets username cookie', done => {
      request(app)
        .get(`/consume_token?token=${CORRENT_AUTH_TOKEN}`)
        .expect(REDIRECTION_STATUS, (err, response) => {
          if (err) {
            done(error)
            return
          }
          const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
          const authCookieValue = cookies.find(([key]) => key === 'username')[1]
          expect(authCookieValue).to.equal(USERNAME)
          done()
        })
    })
  })

  describe('/logout', () => {
    function login () {
      return request(app)
        .get(`/consume_token?token=${CORRENT_AUTH_TOKEN}`)
    }

    it('redirects to IDP', done => {
      login()
        .then(() => {
          request(app)
            .get('/logout')
            .set('cookie', [`auth-token=${CORRENT_AUTH_TOKEN}`, `username=${USERNAME}`])
            .expect(REDIRECTION_STATUS, correctlyRedirectsToIdPAssertion(null, null, done))
        })
        .catch(done)
    })

    it('removes auth cookie', done => {
      login()
        .then(() => {
          request(app)
            .get('/logout')
            .set('cookie', [`auth-token=${CORRENT_AUTH_TOKEN}`, `username=${USERNAME}`])
            .expect(REDIRECTION_STATUS, (err, response) => {
              if (err) {
                done(error)
                return
              }

              const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
              const authCookieValue = cookies.find(([key]) => key === 'auth-token')[1]
              expect(authCookieValue).to.equal('')
              done()
            })
        })
        .catch(done)
    })

    it('removes username cookie', done => {
      login()
        .then(() => {
          request(app)
            .get('/logout')
            .set('cookie', [`auth-token=${CORRENT_AUTH_TOKEN}`, `username=${USERNAME}`])
            .expect(REDIRECTION_STATUS, (err, response) => {
              if (err) {
                done(error)
                return
              }

              const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
              const usernameCookieValue = cookies.find(([key]) => key === 'username')[1]
              expect(usernameCookieValue).to.equal('')
              done()
            })
        })
        .catch(done)
    })
  })
})
