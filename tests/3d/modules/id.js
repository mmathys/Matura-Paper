/**
 * Modul: Id
 * ---------
 * Generiert einzigartige ID für eine Spalte.
 */

/**
 * Gibt generierte ID zurück.
 * @param  {[Object]} config Config-Objekt
 * @return {[String]}        ID
 */
module.exports.get = function (config) {
  return config.row + '#' + config.url
}

/**
 * Gibt Config-Objekt für eine Spalte zurück
 * @param  {[String]} id    ID der Spalte
 * @param  {[Array]} values Array von Config-Objekten aller Datenspalten
 * @return {[Object]}       Config-Objekt der Spalte
 */
module.exports.invert = function (id, values) {
  for (var i = 0; i < values.length; i++) {
    if (id === values[i].rowId) {
      return values[i]
    }
  }
}

/**
 * Gibt ID für benutzerdefinierte Attribute zurück.
 * @param  {[String]} attr Benutzerdefiniertes Attribut
 * @param  {[String]} url  URL des Datensatzes
 * @return {[String]}      ID
 */
module.exports.raw = function (attr, url) {
  return attr + '#' + url
}
