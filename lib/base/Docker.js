
var Server = require('./Server.js')
var DBHelper = require('../db/DBHelper.js')


function exec(command, serverName, options, callback) {
  DBHelper.Server.find({name:serverName}, function(err, serverDataObj) {
    if(err) {
      callback(err, undefined)
    } else if(serverDataObj && serverDataObj.length > 0) {
      var server = new Server(serverDataObj[0])

      server[command](options, function(err, statusInfo) {
        callback(err, statusInfo)
      })

    } else {
      callback(new Error('not found: Server::' + serverHost), undefined)
    }
  })
}

function isDockerCommand(cmd) {
  return ~['containers', 'images', 'deploy', 'undeploy'].indexOf(cmd)
}

module.exports = {
  isDockerCommand: isDockerCommand,
  exec: exec
}
