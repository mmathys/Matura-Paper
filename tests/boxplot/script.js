var sort = require('./modules/sort');
var id = require('./modules/id');
var format = require('./modules/format');
var filter = require('./modules/filter');
var domain = require('./modules/domain');
var boxplot = require('./modules/boxplot')

/*******************************************************************************
 *
 *
 * Initialisierung Visualisation
 *
 *
 ******************************************************************************/

// Für die Visualisation benötigte Variablen

var config            // Config-Array für _alle_ Elemente
  , datasetsMeta      // Das 'datasets'-Attribut von meta.json
  , values            // Config-Array für Werte-Spalten (Y-Werte)
  , xScale
  , yScale
  , xAxis
  , yAxis
  , v_accessor        // Funktion, die den Werteaccessor zurückgibt
  , v_bundle          // Objekt, das die drei v-Funktionen enthält.

  , median            // (Boxplot-spezifisch) Der Median
  , q1                // Das erste Quartil
  , q3                // Das dritte Quartil

  , boxplot_h = 200   // Höhe der Box in Pixel

  , w                 // Breite der Visualisation
  , h                 // Höhe der Visualisation
  , graphTransform    // Verschiebung des Graphenbereichs

  , mouse             // Die Koordinaten der Maus

  ;

/**
 * Laden der Konfigurationsdatei
 * @param  {[String]} "meta.json"             Der Dateiname für die
 *                                            Konfigurationsdatei
 * @param  {[Function]} function(err, config) Callback
 */
d3.json("meta.json", function(err, res) {
  if(err) {
    console.log(err);
    alert(err);
    return;
  }

  config = [];
  datasetsMeta = res.datasets;

  values = [];

  for(var i = 0; i<datasetsMeta.length; i++) {
    var dataset = datasetsMeta[i];
    var url = dataset.url;

    for(var j = 0; j<dataset.config.length; j++){
      var c = dataset.config[j];
      c.url = url;

      // Generiere id
      c.rowId = id.get(c);

      config.push(c);

      // Einfügen der Config in values
      if(c.type == "value") {
        // Spaltenspezifische Farbe generieren

        // Wenn das Attribut activated nicht gesetzt ist, setze es auch true.
        if(typeof c.activated == 'undefined') {
          c.activated = true;
        }
        values.push(c);
      }
    }
    // Bei unbekannten Typen: nicht in values oder index einfügen.
  }

  // Datentyp der Skalen festlegen
  xScale = d3.scale.linear();
  yScale = d3.scale.linear();

  // Höhe und Breite des gesamten SVG-Elements definieren; Verschiebung des
  // Graphs
  w = 1100;
  h = 550;

  graphTransform = {xstart: 70, ytop: 0, xend:0, ybottom:50};

  // Globale Maus-Variable initalisieren
  mouse = [];

  // Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
  // gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
  // verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
  xScale.range([0,w - graphTransform.xstart - graphTransform.xend]);
  yScale.range([h - graphTransform.ytop - graphTransform.ybottom, 0]);

  // Die Achsen werden von d3 generiert.
  xAxis = d3.svg.axis().scale(xScale).orient("bottom")
    .ticks(5);
  yAxis = d3.svg.axis().scale(yScale).orient("left")
    .ticks(5)
      .innerTickSize(-w+graphTransform.xstart+graphTransform.xend)
      .outerTickSize(2);

  /*******************************************************************************
   *
   *
   * Accessors für die Daten
   *
   *
   ******************************************************************************/

   // Funktion, die die Werte-Accessor-Funktion zurückgibt. Da sich die Werte-
   // Accessor-Funktionen im Gegensatz zum statischen Index-Accessor unterschei-
   // den, müssen sie für jede Spalte neu generiert werden. Diese Funktion ist
   // dafür zuständig.

   v_accessor = function(entry) {
     return function(d) {
       return d[entry.rowId];
     };
   };

   v_accessor_scaled = function(entry) {
     return function(d) {
       return xScale(d[entry.rowId]);
     }
   };

   v_bundle = {
     "raw": v_accessor,
     "scaled": v_accessor_scaled,
   };

   // Die Daten laden
   loadFiles();
});


/*******************************************************************************
 *
 *
 * Laden der Daten
 *
 *
 ******************************************************************************/


/**
 * Die Funktion, die den Datensatz lädt und vorbereitet.
 *
 * Vorgehen:  1. Laden der Daten
 * 						2. Formatieren des Datensatzes (data_types und id)
 * 						3. 'Mergen' mit den anderen Datensätzen, d. h. zusammenfügen
 * 						4. Sortieren
 * 						5. Die gemergten Datensätze weitergeben
 */
