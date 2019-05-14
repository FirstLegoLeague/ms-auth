
const chai = require('chai')
const proxyquire = require('proxyquire')

const expect = chai.expect

describe('Optional Logger', () => {

  it('returns ms-logger when package presents', () => {
    const MsLogger = {}

    const { Logger } = proxyquire('../../lib/logger', {
      '@first-lego-league/ms-logger': { Logger: MsLogger }
    })

    expect(Logger).to.be.equal(MsLogger)
  })

  it('returns a simple logger when ms-logger package not presents', () => {
    const { Logger } = proxyquire('../../lib/logger', {
      '@first-lego-league/ms-logger': null
    })

    const logger = new Logger()

    ;['debug', 'info', 'warn'].forEach(level => {
      expect(logger[level]).to.be.equal(console.log)
    })

    ;['error', 'fatal'].forEach(level => {
      expect(logger[level]).to.be.equal(console.error)
    })
  })

  it('returns a logger factory when ms-logger package not presents', () => {
    const { Logger } = proxyquire('../../lib/logger', {
      '@first-lego-league/ms-logger': null
    })

    const logger = Logger()

    ;['debug', 'info', 'warn'].forEach(level => {
      expect(logger[level]).to.be.equal(console.log)
    })

    ;['error', 'fatal'].forEach(level => {
      expect(logger[level]).to.be.equal(console.error)
    })
  })

  it('throws error when catch error on loading the ms-logger', () => {
    const error = new Error()

    expect(() => {
      proxyquire('../../lib/logger', {
        '@first-lego-league/ms-logger': {
          get Logger () {
            throw error
          }
        }
      })
    })
      .to.throw(error)
  })
})