var sort = require('./sort')
var id = require('./id')

/**
 * Modul: Format
 * -------------
 * Formatiert den Datensatz
 */

/**
 * Konvertiert die Zeichenketten (Strings) im Datensatz in Javascript-
 * Objekte, wie zum Beispiel Zahlen (Float) oder Daten (Date).
 * @param  {[Array]} data   Unformatierter Datensatz
 * @param  {{Array}} config Array von Config-Objekten
 * @return {[Array]}        Gefilterter Datensatz
 */
module.exports.data_types = function (data, config) {
  // index suchen
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < config.length; j++) {
      if (config[j].data_type === 'Number') {
        data[i][config[j].row] = parseFloat(data[i][config[j].row])
      } else if (config[j].data_type === 'Date') {
        data[i][config[j].row] =  d3.time.format(config[j].date_format)
                                    .parse(data[i][config[j].row])
      }
    }
  }
  return data
}

/**
 * Fügt das Attribut 'rowId' für jedes Objekt hinzu. 'rowId' ist eine aus dem
 * Reihennamen und dem Pfad des Datensatzes generierte einzigartige ID.
 * @param  {[Array]} data   Datensatz ohne rowIds
 * @param  {{Array}} config Array von Config-Objekten
 * @return {[Array]}        Datensatz mit rowIds
 */
module.exports.ids = function (data, config) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < config.length; j++) {
      if (config[j].type === 'index') {
        continue
      }
      data[i][id.get(config[j])] = data[i][config[j].row]
      delete data[i][config[j].row]
    }
  }

  return data
}
