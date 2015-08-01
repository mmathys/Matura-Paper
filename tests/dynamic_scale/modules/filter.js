module.exports.row = function(data, row) {
  var ret = [];
  for(var i = 0; i<data.length; i++){
    if(typeof data[i][row] !== "undefined"){
      ret.push(data[i]);
    }
  }
  return ret;
}
