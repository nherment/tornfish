var winston = require('winston')

var loggersCache = {}

var config = {
  '*': 'debug',
  'database': 'warn'
}

module.exports = {
  get: function(name) {

    if(!loggersCache.hasOwnProperty(name)) {
      var logLevel = config[name] || config['*']
      loggersCache[name] = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)({ level: logLevel })
        ]
      })
    }

    return loggersCache[name]

  }
}
