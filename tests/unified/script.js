var _  = require('lodash');
var tooltip = require('./modules/tooltip');
var line = require('./modules/line');
var sort = require('./modules/sort');

/*******************************************************************************
 *
 *
 * Initialisierung Visualisation
 *
 *
 ******************************************************************************/

/**
 * Laden der Konfigurationsdatei
 * @param  {[String]} "meta.json"             Der Dateiname für die
 *                                            Konfigurationsdatei
 * @param  {[Function]} function(err, config) Das Callback
 */
d3.json("meta.json", function(err, config) {
  if(err) {
    console.log(err);
    alert(err);
    return;
  }

  console.log(config);

  //TODO: 1. Variablen global machen, die für den nächsten Teil benötigt werden
  //      2. load() unkommentieren
  //      3. Die config auch wirklich anwenden

  // Bestimmen des Zeitformats der Daten (z. B. 2012-02-27)
  var format = d3.time.format('%Y-%m-%d');

  // (Lineare) Skalierung der Achsen mit d3 bestimmen
  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();

  // Höhe und Breite des gesamten SVG-Elements definieren; Verschiebung des
  // Graphs
  var w = 1000;
  var h = 600;

  var graphTransform = {xstart: 50, ytop: 0, xend:0, ybottom:50};

  // Das Tooltip über die Transformation benachrichtigen
  tooltip.opt.graphTransform = graphTransform;

  var mouse = [];

  // Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
  // gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
  // verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
  xScale.range([0,w - graphTransform.xstart - graphTransform.xend]);
  yScale.range([h - graphTransform.ytop - graphTransform.ybottom, 0]);

  // Die Achsen werden von d3 generiert.
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
  var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

  /*******************************************************************************
   *
   *
   * Accessors für die Daten
   *
   *
   ******************************************************************************/

   var accessor_x = function(d) {
     return d.Date;
   };

   var accessor_y = function(d) {
     return d.Mean;
   };

   var accessor_scaled_x = function(d) {
     return xScale(d.Date);
   };

   var accessor_scaled_y = function(d) {
     return yScale(d.Mean);
   };

   var accessor_cord = function(d) {
     return [xScale(d.Date), yScale(d.Mean)];
   };

   //TODO: load() aufrufen wenn alle Globalen Variablen definiert sind
});


/*******************************************************************************
 *
 *
 * Laden der Daten
 *
 *
 ******************************************************************************/

