var points = require("./points");

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
   .attr("class", "line")
   .attr("style", "stroke:"+config.color)
   .attr("data-row", config.row);

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

module.exports.update = function(data, index, values, v_accessor_scaled, v_accessor_cord) {
  for(var i = 0; i<values.length; i++) {
    if(module.exports.mode == "linear" || module.exports.mode == "undefined"){
      d3.select(".line[data-row='" + values[i].row + "']")
       .attr("d", module.exports.linear(data, v_accessor_cord(values[i].row)));
    } else {
      var line = d3.svg.line()
        .x(index.accessor_scaled)
        .y(v_accessor_scaled(values[i]))
        .interpolate(module.exports.mode);
      d3.select(".line[data-row='" + values[i].row + "']")
        .attr("d", line(data));
    }
  }
}


module.exports.setActivated = function(activated, row, values){
  var points_s = d3.selectAll(".data-point[data-row='"+row+"']");
  var line = d3.selectAll(".line[data-row='"+row+"']");

  line.classed("hidden", !activated);

  if(!activated){
    // Nicht aktiviert: Override
    points_s.classed("hidden", !activated);
  } else {
    // Aktiviert: Zeigen, danach das Modul points entscheiden lassen.
    points_s.classed("hidden", !activated);
    points.updateVisibility();
  }


  for(var i = 0; i<values.length; i++){
    if(values[i].row == row){
      values[i].activated = activated;
    }
  }
}