function loadFiles() {

  // Anzahl von Dateien, die schon heruntergeladen wurden
  var loaded = 0;

  // Die Variable für die gemergten Datensätze
  var data = [];

  // Jedes einzelne File herunterladen (1)
  for(var i = 0; i<datasetsMeta.length; i++){
    d3.csv(datasetsMeta[i].url, mkcb(i));
  }

  /**
   * Funktion, die die Callback-Funktion für einen bestimmten Datensatz-Meta-
   * daten-Objekt mit Index i zurückgibt. Siehe auch: MKCB-Problem.
   * @param  {[Number]} i   Index des Datensatz-Metadaten-Objekts aus
   *                        datasetsMeta.
   * @return {[Function]}   Das generierte Callback, das nach dem Laden der
   *                        Datei ausgeführt wird.
   */
  function mkcb(i) {return function(err, resp) {
    if(err){
      alert(err);
      console.log(err);
      return;
    }

    // Formatieren (2)
    resp = format.data_types(resp, datasetsMeta[i].config);
    resp = format.ids(resp, datasetsMeta[i].config);

    // Merge (3)
    for(var j = 0; j<resp.length; j++){
      data.push(resp[j]);
    }


    if(++loaded == datasetsMeta.length){
      // Alle Datein sind heruntergeladen worden und gemergt.

      // Sortieren (4)
      data = sort(data, v_bundle.raw(values[0]));

      // Weitergeben (5)
      loadVisualization(data);
    }
  };}
}

/*******************************************************************************
 *
 *
 * Laden der Visualisation
 *
 *
 ******************************************************************************/

/**
 * Lädt die Visualisation
 * @param  {[Array]} data Die gemergten Datensätze
 */
function loadVisualization(data) {

  console.log(data)

  // Die variable graph initialiseren, damit sie in der Funktion zoomed() ver-
  // wendet werden kann, obwohl sie erst später definiert wird.
  var graph;

  /**
   * Wird aufgerufen, sobald der Graph neu gezeichnet werden sollte.
   */
  function draw() {
    // Achsen neu zeichnen
    //TODO
    yAxisContainer.call(yAxis);
  }

  /**
   *
   * Elemente einfügen
   *
   */

  // SVG-Element mit id 'visualization' extrahieren aus html
  var v = d3.select("#visualization")
    .attr("width", w)
    .attr("height", h);


  // SVG-Maske für den Graph: Wir wollen nicht, dass Punkte aus unserem
  // definierten Feld auftauchen. Siehe Masken-Problem.
  v.append("mask")
    .attr("id", "mask")
    .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w - graphTransform.xstart - graphTransform.xend)
      .attr("height", h - graphTransform.ytop - graphTransform.ybottom)
      .attr("fill", "white");

  // Container für die Visualisation hinzufügen und zu der Maske linken
  // Transformation nach den definierten Angaben mit transform, translate
  graph = v.append("g")
    .attr("id", "graph")
    .attr("transform", "translate(" + graphTransform.xstart +
      "," + graphTransform.ytop + ")")
    .attr("mask", "url(#mask)");

  /**
   *
   * d3-Achsen einfügen
   *
   */
  // Wertebereich bestimmen für die Achsen
  wertebereich = domain.overflowY(data, values, v_bundle, 1.2);

  yScale.domain(wertebereich)
  yScale.range([0,w - graphTransform.xstart - graphTransform.xend])
  yAxis.orient("bottom")

  var yAxisContainer = v.append("g")
    .attr("class", "axis axis-y")
    .attr("transform", "translate(" +
      graphTransform.xstart + "," +
      (h - graphTransform.ybottom) + ")")
    .call(yAxis);

  /**
   *
   * Berechnung des Boxplots
   *
   */

  // Median, Quartile setzen
  median = boxplot.median(data, values, v_bundle)
  q1 = boxplot.q1(data, values, v_bundle)
  q3 = boxplot.q3(data, values, v_bundle)

  // Umrechnen auf Pixelwerte auf dem Bildschirm

  var median_s = yScale(median);
  var q1_s = yScale(q1);
  var q3_s = yScale(q3);
  console.log("q1", q1, "scaled", q1_s)
  console.log("q3", q3, "scaled", q3_s)

  //Berechnen der Koordinaten der Box
  var x = q1_s
  var graphHeight = h - graphTransform.ytop - graphTransform.ybottom
  var y = graphHeight/2 - boxplot_h/2
  var width = q3_s-q1_s
  var height = boxplot_h

  v.append("rect")
    .attr("class", "boxplot")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)

  /**
   *
   * Tooltip (nicht von d3, selber implementiert)
   *
   */

  //TODO

  // Maus-Koordinaten: Um auf die Maus-Koordinaten zugreifen zu können, muss man
  // ein unsichtbares Element über den gesamten Graph legen, der alle
  // 'Maus-Events' "aufnimmt". Ein leerer g-SVG-Container (wie 'graph') ist
  // nicht fähig, Maus-Events aufzunehmen. Siehe Event-Problem.
  v.append("rect")
    .attr("id", "overlay")
    .attr("x", graphTransform.xstart)
    .attr("y", graphTransform.ytop)
    .attr("width", w - graphTransform.xstart - graphTransform.xend)
    .attr("height", h - graphTransform.ytop - graphTransform.ybottom)
    .on("mousemove", function() {
      mouse = d3.mouse(this);
      //TODO
      //tooltip.mouse = d3.mouse(this);
    });

  // Overlay für die Detailanzeige für Tooltip
  d3.select("#display-overlay")
    .attr("style", "left: " + graphTransform.xstart + "px;" +
      "top: " + graphTransform.ytop + "px;" +
      "max-width: " + (w-graphTransform.xstart-graphTransform.xend) + "px;" +
      "max-height: "+ (h-graphTransform.ytop-graphTransform.ybottom) +"px;" );

}
