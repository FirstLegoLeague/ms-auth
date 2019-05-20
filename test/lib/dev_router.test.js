
const express = require('express')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiString = require('chai-string')
const request = require('supertest')

chai.use(chaiString)
const expect = chai.expect

const devRouterModule = require('../../lib/dev_router')

const OK_STATUS = 200
const DEVLEOPMENT_USERNAME = 'development'
const FAKE_USERNAME = 'fakeUsername'

const doneMiddleware = chai.spy((req, res) => res.sendStatus(OK_STATUS))

describe('Dev Router', () => {
  describe('without a fake username', () => {
    const app = express()

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
          const authCookieValue = cookies.find(([key, value]) => key === 'auth-token')[1]
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
          const usernameCookieValue = cookies.find(([key, value]) => key === 'username')[1]
          expect(usernameCookieValue).to.equals(DEVLEOPMENT_USERNAME)
          done()
        })
    })
  })

  describe('with a fake username', () => {
    const app = express()

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
          const authCookieValue = cookies.find(([key, value]) => key === 'auth-token')[1]
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
          const usernameCookieValue = cookies.find(([key, value]) => key === 'username')[1]
          expect(usernameCookieValue).to.equals(FAKE_USERNAME)
          done()
        })
    })
  })
})
