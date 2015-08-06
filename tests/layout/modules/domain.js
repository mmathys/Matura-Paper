var range = require('./range');

module.exports.overflowX = function(data, index, overflowFactor){
  var xWertebereich = [];
  xWertebereich[0] = range.min(data, index.accessor);
  xWertebereich[1] = range.max(data, index.accessor);
  xWertebereich[1] = range.applyOverflow(xWertebereich[0], xWertebereich[1],
    overflowFactor, index.data_type);
  return xWertebereich;
}

module.exports.overflowY = function(data, values, v_bundle, overflowFactor) {
  var yWertebereich = [];
  yWertebereich[0] = range.minMultipleSets(data, values, v_bundle);
  yWertebereich[1] = range.maxMultipleSets(data, values, v_bundle);
  yWertebereich[1] = range.applyOverflow(yWertebereich[0], yWertebereich[1],
    overflowFactor, values[0].data_type);
  return yWertebereich;
}
