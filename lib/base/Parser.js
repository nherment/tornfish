

var ConnStr = require('connexion-string')
var randomString = require('randomstring')
var logger = require('../util/Logger.js').get('parser')

var fs = require('fs')
var path = require('path')

var connStr = new ConnStr({
})

var Parser = {}

Parser.parse = function(type, options) {

  switch(type) {

    case 'Config':
      return {
        name: options._[0],
        value: options.value
      }

    case 'Server':
      var server = {
        name: options._[0]
      }
      if(options.host) {
        server.host = options.host
      } else {
        server.host = server.name
      }
      if(options.key) {
        server.key = options.key
      }
      if(options.port) {
        server.port = Number(options.port)
      }
      if(options.user) {
        server.user = options.user
      }
      if(options.password) {
        server.password = options.password
      }
      if(options.group) {
        server.group = options.group
      }
      if(options.lan) {
        server.lan = options.lan
      }

      return server

    case 'Key':
      var keyPath = options.path
      var keyContent = keyPath
      console.log(options)
      if(options.save !== false) { // TODO: only save if explicitely set to true
        try {
          var keyContent = fs.readFileSync(path.normalize(keyPath), 'utf8')
        } catch(err) {
          logger.warn('could not find key at path ['+keyPath+']. Saving the path as is.')
        }
      }
      var key = {
        name: options._[0] || randomString.generate(10),
        key: keyContent,
        password: options.password
      }
      return key

    case 'Image':
      return {
        name: options._[0]
      }
    default:
      throw new Error('unsupported type [' + type + ']')
  }

}

module.exports = Parser
