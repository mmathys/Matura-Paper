var range = require('./range')

/**
 * Modul: Domain
 * -------------
 * Gibt einen überhöhten Wertbereich zurück für X und Y.
 * Überhöhte Wertebereiche werden hier benutzt, damit ein wenig Platz links und
 * oberhalb der Linie entsteht.
 */

/**
 * Gibt überhöhten Wertebereich für X zurück.
 * @param  {[Array]} data             Gemergter Datensatz, ungefiltert
 * @param  {[Object]} index           Config-Objekt für die Index-Spalte
 * @param  {[Number]} overflowFactor  Überhöhungsfaktor
 * @return {[Array]}                  Das Minimum und Maximum in einem Array.
 */
module.exports.overflowX = function (data, index, overflowFactor) {
  var xWertebereich = []
  xWertebereich[0] = range.min(data, index.accessor)
  xWertebereich[1] = range.max(data, index.accessor)
  xWertebereich[1] = range.applyOverflow(xWertebereich[0], xWertebereich[1],
    overflowFactor, index.data_type)
  return xWertebereich
}
/**
 * Gibt überhöhten Wertebereich für Y zurück.
 * @param  {[Array]} data             Gemergter Datensatz, ungefiltert
 * @param  {[Array]} values           Array von Config-Objekten der Wertespalten
 * @param  {[Object]} v_bundle        Accessor-Bundle
 * @param  {[Number]} overflowFactor  Überhöhungsfaktor
 * @return {[Array]}                  Das Minimum und Maximum in einem Array.
 */
module.exports.overflowY = function (data, values, v_bundle, overflowFactor) {
  var yWertebereich = []
  yWertebereich[0] = range.minMultipleSets(data, values, v_bundle)
  yWertebereich[1] = range.maxMultipleSets(data, values, v_bundle)
  yWertebereich[1] = range.applyOverflow(yWertebereich[0], yWertebereich[1],
    overflowFactor, values[0].data_type)
  return yWertebereich
}
