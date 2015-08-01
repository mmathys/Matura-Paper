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
 * @param  {[Array]} data           Der Datensatz
 * @param  {[Array]} values         Der Config-Array für die zu untersuchenden
 *                          				Datenreihen.
 * @param  {{Function}} v_accessor  Die Funktion, die für eine bestimmte value-
 *                                  Reihe den Accessor zurückgibt.
 * @return {[Object]}               Das Minimum
 */
module.exports.minMultipleSets = function(data, values, v_accessor) {
  var min;
  for(var i = 0; i<values.length; i++){
    if(!values[i].activated) {
      continue;
    }
    var lmin = d3.min(data, v_accessor(values[i]));
    if(typeof lmin == "undefined"){
      continue;
    }
    if(typeof min == "undefined" || lmin<min) {
      min = lmin;
    }
  }
  console.log("range min: ");
  console.log(min);
  return min;
}

/**
 * Gibt das Maximum für mehrere Datensätze zurück.
 * @param  {[Array]} data           Der Datensatz
 * @param  {[Array]} values         Der Config-Array für die zu untersuchenden Datenrei-
 *                                  hen.
 * @param  {{Function}} v_accessor  Die Funktion, die für eine bestimmte value-
 *                                   Reihe den Accessor zurückgibt.
 * @return {[Object]}               Das Maximum
 */
module.exports.maxMultipleSets = function(data, values, v_accessor) {
  var max;
  for(var i = 0; i<values.length; i++){
    if(!values[i].activated) {
      continue;
    }
    var lmax = d3.max(data, v_accessor(values[i]));

    if(typeof max == "undefined" || lmax>max) {
      max = lmax;
    }
  }
  console.log("range max:");
  console.log(max);
  return max;
}

//  Wertebereich der Daten bestimmen mit d3: Um einen kleinen Abstand zwischen
//  den maximalen Punkten und dem Ende des Rändern des Diagrammes zu bewahren,
//  wird der Unterschied (Δ) des Minimums und dem untersuchten Wert mit 1.1
//  mulitpliziert. Anschliessend wird die Summe des Minimums und des
//  multiplizierten Wertes an d3 zurückgegeben.

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