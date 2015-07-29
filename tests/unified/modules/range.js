/**
 * Gibt das Minimum einer einzelnen Datenreihe zurück
 * @param  {[Array]} data     Der Datensatz
 * @param  {{Function}} index Der Accessor für die zu untersuchende Datenreihe
 * @return {[Object]}         Das Minimum
 */
module.exports.min = function(data, accessor) {
  return d3.min(data, accessor);
}

/**
 * Gibt das Maximum einer einzelnen Datenreihe zurück
 * @param  {[Array]} data     Der Datensatz
 * @param  {{Function}} index Der Accessor für die zu untersuchende Datenreihe
 * @return {[Object]}         Das Maximum
 */
module.exports.max = function(data, accessor) {
  return d3.max(data, accessor);
}

/**
 * Gibt das Minimum für mehrere Datensätze zurück.
 * @param  {[Array]} data   Der Datensatz
 * @param  {[Array]} values Der Config-Array für die zu untersuchenden Datenrei-
 *                          hen.
 * @return {[Object]}       Das Minimum
 */
module.exports.minMultipleSets = function(data, values) {
  var min;
  for(var i = 0; i<values.length; i++){
    var lmin = d3.min(data, values[i].accessor);
    if(!min || lmin<min) {
      min = lmin;
    }
  }
  return min;
}

/**
 * Gibt das Maximum für mehrere Datensätze zurück.
 * @param  {[Array]} data   Der Datensatz
 * @param  {[Array]} values Der Config-Array für die zu untersuchenden Datenrei-
 *                          hen.
 * @return {[Object]}       Das Maximum
 */
module.exports.maxMultipleSets = function(data, values) {
  var max;
  for(var i = 0; i<values.length; i++){
    var lmax = d3.max(data, values[i].accessor);
    if(!max || lmax>max) {
      max = lmax;
    }
  }
  return max;
}

/**
 * Gibt die Summe der Minimums und des mit dem Faktor factor multiplizierten
 * Unterschied von min und max zurück.
 * Wird verwendet, damit oben und rechts von Graphen Platz ausgelassen wird.
 * @param  {[Number]} min       Minimum ohne Overflow
 * @param  {[Number]} max       Maximum ohne Overflow
 * @param  {[Number]} factor    Overflow-Faktor
 * @param  {{String}} data_type Der Datentyp von min und max
 * @return {[Number]}           Das Maximum mit Overflow.
 */
module.exports.applyOverflow = function(min, max, factor, data_type) {
  if(data_type == "Date") {
    return new Date(min.getTime() + (max.getTime()-min.getTime()) * factor);
  } else if(data_type == "Number") {
    return min + (max-min) * factor;
  }
}
