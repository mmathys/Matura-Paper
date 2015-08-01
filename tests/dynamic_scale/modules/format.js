var sort = require('./sort');
var id = require('./id');

module.exports.data_types = function(data, config) {
  // index suchen
  for(var i = 0; i<data.length; i++) {
    for(var j = 0; j<config.length; j++) {
      if(config[j].data_type == "Number") {
        data[i][config[j].row] = parseFloat(data[i][config[j].row]);
      } else if(config[j].data_type == "Date") {
        data[i][config[j].row] =  d3.time.format(config[j].date_format)
                                    .parse(data[i][config[j].row]);
      }
    }
  }
  return data;
}

module.exports.ids = function(data, config) {
  console.log(data);
  console.log(config);

  for(var i = 0; i<data.length; i++) {
    for(var j = 0; j<config.length; j++){
      if(config[j].type == "index"){
        continue;
      }
      data[i][id.get(config[j])] = data[i][config[j].row];
      delete data[i][config[j].row];
    }
  }

  return data;
}
