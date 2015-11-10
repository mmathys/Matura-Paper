/**
 * Modul: filter
 * -------------
 * Filtert den gemergten Datensatz. Gibt die Zeilen zurück, bei denen die Spalte
 * 'row' gesetzt ist.
 */

/**
 * Gibt den gefilterten Datensatz zurück.
 * @param  {[Array]} data Ungefilterter, gemergter Datensatz.
 * @param  {[String]} row Name der Spalte, nach der gefiltert werden soll
 * @return {[Array]}      Gefilterter, gemergter Datensatz.
 */

module.exports.row = function (data, row) {
  var ret = []
  for (var i = 0; i < data.length; i++) {
    if (typeof data[i][row] !== 'undefined') {
      ret.push(data[i])
    }
  }
  return ret
}
