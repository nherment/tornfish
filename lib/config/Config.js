var fs = require('fs')

var jsonlint = require('jsonlint')


function Config(path) {
  this._valid = false
  this._path = path.normalize(path)

}

Config.prototype.get = function() {
  return this._config
}

Config.prototype.save = function() {
}

Config.prototype.valid() {
  if(!this._valid) {
    this._readConfig()
    this._valid = true
  }
}

Config.prototype._readConfig() {
  if(!this._valid) {
    var configString
    try {
      configString = fs.readFileSync(this._path)
    } catch(err) {
      throw new Error('cannot read config file at [' + this._path + ']')
    }

    var config
    try {
      config = jsonlint.parse(configString)
    } catch(parseError) {
      throw new Error('Failed to parse JSON file at [' + this._path + ']: ' + parseError.message)
    }
    this._config = config
  }
}

module.exports = Config
