module.exports.visibility = function(visible) {
  var points = d3.selectAll(".data-point");
  points.classed("hidden", !visible);
}
