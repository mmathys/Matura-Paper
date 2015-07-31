module.exports.visible = false;

module.exports.updateVisibility = function(values) {
  for(var i = 0; i<values.length; i++){
    var points = d3.selectAll(".data-point[data-row='"+values[i].rowId+"']");

    if(module.exports.visible && values[i].activated) {
      points.classed("hidden", false);
    } else {
      points.classed("hidden", true);
    }
  }
}
