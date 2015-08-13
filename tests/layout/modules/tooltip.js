/**
 * Modul: Tooltip
 * --------------
 * Funktionen für den Tooltip
 */

/**
 * Einstellungen für dieses Modul.
 * 	- opt.graphTransform: Die Verschiebung des Graphen, wie in script.js
 * 		definiert.
 * @type {Object}
 */
module.exports.opt = {};

/**
 * Findet den zu einem gegebenen Wert den nächsten in einem Array vorhandenem Wert.
 * @param  {[Array]} data         Datenset
 * @param  {[Function]} accessor  Funktion, das den zu vergleichenden Wert
 *                                zurückgibt, wenn das Objekt gegeben wird.
 * @param  {[type]} item          Der zu vergleichende Wert
 * @return {[Number]}             Der Index (0 < @return < data.length-1)
 */
function nextIndex(data, index, item){
  var pos = -1;
  for(var i = 0; i<data.length-1; i++){
    // Liegt der Punkt zwischen zwei gegebenen Punkten?
    var this_d = index.accessor(data[i]);
    var next = index.accessor(data[i+1]);
    var afterThis = item >=this_d;
    var beforeNext = item <= next;

    if(afterThis && beforeNext){
      // Falls ja, setze 'index' auf den index des näheren Punktes.
      Δ1 = Math.abs(index.accessor(data[i]) - item);
      Δ2 = Math.abs(index.accessor(data[i+1]) - item);
      pos = Δ1 < Δ2 ? i : i + 1;
    }
  }
  return pos;
}

/**
 * Funktion für den Tooltip-Kreis und die Werteanzeige
 * @param  {[Array]} data           Datenarray
 * @param  {{String}} rowId       Name der Reihe
 * @param  {[Function]} accessor    Funktion, die das Koordinatenpaar den Punktes
 *                                	zurückgibt.
 * @param  {[Number]} index         Index des Datenarray, die den zu "tooltippenden"
 *                                	Wert entspricht.
 * @param {{d3 View}} parent        d3-View, in das das Tooltip eingesetzt werden
 *                    							sollte.
 * @param {{Function}} textAccessor Funktion, die den Text für das Tooltip zu-
 *                                  rückgibt.
 */
module.exports.tooltip = function(data, index, config, v_bundle, pos, indexTextAccessor, valueTextAccessor, activated) {

  // tooltip-Variablen
  var tip = d3.select("#tooltip[data-row='" + config.rowId + "']");
  tip.classed("hidden", !activated);

  if(tip.empty()){
    tip = d3.select("#graph").append("g")
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .attr("data-row", config.rowId);

    tip.append("circle")
      .attr("id", "tooltip-circle");

    var label = tip.append("g")
      .attr("id", "label");
  }

  var indexText;
  var valueText;

  if(pos==-1){
    tip.attr("visibility", "hidden");
    indexText = "";
    valueText = "";
  } else {
    indexText = indexTextAccessor(data[pos]);
    valueText = valueTextAccessor(data[pos])+(config.unit?" "+config.unit:"");
    tip.attr("visibility", "visible");
    var cord = v_bundle.cord(index, config)(data[pos]);
    tip.attr("transform", "translate("+cord[0]+","+cord[1]+")");
  }

  d3.select(".tip-element[data-row='"+config.rowId+"']"
    + "> .tip-attribute[data-attribute='" + (index.name ? index.name : index.row ) + "']"
    + "> span")
    .text(indexText);

  d3.select(".tip-element[data-row='"+config.rowId+"']"
    + "> .tip-attribute[data-attribute='" + (config.name ? config.name : config.row ) + "']"
    + "> span")
    .text(valueText);
}

/**
 * Funktion, um den Ort des Tooltips neu zu berechnen (zum Beispiel wenn sich
 * die Maus bewegt oder gezoomt wird).
 * @param  {{Array}}    data        Der Datensatz zu der Visualisation
 * @param  {[d3 Scale]} xScale      Die x-Skala
 * @param  {[d3 Scale]} yScale      Die y-Skala
 * @param  {{Function}} index       Die Config für den Index
 * @param  {{Function}} values      Die Config für die Values
 */
module.exports.updateTooltip = function(data, index, config, v_bundle, xScale, yScale){
  if(!module.exports.mouse){
    return;
  }
  var x = module.exports.mouse[0]-module.exports.opt.graphTransform.xstart;

  var x_date = xScale.invert(x);

  var pos = nextIndex(data, index, x_date);

  //tooltip
  module.exports.tooltip(data, index, config, v_bundle, pos, function(d){
    d = index.accessor(d);
    if(d instanceof Date){
      var s=d.getDate().toString()+"/";
      s+=(d.getMonth()+1).toString()+"/";
      s+=d.getFullYear().toString();
      return s;
    }
    return d.toString();
  }, function(d) {
    // Zahl runden
    // http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
    var s = (Math.round(v_bundle.raw(config)(d) * 1000) / 1000).toString();
    return s;
  }, config.activated);
}
