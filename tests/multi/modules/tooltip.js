/*******************************************************************************
 *
 *
 * Tooltip
 *
 *
 ******************************************************************************/

console.log("Tooltip");

/**
 * Einstellungen für dieses Modul.
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
module.exports.nextIndex = function(data, accessor, item){
  var index = -1;
  for(var i = 0; i<data.length-1; i++){
    // Liegt der Punkt zwischen zwei gegebenen Punkten?
    var this_d = accessor(data[i]);
    var next = accessor(data[i+1]);
    var afterThis = item >=this_d;
    var beforeNext = item <= next;

    if(afterThis && beforeNext){
      // Falls ja, setze 'index' auf den index des näheren Punktes.
      Δ1 = Math.abs(accessor(data[i]) - item);
      Δ2 = Math.abs(accessor(data[i+1]) - item);
      index = Δ1 < Δ2 ? i : i + 1;
    }
  }
  return index;
}

/**
 * Funktion für den Tooltip-Kreis und die Werteanzeige
 * @param  {[Array]} data           Datenarray
 * @param  {{String}} rowName       Name der Reihe
 * @param  {[Function]} accessor    Funktion, die das Koordinatenpaar den Punktes
 *                                	zurückgibt.
 * @param  {[Number]} index         Index des Datenarray, die den zu "tooltippenden"
 *                                	Wert entspricht.
 * @param {{d3 View}} parent        d3-View, in das das Tooltip eingesetzt werden
 *                    							sollte.
 * @param {{Function}} textAccessor Funktion, die den Text für das Tooltip zu-
 *                                  rückgibt.
 */
module.exports.tooltip = function(data, rowName, accessor, index, parent, textAccessor) {

  // tooltip-Variablen
  var tip = d3.select("#tooltip[data-row='" + rowName + "']");

  if(tip.empty()){
    tip = parent.append("g")
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .attr("data-row", rowName);

    tip.append("circle")
      .attr("id", "tooltip-circle");

    var label = tip.append("g")
      .attr("id", "label");

    var text = label.append("text")
      .attr("text-anchor", "middle")
      .attr("id", "label-text");
  }

  if(index==-1){
    tip.attr("visibility", "hidden");
    return;
  }
  tip.attr("visibility", "visible");


  tip.select("#label-text")
    .text(textAccessor(data[index]))
    .attr("x", 0)
    .attr("y", -10);

  var cord = accessor(data[index]);
  tip.attr("transform", "translate("+cord[0]+","+cord[1]+")");
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
module.exports.updateTooltip = function(data, xScale, yScale, index, values, v_accessor, v_accessor_scaled, v_accessor_cord){
  var x = module.exports.mouse[0]-module.exports.opt.graphTransform.xstart;

  // Das interpolierte Datum berechnen
  var x_date = xScale.invert(x);

  for(var i = 0; i<values.length; i++) {
    // Den nächsten Index suchen.
    var tooltipIndex = module.exports.nextIndex(data, index.accessor, x_date);

    //tooltip
    module.exports.tooltip(data, values[i].row, v_accessor_cord(values[i].row), tooltipIndex, d3.select("#graph"), function(d) {
      // Zahl runden
      // http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
      return Math.round(v_accessor(values[i])(d) * 1000) / 1000;
    });
  }
}
