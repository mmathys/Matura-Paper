var line = require("./line");
var id = require("./id");
var points = require("./points");
var domain = require("./domain");

module.exports.add = function(data, values, config, v_bundle, zoom, yWertebereich, yScale, yAxis, draw) {
  // Der Container für die Toggles hat die id select-row
  d3.select("#select-row")
   .append("p")
   .attr("class", "select-row-item")
   .classed("inactive", !config.activated)
   // Spaltenspezifische Farbe hinzufügen
   .attr("style", "border-color:"+config.color)
   .attr("data-row", config.rowId)
   // Falls der Name der Spalte in meta.json gesetzt ist, füge ihn ein.
   .text(config.name ? config.name : config.row);

   line.setActivated(config.activated, config);
   if(config.activated) {
     points.updateVisibility(values);
   }

   // Wenn die Toggle-Fläche angeklickt wird, aktualisiere die Sichtbarkeit
   // der Linie.
   $(".select-row-item[data-row='" + config.rowId + "']").on('click', function() {
     var row = $(this).attr("data-row");
     var config = id.invert(row, values);

     if($(this).hasClass("inactive")){
       // Linie wird aktiviert.
       $(this).toggleClass("inactive", false);
       line.setActivated(true, config);
       points.updateVisibility(values);
     } else {
       // Linie wird deaktiviert.
       $(this).toggleClass("inactive", true);
       line.setActivated(false, config);
     }

     // und aktualisiere die Y-Achse und Skalierung.
     module.exports.updateYDomain(data, values, v_bundle, zoom, yWertebereich, yScale, yAxis, function() {
       draw();
     });
   });
}

// Funktion, um den Wertebereich und Skalierung bei einem Toggle zu
// aktualisieren
module.exports.updateYDomain = function(data, values, v_bundle, zoom, yWertebereich, yScale, yAxis, callback) {
  // Zoom zurücksetzen
  zoom.scale(1);
  zoom.translate([0,0]);

  // Y-Wertebereich und Y-Skalierung aktualisieren.
  yWertebereich = domain.overflowY(data, values, v_bundle, 1.1);
  yScale.domain(yWertebereich);
  zoom.y(yScale)
  yAxis.scale(yScale);
  callback();
}
