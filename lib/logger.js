'use strict'

exports.Logger = (() => {
  try {
    return require('@first-lego-league/ms-logger').Logger
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    } else {
      const SimpleLogger = function Self () {
        if (!(this instanceof Self)) {
          return new Self(arguments)
        }
      }

      SimpleLogger.prototype = {
        debug: console.log,
        info: console.log,
        warn: console.log,
        error: console.error,
        fatal: console.error
      }

      return SimpleLogger
    }
  }
})()
