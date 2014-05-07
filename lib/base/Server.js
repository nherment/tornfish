
var Connection = require('ssh2');

var ConnStr = require('connexion-string')
var _ = require('underscore')
var HTTPParser = require('http-parser-js').HTTPParser

var DBHelper = require('../db/DBHelper.js')
var fs = require('fs')
var path = require('path')


function Server(config) {
  this._hash = Server.hash(config)
  this._logger = require('../util/Logger.js').get('server')
  this._config = config
  this._status = 'new'
}

Server.prototype._setup = function(callback) {
  if(!this._setupDone) {
    var self = this

    if(self._config.key) {
      DBHelper.Key.findOne({name: self._config.key}, function(err, key) {
        if(err) {
          callback(err)
        } else if(!key) {
          callback(new Error('could not find key ['+self._config.key+']'))
        } else {
          if(/-----BEGIN RSA PRIVATE KEY-----/g.test(key.key)) {
            key.key = new Buffer(key.key)
            self._config.key = key
            callback(undefined)
          } else {
            // assuming a directory path to the key
            var keyPath = path.normalize(key.key)
            fs.readFile(keyPath, 'utf8', function(err, keyContent) {
              if(err) {
                callback(err)
              } else {
                key.key = new Buffer(keyContent)
                self._config.key = key
                callback(undefined)
              }
            })
          }
        }

      })

    } else {
      setImmediate(function() {
        callback(undefined)
      })
    }

  } else {
    setImmediate(function() {
      callback(undefined)
    })
  }

}

Server.prototype._connect = function(callback) {

  var self = this

  if(!this._connection && (this._status === 'new' || this._status === 'closed')) {

    this._status = 'connecting'

    this._connection = new Connection()
    this._connection.on('ready', function() {
//       console.log('Connection :: ready')
      self._status = 'connected'
      callback()
    })
    this._connection.on('error', function(err) {
      console.log('Connection :: error :: ' + err)
      callback(err)
    })
    this._connection.on('end', function() {
//       console.log('Connection :: end')
    })
    this._connection.on('close', function(had_error) {
      self._status = 'closed'
      this._connection = null
//       console.log('Connection :: close')
    })

    var connectionConfig = {
      host: self._config.host,
      port: self._config.port,
      username: self._config.user
    }

    if(this._config.key) {
      connectionConfig.privateKey = this._config.key.key
    } else {
      connectionConfig.password = this._config.password
    }

    //console.log(connectionConfig)
    this._connection.connect(connectionConfig)
  }
}

Server.prototype.containers = function(callback) {
  this.http('echo -e "GET /containers/json HTTP/1.0\r\n" | sudo nc -U /var/run/docker.sock', function(err, containers) {
    if(containers) {
      for(var i = 0 ; i < containers.length ; i++) {
        if(containers[i].Id) {
          containers[i].Id = containers[i].Id.substring(0, 10)
        }
        if(containers[i].Created) {
          containers[i].Created = new Date(containers[i].Created)
        }
        if(containers[i].Ports) {
          var ports = []
          for(var j = 0 ; j < containers[i].Ports.length ; j++) {
            ports.push(containers[i].Ports[j].PublicPort+':'+containers[i].Ports[j].PrivatePort)
          }

          containers[i].Ports = ports.join(',')
        }
      }
    }
    callback(err, containers)
  })
}

Server.prototype.images = function(callback) {
  this.http('echo -e "GET /images/json HTTP/1.0\r\n" | sudo nc -U /var/run/docker.sock', function(err, containers) {
    if(containers) {
      for(var i = 0 ; i < containers.length ; i++) {
        if(containers[i].Id) {
          containers[i].Id = containers[i].Id.substring(0, 10)
        }
        if(containers[i].ParentId) {
          containers[i].ParentId = containers[i].ParentId.substring(0, 10)
        }
        if(containers[i].Created) {
          containers[i].Created = new Date(containers[i].Created)
        }
      }
    }
    callback(err, containers)
  })
}

/** will execute a remote command and parse the output string as if it was an HTTP response
 *
 */
Server.prototype.http = function(cmd, callback) {

  this.exec(cmd, function(err, output) {

    if(err) {
      return callback(err, undefined)
    }

    var parser = new HTTPParser(HTTPParser.RESPONSE)

    var buffer = new Buffer(output)

    var headers = {}

    parser.reinitialize(HTTPParser.RESPONSE)

    parser.onHeadersComplete = function(info) {

      for(var i = 0 ; i < info.headers.length ; i+=2) {
        headers[info.headers[i].toLowerCase()] = info.headers[i+1].toLowerCase()
      }

    }

    parser.onBody = function(b, start, len) {

      // TODO: do not always assume it is json
      var body =  b.toString('utf8', start, start+len)
      try {
        body = JSON.parse(body)
      } catch(parseError) {
        console.log('Expected remote call to return JSON but failed to parse it.', err)
      }

      callback(undefined, body)
    }

    parser.execute(buffer, 0, buffer.length)

  })
}

Server.prototype.exec = function(cmd, callback) {
  var self = this

  self._setup(function(err) {

    if(err) return callback(err, undefined)

    self._connect(function(err) {

      if(err) return callback(err, undefined)

      self._connection.exec(cmd, function(err, stream) {
        if (err) throw err
        var output = ''

        stream.on('data', function(data, extended) {
          output += data
        })

        stream.on('end', function() {
  //         console.log('Stream :: EOF')
        })

        stream.on('close', function() {
          callback(err, output)
        })

        stream.on('exit', function(code, signal) {
          if(code != 0) {
            err = new Error('command failed with exit code ' + code + '.\n' + output)
          }

        })
      })
    })
  })
}

Server.prototype.serialize = function() {
  var server = _.clone(this._config)
  server.status = this._status
  server.lastSuccessfulContact = this._lastSuccessfulContact
  server.lastFailedContact = this._lastFailedContact
}

Server.prototype.hash = function() {
  return this._hash
}


var connStr = new ConnStr({port: 22})
Server.hash = function(config) {
  return connStr.stringify(config)
}


module.exports = Server
