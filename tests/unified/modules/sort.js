/**
 * Array sortieren
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 * @return {[type]} [description]
 */
module.exports = function(data) {
  data.sort(function(a, b) {
    if (a.Date<b.Date) {
      return -1;
    }
    if (a.Date>b.Date) {
      return 1;
    }
    return 0;
  });

  return data;
}
