var tooltip = require('./modules/tooltip');
var line = require('./modules/line');
var sort = require('./modules/sort');
var points = require('./modules/points');
var id = require('./modules/id');
var format = require('./modules/format');
var filter = require('./modules/filter');
var domain = require('./modules/domain');
var range = require('./modules/range')

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
  , index             // Config-Objekt für die Index-Spalte (X-Wert)
  , values            // Config-Array für Werte-Spalten (Y-Werte)
  , v_accessor        // Funktion, die den Werteaccessor zurückgibt
  , v_acessor_scaled  // Funktion, die den Skalierten Werteaccessor zurückgibt
  , v_accessor_cord   // Funktion, die den Koordinatenaccessor zurückgibt
  , v_bundle          // Objekt, das die drei v-Funktionen enthält.

  , xScale            // X-Skala
  , yScale            // Y-Skala
  , xWertebereich     // Bereich der X-Werte
  , yWertebereich     // Bereich der Y-Werte
  , xAxis             // X-Achse
  , yAxis             // Y-Achse

  , w                 // Breite der Visualisation
  , h                 // Höhe der Visualisation
  , graphTransform    // Verschiebung des Graphenbereichs

  , tileW             // Breite eines Elements in der Matrix
  , tileH             // Höhe eines Elements in der Matrix

  , mouse             // Die Koordinaten der Maus
  , showPoints        // Gibt an, ob Punkte angezeigt werden sollen
  , showLines         // Gibt an, ob die Linien angezeigt werden sollen

  ;

