/**
 * Modul: Range
 * ------------
 * Wertebereich von Datenspalten bestimmen
 */

/**
 * Gibt das Minimum einer einzelnen Datenspalte zurück
 * @param  {[Array]} data         Der Datensatz
 * @param  {{Function}} accessor  Der Accessor für die zu untersuchende Datenreihe
 * @return {[Number]}             Das Minimum
 */
module.exports.min = function (data, accessor) {
  return d3.min(data, accessor)
}

/**
 * Gibt das Maximum einer einzelnen Datenspalte zurück
 * @param  {[Array]} data     Der Datensatz
 * @param  {{Function}} index Der Accessor für die zu untersuchende Datenreihe
 * @return {[Object]}         Das Maximum
 */
module.exports.max = function (data, accessor) {
  return d3.max(data, accessor)
}

/**
 * Gibt das Minimum für mehrere Datenspalten zurück.
 * @param  {[Array]} data           Der Datensatz
 * @param  {[Array]} values         Der Config-Array für die zu untersuchenden
 *                          				Datenreihen
 * @param  {{Function}} v_accessor  Die Funktion, die für eine bestimmte value-
 *                                  Reihe den Accessor zurückgibt
 * @return {[Object]}               Das Minimum
 */
module.exports.minMultipleSets = function (data, values, v_bundle) {
  var min
  for (var i = 0; i < values.length; i++) {
    if (!values[i].activated) {
      continue
    }
    var lmin = d3.min(data, v_bundle.raw(values[i]))
    if (typeof lmin === 'undefined') {
      continue
    }
    if (typeof min === 'undefined' || lmin < min) {
      min = lmin
    }
  }
  return min
}

/**
 * Gibt das Maximum für mehrere Datenspalten zurück.
 * @param  {[Array]} data           Der Datensatz
 * @param  {[Array]} values         Der Config-Array für die zu untersuchenden
 *                                  Datenreihen.
 * @param  {{Function}} v_accessor  Die Funktion, die für eine bestimmte value-
 *                                  Reihe den Accessor zurückgibt.
 * @return {[Object]}               Das Maximum
 */
module.exports.maxMultipleSets = function (data, values, v_bundle) {
  var max
  for (var i = 0; i < values.length; i++) {
    if (!values[i].activated) {
      continue
    }
    var lmax = d3.max(data, v_bundle.raw(values[i]))

    if (typeof max === 'undefined' || lmax > max) {
      max = lmax
    }
  }
  return max
}

//  Wertebereich, der Daten bestimmen mit d3: Um einen kleinen Abstand zwischen
//  den maximalen Punkten und den Rändern des Diagrammes zu bewahren,
//  wird der Unterschied (Δ) des Minimums und dem untersuchten Wert mit 1.1
//  mulitpliziert. Anschliessend wird die Summe des Minimums und des
//  multiplizierten Wertes an d3 zurückgegeben.

/**
 * Gibt die Summe des Minimums und des mit dem Faktor factor multiplizierten
 * Unterschieds von min und max zurück.
 * Wird verwendet, damit oben und rechts von Graphen Platz ausgelassen wird.
 * @param  {[Number]} min       Minimum ohne Overflow
 * @param  {[Number]} max       Maximum ohne Overflow
 * @param  {[Number]} factor    Overflow-Faktor
 * @param  {{String}} data_type Der Datentyp von min und max
 * @return {[Number]}           Das Maximum mit Overflow.
 */
module.exports.applyOverflow = function (min, max, factor, data_type) {
  if (data_type === 'Date') {
    return new Date(min.getTime() + (max.getTime() - min.getTime()) * factor)
  } else if (data_type === 'Number') {
    return min + (max - min) * factor
  }
}
