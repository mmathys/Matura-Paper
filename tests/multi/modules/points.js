module.exports.visible = false;

module.exports.updateVisibility = function() {
  console.log("set to " + (module.exports.visible ? "visible" : "invisible"));
  var points = d3.selectAll(".data-point");
  points.classed("hidden", !module.exports.visible);
}