showPoints = false;

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

  index = {};
  values = [];

  var colors = d3.scale.category20();

  for(var i = 0; i<datasetsMeta.length; i++) {
    var dataset = datasetsMeta[i];
    var url = dataset.url;

    for(var j = 0; j<dataset.config.length; j++){
      var c = dataset.config[j];
      c.url = url;

      // Generiere id
      c.rowId = id.get(c);

      config.push(c);

      // Einfügen der Config in index oder values
      if(c.type == "index"){
        index = c;
      } else if(c.type == "value") {
        // Spaltenspezifische Farbe generieren
        c.color = colors(values.length+1);

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
  if(index.data_type=="Number") {
    xScale = d3.scale.linear();
  } else if(index.data_type=="Date") {
    xScale = d3.time.scale();
  }

  if(values[0].data_type=="Number"){
    yScale = d3.scale.linear();
  } else if(values[0].data_type=="Date") {
    yScale = d3.time.scale();
  }



  // Höhe und Breite des gesamten SVG-Elements definieren; Verschiebung des
  // Graphs
  w = 1100;
  h = 550;

  //TODO
  tileW = 200
  tileH = 200

  graphTransform = {xstart: 70, ytop: 0, xend:0, ybottom:50};

  // Das Tooltip über die Transformation benachrichtigen
  tooltip.opt.graphTransform = graphTransform;

  // Globale Maus-Variable initalisieren
  mouse = [];

  // Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
  // gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
  // verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
  xScale.range([0,tileW]);
  yScale.range([tileH, 0]);

  // Die Achsen werden von d3 generiert.
  // TODO
  xAxis = d3.svg.axis().scale(xScale).orient("bottom")
    .ticks(3);
  yAxis = d3.svg.axis().scale(yScale).orient("left")
    .ticks(3)
      .innerTickSize(-tileW)
      .outerTickSize(2);

  /*******************************************************************************
   *
   *
   * Accessors für die Daten
   *
   *
   ******************************************************************************/

   // Index-Accessor-Funktion: Gibt für eine bestimmte Datenreihe den Wert der
   // Index-Spalte zurück.

   index.accessor = function(d) {
     return d[index.row];
   };

   // ..._scaled: Gibt den Skalierten Wert von accessor zurück.
   index.accessor_scaled = function(d) {
     return xScale(d[index.row]);
   };

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
       return yScale(d[entry.rowId]);
     }
   };

   // Funktion, die den Koordinatenaccessor für die in entry angegebene Spalte
   // zurückgibt.
   v_accessor_cord = function(index, entry) {
     return function(d) {
       return [index.accessor_scaled(d), v_accessor_scaled(entry)(d)];
     };
   };

   v_bundle = {
     "raw": v_accessor,
     "scaled": v_accessor_scaled,
     "cord": v_accessor_cord
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
      data = sort(data, index);

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

  /**
   * Keine Achsen
   * Jede Untereinander
   * Anzahl Spalten -> Höhe, Lage der Kasten
   * Für jede Datenreihe: Wertebereich
   */

   // SVG-Element mit id 'visualization' extrahieren aus html
   var v = d3.select("#visualization")
     .attr("width", w)
     .attr("height", h);

  var spaltenAnzahl = values.length+1;
  tileW = w/spaltenAnzahl;
  tileH = h/spaltenAnzahl;

  //Domains
  xScale.domain(domain.overflowX(data, index, 1.1));
  for(var i = 0; i<values.length; i++){
    // Datentyp der Skalen festlegen
    if(values[i].data_type=="Number") {
      values[i].scale = d3.scale.linear();
    } else if(values[i].data_type=="Date") {
      values[i].scale = d3.time.scale();
    }
    var xD = [];
    xD[0] = range.min(data, v_bundle.raw(values[i]));
    xD[1] = range.max(data, v_bundle.raw(values[i]));
    xD[1] = range.applyOverflow(xD[0], xD[1],
      1.1, values[i].data_type);
    values[i].scale.domain(xD);
  }

  // Scale Ranges TODO
  var graphConfArray = [];

  for(var i = 0; i<spaltenAnzahl; i++) {
    for(var j = 0; j<spaltenAnzahl; j++){
      if(i!=j){
        var xConfig, xAccessor, xScale_tmp, data_tmp = [];
        if(i==0){
          xConfig = index;
          xAccessor = index.accessor;
          xScale_tmp = xScale;
        }else{
          xConfig = values[i-1];
          xAccessor = v_bundle.raw(values[i-1]);
          xScale_tmp = values[i-1].scale;
          data_tmp = filter.row(data, values[i-1].rowId)
        }

        var yConfig, yAccessor, yScale;
        if(j==0){
          yConfig = index;
          yAccessor = index.accessor;
          yScale = xScale;
        }else{
          yConfig = values[j-1];
          yAccessor = v_bundle.raw(values[j-1]);
          yScale = values[j-1].scale;
          //merge
          var data_to_merge = filter.row(data, values[j-1].rowId);
          if(data_tmp.length!=0){
            for(var k = 0; k<data_to_merge.length; k++){
              data_tmp[k][values[j-1].rowId] = yAccessor(data_to_merge[k]);
            }
            console.log("merged");
            console.log(data_tmp)
          }else{
            data_tmp=data_to_merge;
          }
        }

        var obj = {
          xConfig: xConfig,
          yConfig: yConfig,
          xAccessor: xAccessor,
          yAccessor: yAccessor,
          xScale: xScale_tmp,
          yScale: yScale,
          data: data_tmp
        };
        graphConfArray.push(obj);
      }
    }
  }

  // draw.
  var graph;

  for(var i = 0; i<spaltenAnzahl; i++) {
    for(var j = 0; j<spaltenAnzahl; j++){
      if(i!=j){
        drawGraph(i,j,graphConfArray[i*spaltenAnzahl+j+1])
      }
    }
  }

  function drawGraph(zeile, spalte, config) {
    var x = spalte*tileW;
    var y = zeile*tileH;
    var graphId = zeile+","+spalte;
    mask(x, y, graphId);
    items(x, y, graphId, config);
  }

  function mask(x, y, graphId) {
    v.append("mask")
      .attr("id", "mask"+graphId)
      .append("rect")
        .attr("x", x)
        .attr("y", x)
        .attr("width", tileW)
        .attr("height", tileH)
        .attr("fill", "white");

    }

    function items(x,y,graphId,config) {
      // Container für die Visualisation hinzufügen und zu der Maske linken
      // Transformation nach den definierten Angaben mit transform, translate
      // TODO
      var graph = v.append("g")
        .attr("id", "graph"+graphId)
        .attr("transform", "translate(" + x +
          "," + y + ")")
        .attr("mask", "url(#mask"+graphId+")");

      var circles = graph.selectAll("circle")

      // Aus dem gesamten gemergten Datensatz die Elemente extrahieren, die die
      // entsprechende Reihe besitzen. Siehe Merge-Problem.
      // Daten an Selektion binden: Alle Aktionen, die an diesem einem Element
      // ausgeführt werden, werden auch auf alle anderen Datenreihen ausgeführt.
      .data(config.data).enter();

      // Aktionen an Datengebundener Selektion ausführen
      circles.append("circle")
        .attr("class", "data-point")
        .attr("cx", function(){return config.xScale(config.xAccessor)})
        .attr("cy", function(){return config.yScale(config.yAccessor)});
    }
}
