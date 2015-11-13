/**
 * Modul: Sort
 * -----------
 * Sortiert einen Datensatz nach der Index-Spalte
 */

/**
 * Array sortieren, aufsteigend
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 * @return {[Array]} Sortierter Datensatz
 */
module.exports = function (data, index) {
  data.sort(function (a, b) {
    if (index.accessor(a) < index.accessor(b)) {
      return -1
    }
    if (index.accessor(a) > index.accessor(b)) {
      return 1
    }
    return 0
  })

  return data
}
