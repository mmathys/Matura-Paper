// Importieren des CSV-Datensatzes
var data = [];

// Bestimmen des Zeitformats der Daten (z. B. 2012-02-27)
var format = d3.time.format('%Y-%m-%d');

d3.csv('data.csv', function(res) {
  data = res;

  for(var i = 0; i<data.length; i++) {
    // Alle Leerschläge durch _ ersetzen bei 'Volume (BTC)',
    // 'Volume (Currency)', 'Weighted Price'

    // Anwenden des Zeitformats: Konvertieren der Datenzeichenfolge in ein Javascript-
    // Datum.
    data[i].Date = format.parse(data[i].Date);
  }

  // (Lineare) Skalierung und Domäne mit d3 bestimmen
  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();

  var xWertebereich = d3.extent(data, function(d){return d.Date});

  console.log(data);
});