function load() {

  /**
   * Laden des Datensatzes durch d3, wird in den Array data geladen.
   * @param  {[String]} 'data.csv'            Pfad der csv-Datei
   * @param  {[Function]} function(err, data) callback-Funktion, mit Fehlerelement und
   *                                			 		Datenarray
   */
  d3.csv('data.csv', function(err, data) {

    /**
     *
     * Formatieren des Datensatzes
     *
     */

    // Sortieren, denn wir brauchen dies für unseren Tooltip-Algorithmus
    data = sort(data);

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

    /**
     *
     * d3-Achsen initalisieren
     *
     */

    /**
     *  Wertebereich der Daten bestimmen mit d3: Um einen kleinen Abstand zwischen
     *  den maximalen Punkten und dem Ende des Rändern des Diagrammes zu bewahren,
     *  wird der Unterschied (Δ) des Minimums und dem untersuchten Wert mit 1.1
     *  mulitpliziert. Anschliessend wird die Summe des Minimums und des
     *  multiplizierten Wertes an d3 zurückgegeben.
     */
    var xWertebereich = [];
    xWertebereich[0] = d3.min(data, accessor_x);
    xWertebereich[1] = d3.max(data, function(d) {
      var ΔDate = d.Date.getTime() - xWertebereich[0].getTime();
      ΔDate *= 1.1;
      return new Date(ΔDate + xWertebereich[0].getTime());
    });

    var yWertebereich = [];
    yWertebereich[0] = d3.min(data, accessor_y);
    yWertebereich[1] = d3.max(data, function(d) {
      var ΔMean = d.Mean - yWertebereich[0];
      return yWertebereich[0] + ΔMean * 1.1;
    });

    xScale.domain(xWertebereich);
    yScale.domain(yWertebereich);

    /**
     *
     * Zoom
     *
     */

    // Zoom hinzufügen, das durch d3 unterstützt wird
    var zoom = d3.behavior.zoom()
      .x(xScale)
      .y(yScale)
      .scaleExtent([1, 50])
      .on("zoom", zoomed);

    // die variable graph initialiseren, damit sie in der Funktion zoomed() ver-
    // wendet werden kann, obwohl sie erst später definiert wird.
    var graph = null;

    // Mit der Funktion 'zoomed' werden die x-Achse und die y-Achse aktualisiert
    function zoomed() {
      // Achsen neu zeichnen
      xAxisContainer.call(xAxis);
      yAxisContainer.call(yAxis);

      // Punkte neu berechnen.
      v.selectAll("circle.data-point")
        .attr("cx", accessor_scaled_x)
        .attr("cy", accessor_scaled_y);

      // Tooltip bei Zoom auch aktualisieren
      tooltip.updateTooltip(data, xScale, yScale);

      // Linie bei Zoom aktualisieren
      updateLines();
    }

    /**
     *
     * (Datengebundene) Elemente einfügen
     *
     */

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
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w - graphTransform.xstart - graphTransform.xend)
        .attr("height", h - graphTransform.ytop - graphTransform.ybottom)
        .attr("fill", "white");

    graph = v.append("g")
      .attr("id", "graph")
      .attr("transform", "translate(" + graphTransform.xstart +
        "," + graphTransform.ytop + ")")
      .attr("mask", "url(#mask)")
      .selectAll("circle")

      // Die Daten zum Element mit der d3-Binding-Method binden: Die nach dem
      // enter() stehenden Befehle werden für alle Elemente in dem Array
      // ausgeführt.
      .data(data).enter()
      .append("circle")
        .attr("class", "data-point")
        //.attr("data-x-identifier", function(d) { return d.Date; })
        .attr("cx", accessor_scaled_x)
        .attr("cy", accessor_scaled_y);

    /**
     *
     * d3-Achsen einfügen
     *
     */

    // Achsen hinzufügen
    var xAxisContainer = v.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(" +
        graphTransform.xstart + "," +
        (h - graphTransform.ybottom) + ")")
      .call(xAxis);

    var yAxisContainer = v.append("g")
      .attr("class", "axis axis-y")
      .attr("transform", "translate(50,0)")
      .call(yAxis);

    /**
     *
     * Tooltip (nicht direkt von d3 unterstützt)
     *
     */

    // Maus-Koordinaten: Um auf die Maus-Koordinaten zugreifen zu können, muss man
    // ein unsichtbares Element über den gesamten Graph legen, der alle
    // 'Maus-Events' "aufnimmt". Ein leerer g-SVG-Container (wie 'graph') ist
    // nicht fähig, Maus-Events aufzunehmen.
    v.append("rect")
      .attr("id", "overlay")
      .attr("x", graphTransform.xstart)
      .attr("y", graphTransform.ytop)
      .attr("width", w - graphTransform.xstart - graphTransform.xend)
      .attr("height", h - graphTransform.ytop - graphTransform.ybottom)
      .on("mousemove", function() {
        tooltip.mouse = d3.mouse(this);
        tooltip.updateTooltip(data, xScale, yScale);
      });

    /**
     *
     * Linien (nicht direkt von d3 unterstützt)
     *
     */

     var mode = "undefined";

     function updateLines() {
       if(mode == "linear" || mode == "undefined"){
         d3.select(".line")
          .attr("d", linear(data, accessor_cord));
       } else {
         var line = d3.svg.line()
           .x(accessor_scaled_x)
           .y(accessor_scaled_y)
           .interpolate(mode);
         d3.select(".line")
          .attr("d", line(data));
       }
     }

     // Lineare Interpolation
     /**
      * Gibt die Lineare Interpolation als SVG-Path-String zurück
      * @param  {[Array]} data        Das Datenarray
      * @param  {{Function}} accessor Die Funktion, welche die Koordinaten zurück-
      *                               gibt des entsprechenden Punktes
      * @return {[String]}            String, das in das Attribut 'd' im path-
      *                               Element eingesetzt werden muss.
      */
     function linear(data, accessor) {
       var path = "";

       for(var i = 0; i < data.length; i++) {
         var coordinates = accessor(data[i]);

         if(i !== 0){
           // L-Befehl für eine Linie
           path += "L" + coordinates[0] + "," + coordinates[1];
         } else {
           // Erster Punkt: M-Befehl für Anfangspunkt.
           path += "M" + coordinates[0] + "," + coordinates[1];
         }

         if(i !== data.length - 1) {
           path += " ";
         }
       }
       return path;
     }

     var path = d3.select("#graph")
      .append("path")
      .attr("class", "line");

     if(mode == "linear" || mode == "undefined"){
        path.attr("d", linear(data, accessor_cord));
     } else {
       var line = d3.svg.line()
         .x(accessor_scaled_x)
         .y(accessor_scaled_y)
         .interpolate(mode);
       path.attr("d", line(data));
     }

     /**
      * Html-Element select zur Auswahl des Modus: Die Variable 'mode' bei
      * Änderung aktualisieren.
      *
      * Checkbox 'Punkte anzeigen': Die Datenpunkte anzeigen / verstecken.
      */

     $('select').on('change', function() {
       mode = this.value;
       updateLines();
     });

     $('#checkbox').on('change', function() {
       var points = d3.selectAll(".data-point");
       if(!$(this).is(":checked")){
         points.classed("hidden", true);
       } else {
         points.classed("hidden", false);
       }
     });

  });

}
