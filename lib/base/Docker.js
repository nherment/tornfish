
var Server = require('./Server.js')
var DBHelper = require('../db/DBHelper.js')
var SR = require('serial').SerialRunner
var _ = require('underscore')


function exec(command, serverName, options, callback) {

  var servers = [serverName]

  var results = []

  var r = new SR()

  r.add(executeServerCommand, command, serverName, options, results)

  for(var i = 0 ; i < options._.length ; i++) {
    if(!~servers.indexOf(options._[i])) {
      servers.push(options._[i])

      r.add(executeServerCommand, command, options._[i], options, results)
    }
  }

  r.run(function() {
    callback(undefined, results)
  })


}

function executeServerCommand(command, serverName, options, results, callback) {

  DBHelper.Server.find({name:serverName}, function(err, serverDataObj) {
    if(err) {
      callback(err, undefined)
    } else if(serverDataObj && serverDataObj.length > 0) {
      var server = new Server(serverDataObj[0])

      server[command](options, function(err, statusInfo) {

        if(err) {
          results.push({error: err, server: serverName})
        } else {

          if(!_.isString(statusInfo) && _.isArray(statusInfo)) {
            for(var i = 0 ; i < statusInfo.length ; i++) {
              statusInfo[i].server = serverName
              results.push(statusInfo[i])
            }
          } else if(_.isString(statusInfo)) {

            var info = {
              server: serverName,
              info: statusInfo
            }
            results.push(info)
          } else {
            statusInfo.server = serverName
            results.push(statusInfo)
          }
        }
        callback(err)
      })

    } else {
      err = new Error('server not found')
      results.push({error: err, server: serverName})
      callback(err)
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
