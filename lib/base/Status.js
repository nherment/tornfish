
var Server = require('./Server.js')
var DBHelper = require('../db/DBHelper.js')

function exec(command, serverHost, options, callback) {
  DBHelper.Server.find({host:serverHost}, function(err, serverDataObj) {
    if(err) {
      callback(err, undefined)
    } else if(serverDataObj && serverDataObj.length > 0) {
      var server = new Server(serverDataObj[0])
      server.status(function(err, statusInfo) {
        callback(err, statusInfo)
      })

    } else {
      callback(new Error('not found: Server::' + serverHost), undefined)
    }
  })
}

function isStatusCommand(cmd) {
  return cmd === 'status'
}

module.exports = {
  isStatusCommand: isStatusCommand,
  exec: exec
}
