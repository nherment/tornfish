

var ConnStr = require('connexion-string')


var connStr = new ConnStr({
  user: 'user', // default user
  port: 22 // default port
})

var Parser = {}

Parser.parse = function(type, options) {

  switch(type) {

    case 'Config':
      return {
        key: options._[0],
        value: options._[1]
      }

    case 'Server':
      var serverStr = options._[0]
      var server = connStr.parse(serverStr)
      return server
    default:
      throw new Error('unsupported type ' + type)
  }

}

module.exports = Parser
