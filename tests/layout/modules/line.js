var points = require("./points");

/**
 * Modul: Line
 * -----------
 * Helfer-Funktionen für die Generierung von Linien
 */

/**
 * Modus für die Interpolation der Linie:
 * 	- "undefined" oder "linear": Lineare Interpolation
 * 	- Restliche: Modi, die von d3 unterstützt werden.
 * @type {String}
 */
module.exports.mode = "undefined";

/**
 * Fügt eine Linie für die angegebnen Datenspalte hinzu.
 * @param  {[Array]} data       Datensatz
 * @param  {[Object]} index     Index-Config-Objekt
 * @param  {[Array]} config     Array von Config-Objekten der Datenspalten
 * @param  {[Object]} v_bundle  Accessors
 */
module.exports.addLine = function(data, index, config, v_bundle) {
  var path = d3.select("#graph")
   .append("path")
   .attr("class", "line")
   .attr("style", "stroke:"+config.color)
   .attr("data-row", config.rowId);

   if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      path.attr("d", linear(data, v_bundle.cord(index, config)));
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
function linear(data, accessor) {
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

/**
 * Aktualisiert eine Linie.
 * @param  {[Array]} data       Datensatz
 * @param  {[Object]} index     Index-Config-Objekt
 * @param  {[Array]} config     Config-Objekt der Spalte
 * @param  {[Object]} v_bundle  Accessor-Funktionen
 */
module.exports.update = function(data, index, config, v_bundle) {
    if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      d3.select(".line[data-row='" + config.rowId + "']")
       .attr("d", linear(data, v_bundle.cord(index, config)));
    } else {
      var line = d3.svg.line()
        .x(index.accessor_scaled)
        .y(v_bundle.scaled(config))
        .interpolate(module.exports.mode);
      d3.select(".line[data-row='" + config.rowId + "']")
        .attr("d", line(data));
    }
}

/**
 * Ein- oder Ausblenden einer Linie.
 * @param  {[Boolean]} activated  true: Linie aktivieren;
 *                                false: Linie ausblenden
 * @param  {[Object]} config      Config-Objekt der Datenspalte
 */
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
