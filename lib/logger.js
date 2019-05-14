exports.Logger = (() => {
    try {
        return require('@first-lego-league/ms-logger').Logger
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        } else {
            function SimpleLogger() {
                if (!(this instanceof SimpleLogger)) {
                    return new SimpleLogger(arguments)
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