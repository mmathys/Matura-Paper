/**
 * Modul: Boxplot
 * ---------
 * Helfer-Funktionen für den Boxplot
 */

/**
 * Gibt das empirische Quantil eines sortierten Datensatzes zurück.
 * @param  {[Array]} data         Der Datensatz
 * @param  {[Function]} v_bundle  Das Accessor-Bundle für die Datensatz-Elemente
 * @param  {[Number]} p           Der Anteil des Datensatzes
 * @return {[Number]}             Das empirische Quantil
 */
function empiricalQuantile(data, values, v_bundle, p) {
  var n = data.length
  console.log(p)

  // Modulo (Division mit Rest) verwenden, um zu bestimmen, ob n*p eine Ganz-
  // zahl ist.
  if((n*p) % 1 === 0) {
    return 0.5 * (v_bundle.raw(values[0])(data[n*p-1]) + v_bundle.raw(values[0])(data[n*p]))
  } else {
    return v_bundle.raw(values[0])(data[Math.round(n*p)])
  }
}

/**
 * Gibt das erste Quartil zurück
 * @param  {[Array]} data         Der Datensatz
 * @param  {[Function]} v_bundle  Das Accessor-Bundle für die Datensatz-Elemente
 * @return {[Number]}             Erstes Quartil
 */
module.exports.q1 = function(data, values, v_bundle) {
  return empiricalQuantile(data, values, v_bundle, .25)
}

/**
 * Gibt die Median zurück
 * @param  {[Array]} data         Der Datensatz
 * @param  {[Function]} v_bundle  Das Accessor-Bundle für die Datensatz-Elemente
 * @return {[Number]}             Median
 */
module.exports.median = function(data, values, v_bundle) {
  return empiricalQuantile(data, values, v_bundle, .5)
}

/**
 * Gibt das dritte Quartil zurück
 * @param  {[Array]} data         Der Datensatz
 * @param  {[Function]} v_bundle  Das Accessor-Bundle für die Datensatz-Elemente
 * @return {[Number]}             Drittes Quartil
 */
module.exports.q3 = function(data, values, v_bundle) {
  return empiricalQuantile(data, values, v_bundle, .75)
}
