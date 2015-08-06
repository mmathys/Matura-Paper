var points = require("./points");

/**
 * Html-Element select zur Auswahl des Modus: Die Variable 'mode' bei
 * Änderung aktualisieren.
 *
 * Checkbox 'Punkte anzeigen': Die Datenpunkte anzeigen / verstecken.
 */

module.exports.mode = "undefined";

module.exports.addLine = function(data, index, config, v_bundle) {
  var path = d3.select("#graph")
   .append("path")
   .attr("class", "line")
   .attr("style", "stroke:"+config.color)
   .attr("data-row", config.rowId);

   if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      path.attr("d", module.exports.linear(data, v_bundle.cord(index, config)));
   } else {
     var line = d3.svg.line()
       .x(index.accessor_scaled)
       .y(v_bundle.scaled(config))
       .interpolate(module.exports.mode);
   }
}

/**
 * Gibt die Lineare Interpolation als SVG-Path-String zurück
 * @param  {[Array]} data        Das Datenarray
 * @param  {{Function}} accessor Die Funktion, welche die Koordinaten zurück-
 *                               gibt des entsprechenden Punktes
 * @return {[String]}            String, das in das Attribut 'd' im path-
 *                               Element eingesetzt werden muss.
 */
module.exports.linear = function(data, accessor) {
  var path = "";

  //figure out
  var temp = "Weighted Price";

  for(var i = 0; i < data.length; i++) {
    var coordinates = accessor(data[i], temp);

    if(i !== 0){
      // L-Befehl für eine Linie
      path += "L" + coordinates[0] + "," + coordinates[1];
    } else {
      // Erster Punkt: M-Befehl für Anfangspunkt.
      path += "M" + coordinates[0] + "," + coordinates[1];
    }

    if(i !== data.length - 1) {
      path += " ";
    }
  }
  return path;
}

module.exports.update = function(data, index, config, v_bundle) {
    if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      d3.select(".line[data-row='" + config.rowId + "']")
       .attr("d", module.exports.linear(data, v_bundle.cord(index, config)));
    } else {
      var line = d3.svg.line()
        .x(index.accessor_scaled)
        .y(v_bundle.scaled(config))
        .interpolate(module.exports.mode);
      d3.select(".line[data-row='" + config.rowId + "']")
        .attr("d", line(data));
    }
}


module.exports.setActivated = function(activated, config){
  var points_s = d3.selectAll(".data-point[data-row='"+config.rowId+"']");
  var line = d3.selectAll(".line[data-row='"+config.rowId+"']");

  line.classed("hidden", !activated);

  config.activated = activated;

  if(!activated){
    // Nicht aktiviert: Override
    points_s.classed("hidden", !activated);
  } else {
    // Aktiviert: Zeigen, danach das Modul points entscheiden lassen.
    points_s.classed("hidden", !activated);
  }

}
