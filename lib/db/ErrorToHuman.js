

ErrorToHuman = {}

ErrorToHuman.text = function(err) {
  if(err && err.code) {
    if(ErrorToHuman.CODES[err.code]) {
      return ErrorToHuman.CODES[err.code]
    }
  }
  return err
}


ErrorToHuman.CODES = {
  11000: 'The object already exists. Delete the existing one first'
}

module.exports = ErrorToHuman
