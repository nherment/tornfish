var winston = require('winston')

var loggersCache = {}

var config = {
  '*': 'debug',
  'database': 'warn'
}

module.exports = {
  get: function(namespace, localspace) {

    if(!loggersCache.hasOwnProperty(namespace)) {
      var logLevel = config[namespace] || config['*']
      loggersCache[namespace] = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)({ level: logLevel })
        ]
      })
    }

    return loggersCache[namespace]

  }
}
