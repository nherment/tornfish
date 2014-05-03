
var _               = require("underscore")
var DB              = require("./DB.js")
var EventEmitter    = require('events').EventEmitter

var DBHelper = {}

var queue = []

var dbConnection

var loadedCollections = {}

function Helper(collectionName, keyName, config) {

  function load(callback) {
    if(dbConnection) {
      return callback()
    }
    DB(function(db) {
      dbConnection = db

      if(!loadedCollections.hasOwnProperty(collectionName)) {

        dbConnection.loadCollection(collectionName, config, function(err) {
          if(err) {
            throw err
          }
          loadedCollections[collectionName] = true
          callback()
        })

      } else {
        callback()
      }
    })
  }

  this.findOne = function(query, options, callback) {

    load(function() {
      dbConnection.findOne(collectionName, query, options, callback)
    })

  }

  this.findByKey = function(key, options, callback) {

    load(function() {
      var query = {}
      query[keyName] = key

      dbConnection.findOne(collectionName, query, options, callback)
    })
  }

  this.find = function(query, fields_or_options, options_or_callback, callback) {

    load(function() {
      dbConnection.find(collectionName, query, fields_or_options, options_or_callback, callback)
    })

  }

  this.count = function(query, optsOrCallback, callback) {
    load(function() {
      dbConnection.count(collectionName, query, optsOrCallback, callback)
    })
  }

  this.update = function(query, obj, options, callback) {

    load(function() {
      dbConnection.update(collectionName, query, obj, options, callback)
    })

  }

  this.save = function(obj, callback) {

    load(function() {
      if(obj._id) {

        DB.update(collectionName, {"_id":obj._id}, obj, {safe: true}, callback)

      } else if(_.isArray(obj)) {

        var callbackCount = obj.length

        console.log("Saving an array of length ["+callbackCount+"]")

        var error
        var results = []

        var doneCallback = function(err, result) {

          callbackCount --
          if(err) {
            console.error(err)
            error = new Error("Multiple errors while saving objects")
          }

          if(result) {
            results.push(result)
          }

          if(callbackCount === 0) {
            console.log('All done')
            callback(error, result)
          }

        }

        for(var i = 0 ; i < obj.length ; i++) {
          if(obj[i] && obj[i]._id) {
            dbConnection.update(collectionName, {"_id": obj[i]._id}, obj[i], {safe: true}, function(err, result) {
              doneCallback(err, result)
            })
          } else {
            dbConnection.save(collectionName, obj[i], function(err, result) {
              doneCallback(err, result)
            })
          }

        }

      } else {

        dbConnection.save(collectionName, obj, callback)

      }
    })
  }

  this.findAndModify = function(query, sortOrder, update, options, callback) {
    load(function() {
      dbConnection.findAndModify(collectionName, query, sortOrder, update, options, callback)
    })
  }

  this.remove = function(selector, option_or_callback, callback) {
    load(function() {
      dbConnection.remove(collectionName, selector, option_or_callback, callback)
    })
  }
}

DBHelper.Server = new Helper("servers", "name", [ { index: {host: 1, user: 1, port: 1}, options: {unique: true} } ])
DBHelper.Group  = new Helper("groups", "name", [ { index: {name: 1}, options: {unique: true} } ])
DBHelper.Key    = new Helper("keys", "name", [ { index: {name: 1}, options: {unique: true} } ])
DBHelper.Script = new Helper("scripts", "name", [ { index: {name: 1}, options: {unique: true} } ])
DBHelper.Config = new Helper("configs", "key", [ { index: {key: 1}, options: {unique: true} } ])

module.exports = DBHelper
