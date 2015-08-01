module.exports.get = function(config) {
  return config.row + "#" + config.url;
}

module.exports.invert = function(id) {
  return id.split("#")[0];
}

module.exports.raw = function(attr, url) {
  return attr+"#"+url;
}
