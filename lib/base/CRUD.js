
var DBHelper = require('../db/DBHelper.js')
var ErrorToHuman = require('../db/ErrorToHuman.js')

var Parser = require('./Parser.js')
var _ = require('underscore')

function formatType(type) {
  return type[0].toUpperCase() + type.substring(1).toLowerCase()
}

function exec(command, type, options, callback) {

  type = formatType(type)
  if(!DBHelper.hasOwnProperty(type)) {
    return callback(new Error('unkown type [' + type + ']'))
  }

  switch(command) {
    case 'add':

      var obj = Parser.parse(type, options)
      DBHelper[type].save(obj, function(err, savedObj) {
        if(err) {
          err = ErrorToHuman.text(err)
        }
        prepareForDisplay(type, savedObj)
        callback(err, err ? undefined : savedObj)
      })
      break;
    case 'set':
      // TODO
      var obj = Parser.parse(type, options)
      DBHelper[type].update({name: obj.name}, {$set: obj}, {upsert: false, multi: true}, function(err, updateInfo) {
        if(err) {
          callback(ErrorToHuman.text(err), undefined)
        } else {
          DBHelper[type].find({name: obj.name}, function(err, obj) {
            prepareForDisplay(type, obj)
            callback(err, obj)
          })
        }
      })
      break;
    case 'get':
      break;
    case 'list':
      DBHelper[type].find({}, function(err, list) {
        if(err) {
          err = ErrorToHuman.text(err)
        }
        prepareForDisplay(type, list)
        callback(err, err ? undefined : list)
      })
      break;
    case 'delete':
      var obj = Parser.parse(type, options)
      DBHelper[type].remove(obj, function(err, list) {
        if(err) {
          err = ErrorToHuman.text(err)
        }
        prepareForDisplay(type, list)
        callback(err, list)
      })
      break;

  }

}

function prepareForDisplay(type, obj) {

  if(_.isArray(obj)) {

    for(var i = 0 ; i < obj.length ; i++) {
      prepareForDisplay(type, obj[i])
    }

  } else {
    if(obj) {

      switch(type) {

        case 'Key':
          delete obj.content
          if(obj.password) {
            obj.password = '[hidden]'
          }

          if(/-----BEGIN RSA PRIVATE KEY-----/g.test(obj.key)) {
            obj.key = '[key content hidden]'
          }
          break

        default:
          delete obj._id
          break
      }
    }
  }

}

function isCrudCommand(cmd) {
  return ~['add','list','get','delete', 'set'].indexOf(cmd)

}

module.exports = {
  exec: exec,
  isCrudCommand: isCrudCommand
}
