'use strict'
/* global describe it beforeEach */

const chai = require('chai')
const chaiSpies = require('chai-spies')
const chaiString = require('chai-string')
const sinon = require('sinon')

const { setCookies, redirect } = require('../../lib/common')

chai.use(chaiSpies)
chai.use(chaiString)

const expect = chai.expect

describe('Common module\'s', () => {
  describe('setCookies function', () => {
    it('sets the header with the data of the cookies', () => {
      const data = { cookieName: 'cookieValue' }
      const response = { setHeader: chai.spy() }

      setCookies(response, data)

      expect(response.setHeader).to.be.called.with('Set-Cookie', ['cookieName=cookieValue'])
    })

    it('sets the header with multiple cookies', () => {
      const data = {
        cookieName: 'cookieValue',
        otherCookie: 'something'
      }
      const response = { setHeader: chai.spy() }

      setCookies(response, data)

      expect(response.setHeader).to.be.called.with('Set-Cookie', [
        'cookieName=cookieValue',
        'otherCookie=something'
      ])
    })

    it('sets the header with single option', () => {
      const data = {
        cookieName: 'cookieValue'
      }
      const response = { setHeader: chai.spy() }

      setCookies(response, data, { domain: 'domain.com' })

      expect(response.setHeader).to.be.called.with('Set-Cookie', [
        'cookieName=cookieValue; Domain=domain.com'
      ])
    })

    it('sets the header with multiple options', () => {
      const data = {
        cookieName: 'cookieValue'
      }
      const response = { setHeader: chai.spy() }

      setCookies(response, data, {
        domain: 'domain.com',
        path: 'a/path/to/somewhere'
      })

      expect(response.setHeader).to.be.called.with('Set-Cookie', [
        'cookieName=cookieValue; Domain=domain.com; Path=a/path/to/somewhere'
      ])
    })

    it('sets the header with a non-value options', () => {
      const data = {
        cookieName: 'cookieValue'
      }
      const response = { setHeader: chai.spy() }

      setCookies(response, data, {
        secure: true
      })

      expect(response.setHeader).to.be.called.with('Set-Cookie', [
        'cookieName=cookieValue; Secure'
      ])
    })

    it('not sets the header with a non-value options labeled false', () => {
      const data = {
        cookieName: 'cookieValue'
      }
      const response = { setHeader: chai.spy() }

      setCookies(response, data, {
        secure: false
      })

      expect(response.setHeader).to.be.called.with('Set-Cookie', [
        'cookieName=cookieValue'
      ])
    })

    it('sets the header with options on all cookies', () => {
      const data = {
        cookieName: 'cookieValue',
        otherCookie: 'something'
      }
      const response = { setHeader: chai.spy() }

      setCookies(response, data, {
        secure: true
      })

      expect(response.setHeader).to.be.called.with('Set-Cookie', [
        'cookieName=cookieValue; Secure',
        'otherCookie=something; Secure'
      ])
    })

    it('sets the header with modified options when max-age appears', () => {
      let clock
      try {
        clock = sinon.useFakeTimers(2039)

        const data = {
          cookieName: 'cookieValue'
        }

        const response = { setHeader: chai.spy() }

        setCookies(response, data, {
          maxAge: 1435
        })

        expect(response.setHeader).to.be.called.with('Set-Cookie', [
          'cookieName=cookieValue; Max-Age=1; Expires=Thu, 01 Jan 1970 00:00:03 GMT'
        ])
      } finally {
        clock.restore()
      }
    })
  })

  describe('redirect function', () => {
    let response

    beforeEach(() => {
      response = {
        setHeader: chai.spy(),
        end: chai.spy()
      }
    })

    it('sets header in the response', () => {
      redirect(response, 'destination.com')

      expect(response.setHeader).to.be.called.with('Location', 'destination.com')
    })

    it('sets status code in the response', () => {
      redirect(response, 'destination.com')

      expect(response.statusCode).to.be.equal(302)
    })

    it('ends the response', () => {
      redirect(response, 'destination.com')

      expect(response.end).to.be.called.once
    })
  })
})
