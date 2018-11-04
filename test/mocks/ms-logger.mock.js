'use strict'

const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)

const LoggerMock = {
  debug: () => { },
  info: () => { },
  warn: () => { },
  error: () => { },
  fatal: () => { }
}

const loggerSandbox = chai.spy.sandbox()
loggerSandbox.on(LoggerMock, ['debug', 'info', 'warn', 'error', 'fatal'])

exports.LoggerMock = LoggerMock
