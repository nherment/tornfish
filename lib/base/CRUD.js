
var DBHelper = require('../db/DBHelper.js')
var ErrorToHuman = require('../db/ErrorToHuman.js')

var Parser = require('./Parser.js')

function formatType(type) {
  return type[0].toUpperCase() + type.substring(1).toLowerCase()
}

function CRUD(command, type, options, callback) {

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
        callback(err, err ? undefined : 'ok')
      })
      break;
    case 'get':
      break;
    case 'list':
      DBHelper[type].find({}, function(err, list) {
        if(err) {
          err = ErrorToHuman.text(err)
        }
        callback(err, err ? undefined : list)
      })
      break;
    case 'delete':
      break;

  }

}

module.exports = CRUD
