'use strict'
/* global describe it before */

const connect = require('connect')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiSpies = require('chai-spies')
const chaiString = require('chai-string')
const request = require('supertest')

chai.use(chaiString)
chai.use(chaiSpies)

const expect = chai.expect

const devRouterModule = require('../../lib/dev_router')

const OK_STATUS = 200
const DEVLEOPMENT_USERNAME = 'development'
const FAKE_USERNAME = 'fakeUsername'

const doneMiddleware = chai.spy((req, res) => {
    res.statusCode = OK_STATUS
    res.end()
})

describe('Dev Router', () => {
  describe('without a fake username', () => {
    const app = connect()

    before(() => {
      app.use(devRouterModule.router())
      app.use(doneMiddleware)
    })

    it('sets the auth cookie', done => {
      request(app)
        .get('/')
        .expect(OK_STATUS, (error, response) => {
          if (error) {
            throw error
          }
          const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
          const authCookieValue = cookies.find(([key]) => key === 'auth-token')[1]
          expect(jwt.verify(authCookieValue, process.env.SECRET).username).to.equals(DEVLEOPMENT_USERNAME)
          done()
        })
    })

    it('sets the username cookie', done => {
      request(app)
        .get('/')
        .expect(OK_STATUS, (error, response) => {
          if (error) {
            throw error
          }
          const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
          const usernameCookieValue = cookies.find(([key]) => key === 'username')[1]
          expect(usernameCookieValue).to.equals(DEVLEOPMENT_USERNAME)
          done()
        })
    })
  })

  describe('with a fake username', () => {
    const app = connect()

    before(() => {
      app.use(devRouterModule.router(FAKE_USERNAME))
      app.use(doneMiddleware)
    })

    it('sets the auth cookie', done => {
      request(app)
        .get('/')
        .expect(OK_STATUS, (error, response) => {
          if (error) {
            throw error
          }
          const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
          const authCookieValue = cookies.find(([key]) => key === 'auth-token')[1]
          expect(jwt.verify(authCookieValue, process.env.SECRET).username).to.equals(FAKE_USERNAME)
          done()
        })
    })

    it('sets the username cookie', done => {
      request(app)
        .get('/')
        .expect(OK_STATUS, (error, response) => {
          if (error) {
            throw error
          }
          const cookies = response.get('set-cookie').map(cookie => cookie.substring(0, cookie.indexOf(';')).split('='))
          const usernameCookieValue = cookies.find(([key]) => key === 'username')[1]
          expect(usernameCookieValue).to.equals(FAKE_USERNAME)
          done()
        })
    })
  })
})
