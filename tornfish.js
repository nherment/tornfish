var logger = require('./lib/util/Logger.js').get('tornfish')

var CRUD = require('./lib/base/CRUD.js')
var Docker = require('./lib/base/Docker.js')

var fs = require('fs')

function tornfish(command, type, options, callback) {

  logger.silly('command:', command, ', type:', type, ' options:', JSON.stringify(options))

  if(CRUD.isCrudCommand(command)) {
    CRUD.exec(command, type, options, callback)
  } else if(Docker.isDockerCommand(command)) {
    Docker.exec(command, type, options, callback)
  } else if(command === 'help') {
    fs.readFile(__dirname + '/doc/usage.md', function(err, content) {
      callback(err, content ? content.toString('utf8') : undefined)
    })
  } else {
    setImmediate(function() {
      callback(new Error('unsupported command ['+command+']'), undefined)
    })
  }
}

module.exports = tornfish
