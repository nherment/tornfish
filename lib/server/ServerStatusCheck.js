
var Loopy = require('loopy')
var DBHelper = require('../db/DBHelper.js')
var Server = require('../db/Server.js')

function ServerStatusCheck() {

  this._servers = {}

}

ServerStatusCheck.prototype._refreshServerList = function(callback) {
  var self = this
  DBHelper.Server.find({}, function(err, serverConfigs) {
    if(err) {
      callback(err)
    } else {
      self._merge(serverConfigs)
      callback(undefined)
    }
  })
}

ServerStatusCheck.prototype.update = function(callback) {
  var self = this
  this._refreshServerList(function(err) {

    if(err) {
      callback(err)
    } else {

      for(var hash in self._servers) {
        self._servers[hash].status()
      }

    }

  })

}

ServerStatusCheck.prototype._merge = function(serverConfigs) {

  var updatedServers = {}

  for(var i = 0 ; i < serverConfigs.length ; i++) {
    var hash = Server.hash(serverConfigs[i])
    if(this._servers[hash]) {
      updatedServers[hash] = this._servers[hash]
    }
  }
  this._servers = updatedServers

}

module.exports = ServerStatusCheck
