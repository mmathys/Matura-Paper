// Bestimmen des Zeitformats der Daten (z. B. 2012-02-27)
var format = d3.time.format('%Y-%m-%d');

// (Lineare) Skalierung der Achsen mit d3 bestimmen
var xScale = d3.time.scale();
var yScale = d3.scale.linear();

// Höhe und Breite des gesamten SVG-Elements definieren; Verschiebung des
// Graphs
var w = 850;
var h = 400;
var graphTransform = {xtop: 50, ytop: 0, xbottom:0, ybottom:50};

// Global Zoomvariablen
var transform = {x:0,y:0};
var scale = 1;

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

  // Zoom hinzufügen, das durch d3 unterstützt wird
  var zoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([1, 60])
    .on("zoom", zoomed);

  // die variable graph initialiseren, damit sie in der Funktion zoomed() ver-
  // wendet werden kann, obwohl sie erst später definiert wird.
  var graph = null;

  // Mit der Funktion 'zoomed' werden die x-Achse und die y-Achse aktualisiert
  function zoomed() {
    // Achsen neu zeichnen
    xAxisContainer.call(xAxis);
    yAxisContainer.call(yAxis);

    // Den Graphen entsprechend anpassen:

    // Methode 2: Zoomvariablen setzen und die Position die Punkte transformieren
    transform.x = d3.event.translate[0];
    transform.y = d3.event.translate[1];
    scale = d3.event.scale;

    // Punkte berechnen.
    v.selectAll("circle")
      .attr("transform", "translate("+transform.x+","+transform.y+")");
  }

  // SVG-Element mit id 'visualization' extrahieren
  var v = d3.select("#visualization")
    .attr("width", w)
    .attr("height", h)

  // Unterstützung für Zoom hinzufügen (d3)
    .call(zoom);

  // SVG-Maske für den Graph: Wir wollen nicht, dass Punkte aus unserem
  // definierten Feld auftauchen.
  v.append("mask")
    .attr("id", "mask")
    .append("rect")
      .attr("x", graphTransform.xtop)
      .attr("y", graphTransform.ytop)
      .attr("width", (w-graphTransform.xtop-graphTransform.xbottom))
      .attr("height", (h-graphTransform.ytop-graphTransform.ybottom))
      .attr("fill", "white");

  graph = v.append("g")
    .attr("transform", "translate("+graphTransform.x+","+graphTransform.y+")")
    .attr("mask", "url(#mask)")
    .selectAll("circle")
    // Die Daten zum Element mit der d3-Binding-Method binden: Die nach dem
    // enter() stehenden Befehle werden für alle Elemente in dem Array
    // ausgeführt.
    .data(data).enter()
    .append("circle")
      .attr("r", 1)
      .attr("cx", function(d) {
        var location = xScale(d.Date);
        return location;
      })
      .attr("cy", function(d) {
        var location = yScale(d.Mean);
        return location;
      });

  // Achsen hinzufügen
  var xAxisContainer = v.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", "translate(50,"+(h-50)+")")
    .call(xAxis);

  var yAxisContainer = v.append("g")
    .attr("class", "axis axis-y")
    .attr("transform", "translate(50,0)")
    .call(yAxis);

});
