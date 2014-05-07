var logger = require('./lib/util/Logger.js').get('tornfish')

var CRUD = require('./lib/base/CRUD.js')
var Status = require('./lib/base/Status.js')

function tornfish(command, type, options, callback) {

  logger.silly('command:', command, ', type:', type, ' options:', JSON.stringify(options))

  if(CRUD.isCrudCommand(command)) {
    CRUD.exec(command, type, options, callback)
  } else if(Status.isStatusCommand(command)) {
    Status.exec(command, type, options, callback)
  }
}

module.exports = tornfish
