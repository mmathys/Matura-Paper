module.exports.get = function(config) {
  return config.row + "#" + config.url;
}

// ret value config obj
module.exports.invert = function(id, values) {
  for(var i = 0; i<values.length; i++) {
    if(id == values[i].rowId) {
      return values[i];
    }
  }
}

module.exports.raw = function(attr, url) {
  return attr+"#"+url;
}
