// Bestimmen des Zeitformats der Daten (z. B. 2012-02-27)
var format = d3.time.format('%Y-%m-%d');

// (Lineare) Skalierung der Achsen mit d3 bestimmen
var xScale = d3.time.scale();
var yScale = d3.scale.linear();

// Höhe und Breite des gesamten SVG-Elements definieren
var w = 850;
var h = 400;

// Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
// gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
// verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
xScale.range([0,w-50]);
yScale.range([h-50, 0]);

// Die Achsen werden von d3 generiert.
var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

// Laden des Datensatzes, wird in 'data' als Array von d3 kopiert.
d3.csv('data.csv', function(err, data) {

  // Schleife, um die Einträge zu formatieren
  for(var i = 0; i<data.length; i++) {
    // Anwenden des Zeitformats: Konvertieren des Strings in ein Javascript-
    // Datum.
    data[i].Date = format.parse(data[i].Date);

    // Konvertieren des String in eine Javascript-Zahl
    data[i].Open = parseFloat(data[i].Open);
    data[i].Close = parseFloat(data[i].Close);

    // Berechnen des "Durchschnittspreises" für einen Tag
    data[i].Mean = (data[i].Open + data[i].Close) / 2;
  }

  // Wertebereich der Daten bestimmen mit d3: Um einen kleinen Abstand zwischen
  // den maximalen Punkten und dem Ende des Rändern des Diagrammes zu bewahren,
  // wird der Unterschied (Δ) des Minimums und dem untersuchten Wert mit 1.1
  // mulitpliziert. Anschliessend wird die Summe des Minimums und des
  // multiplizierten Wertes an d3 zurückgegeben.
  var xWertebereich = [];
  xWertebereich[0] = d3.min(data, function(d) {
    return d.Date;
  });
  xWertebereich[1] = d3.max(data, function(d) {
    var ΔDate = d.Date.getTime() - xWertebereich[0].getTime();
    ΔDate*=1.1;
    return new Date(ΔDate+xWertebereich[0].getTime());
  });

  var yWertebereich = [];
  yWertebereich[0] = d3.min(data, function(d) {
    return d.Mean;
  });
  yWertebereich[1] = d3.max(data, function(d) {
    var ΔMean = d.Mean-yWertebereich[0];
    return yWertebereich[0]+ΔMean*1.1;
  });

  xScale.domain(xWertebereich);
  yScale.domain(yWertebereich);

  // SVG-Element mit id 'visualization' extrahieren
  var v = d3.select("#visualization")
    .attr("width", w)
    .attr("height", h);

  var graph = v.append("g")
    .attr("transform", "translate(50,0)")
    .selectAll("circle")
    // Die Daten zum Element mit der d3-Binding-Method binden: Die nach dem
    // enter() stehenden Befehle werden für alle Elemente in dem Array
    // ausgeführt.
    .data(data).enter()
    .append("circle")
      .attr("r", 1)
      .attr("cx", function(d){return xScale(d.Date)})
      .attr("cy", function(d){return yScale(d.Mean)});

  // Achsen hinzufügen
  v.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", "translate(50,"+(h-50)+")")
    .call(xAxis);

  v.append("g")
    .attr("class", "axis axis-y")
    .attr("transform", "translate(50,0)")
    .call(yAxis);
});
