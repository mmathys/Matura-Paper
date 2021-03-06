/**
 * Html-Element select zur Auswahl des Modus: Die Variable 'mode' bei
 * Änderung aktualisieren.
 *
 * Checkbox 'Punkte anzeigen': Die Datenpunkte anzeigen / verstecken.
 */

module.exports.mode = "undefined";

/**
 * Fügt eine Linie hinzu.
 * @param  {[Object]} index  Die Config des Indexes.
 * @param  {[Object]} config Die Config der betreffenden Spalte.
 */
module.exports.addLine = function(index, config, data, accessor_cord) {
  var path = d3.select("#graph")
   .append("path")
   .attr("class", "line");

   if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      path.attr("d", module.exports.linear(data, accessor_cord));
   } else {
     var line = d3.svg.line()
       .x(accessor_scaled_x)
       .y(accessor_scaled_y)
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

module.exports.update = function(data, index, values, accessor_cord) {
  for(var i = 0; i<values.length; i++) {
    if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      d3.select(".line")
       .attr("d", module.exports.linear(data, accessor_cord));
    } else {
      var line = d3.svg.line()
        .x(index.accessor_scaled)
        .y(values[i].accessor_scaled)
        .interpolate(module.exports.mode);
      d3.select(".line")
        .attr("d", line(data));
    }
  }

}
