'use strict'

const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)

const LoggerMock = {
  debug: message => console.log(message, 'debug'),
  info: message => console.log(message, 'info'),
  warn: message => console.log(message, 'warn'),
  error: message => console.log(message, 'error'),
  fatal: message => console.log(message, 'fatal')
}

const loggerSandbox = chai.spy.sandbox()
loggerSandbox.on(LoggerMock, ['debug', 'info', 'warn', 'error', 'fatal'])

exports.LoggerMock = LoggerMock
