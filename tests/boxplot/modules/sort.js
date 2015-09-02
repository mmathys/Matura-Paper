/**
 * Modul: Sort
 * -----------
 * Sortiert Datensatz nach der Index-Spalte
 */

/**
 * Array sortieren, aufsteigend
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 * @return {[Array]} Sortierter Datensatz
 */
module.exports = function(data, accessor) {
  data.sort(function(a, b) {
    if (accessor(a) < accessor(b)) {
      return -1;
    }
    if (accessor(a) > accessor(b)) {
      return 1;
    }
    return 0;
  });

  return data;
}
