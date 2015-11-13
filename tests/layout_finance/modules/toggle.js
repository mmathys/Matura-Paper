var line = require('./line')
var id = require('./id')
var points = require('./points')
var domain = require('./domain')

/**
 * Modul: Toggle
 * -------------
 * Steuerung der Sichtbarkeit von einzelnen Datenspalten
 */

/**
 * Toggle-Button hinzufügen
 * @param  {[Array]} data           Datensatz
 * @param  {[Object]} index         Index-Config-Objekt
 * @param  {[Array]} values         Config-Objekte der Wertespalten
 * @param  {[Object]} config        Config-Objekt der zu untersuchenden Spalte
 * @param  {[Object]} v_bundle      Accessors
 * @param  {[Object]} zoom          D3-Zoomobjekt
 * @param  {[Object]} yWertebereich D3-Wertebereich
 * @param  {[Object]} yScale        D3-Skalierung
 * @param  {[Object]} yAxis         D3-Achse
 * @param  {[Function]} draw        Funktion, die aufgerufen wird, wenn der
 *                                  Graph neu gezeichnet werden soll
 */
module.exports.add = function (data, index, values, config, v_bundle, zoom, yWertebereich, yScale, yAxis, draw) {
  // Der Container für die Toggles hat die id select-row
  d3.select('#select-row')
   .append('p')
   .attr('class', 'select-row-item')
   .classed('inactive', !config.activated)
   // Spaltenspezifische Farbe hinzufügen
   .attr('data-row', config.rowId)
   // Falls der Name der Spalte in meta.json gesetzt ist, füge ihn ein.
   .text(config.name ? config.name : config.row)

  // Detail hinzufügen
  if (config.activated){
    addTooltipDetail(index, config)
  }

  line.setActivated(config.activated, config)
  if (config.activated) {
    points.updateVisibility(values)
  }

  // Wenn die Toggle-Fläche angeklickt wird, aktualisiere die Sichtbarkeit
  // der Linie.
  $('.select-row-item[data-row="' + config.rowId + '"]').on('click', function () {
    var row = $(this).attr('data-row')
    var config = id.invert(row, values)

    if ($(this).hasClass('inactive')) {
      // Linie wird aktiviert.
      $(this).toggleClass('inactive', false)
      line.setActivated(true, config)
      points.updateVisibility(values)
      addTooltipDetail(index, config)
    } else {
      // Linie wird deaktiviert.
      $(this).toggleClass('inactive', true)
      line.setActivated(false, config)
      removeTooltipDetail(config)
    }

    // Aktualisiere die y-Achse und Skalierung.
    module.exports.updateYDomain(data, values, v_bundle, zoom, yWertebereich, yScale, yAxis, function () {
      draw()
    })
  })
}

/**
 * Funktion, um den Wertebereich und die Skalierung bei einem Toggle zu
 * aktualisieren
 * @param  {[Array]} data           Datensatz
 * @param  {[Array]} values         Config-Objekte der Wertespalten
 * @param  {[Object]} v_bundle      Accessors
 * @param  {[Object]} zoom          D3-Zoomobjekt
 * @param  {[Object]} yWertebereich D3-Wertebereich
 * @param  {[Object]} yScale        D3-Skalierung
 * @param  {[Object]} yAxis         D3-Achse
 * @param  {Function} callback      Funktion, die am Schluss aufgerufen wird.
 */
module.exports.updateYDomain = function (data, values, v_bundle, zoom, yWertebereich, yScale, yAxis, callback) {
  // Zoom zurücksetzen
  zoom.scale(1)
  zoom.translate([0, 0])

  // y-Wertebereich und y-Skalierung aktualisieren.
  yWertebereich = domain.overflowY(data, values, v_bundle, 1.1)
  yScale.domain(yWertebereich)
  zoom.y(yScale)
  yAxis.scale(yScale)
  callback()
}

/**
 * Tooltip-Werteanzeige hinzufügen
 * @param {[Object]} index  Index-Config-Objekt
 * @param {[Object]} config Config-Objekt der Spalte
 */
function addTooltipDetail(index, config) {
  var container = d3.select('#display-overlay')
    .append('div')
    .attr('class', 'tip-element')
    .attr('style', 'border-color:' + config.color)
    .attr('data-row', config.rowId)

  container.append('p')
    .attr('class', 'tip-title caps')
    .text(config.name ? config.name : config.row)

  container.append('p')
    .attr('class', 'tip-attribute')
    .attr('data-attribute', index.name ? index.name : index.row)
    .text((index.name ? index.name : index.row) + ': ')
    .append('span')

  container.append('p')
    .attr('class', 'tip-attribute')
    .attr('data-attribute', config.name ? config.name : config.row)
    .text('Wert: ')
    .append('span')
}

/**
 * Tooltip-Werteanzeige entfernen
 * @param  {[Object]} config Config-Objekt der Spalte
 */
function removeTooltipDetail (config) {
  d3.select('.tip-element[data-row="' + config.rowId + '"]')
    .remove()
}
