var logger = require('./lib/util/Logger.js').get('tornfish')

var CRUD = require('./lib/base/CRUD.js')

function tornfish(command, type, options, callback) {

  logger.silly('command:', command, ', type:', type, ' options:', JSON.stringify(options))

  CRUD(command, type, options, callback)
}

module.exports = tornfish
