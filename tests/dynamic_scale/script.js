var tooltip = require('./modules/tooltip');
var line = require('./modules/line');
var sort = require('./modules/sort');
var range = require('./modules/range');
var points = require('./modules/points');
var id = require('./modules/id');
var format = require('./modules/format');
var filter = require('./modules/filter');

/*******************************************************************************
 *
 *
 * Initialisierung Visualisation
 *
 *
 ******************************************************************************/

// Für die Visualisation benötigte Variablen

var config, datasetsMeta, datasets, index, values, v_accessor, v_acessor_scaled,
  accessor_data, v_accessor_cord, xScale, yScale, w, h, graphTransform, mouse,
  xAxis, yAxis, showPoints;

showPoints = false;

/**
 * Laden der Konfigurationsdatei
 * @param  {[String]} "meta.json"             Der Dateiname für die
 *                                            Konfigurationsdatei
 * @param  {[Function]} function(err, config) Das Callback
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

  var colors = d3.scale.category10();

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
  w = 950;
  h = 400;

  graphTransform = {xstart: 70, ytop: 0, xend:0, ybottom:50};

  // Das Tooltip über die Transformation benachrichtigen
  tooltip.opt.graphTransform = graphTransform;

  // Globale Maus-Variable initalisieren
  mouse = [];

  // Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
  // gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
  // verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
  xScale.range([0,w - graphTransform.xstart - graphTransform.xend]);
  yScale.range([h - graphTransform.ytop - graphTransform.ybottom, 0]);

  // Die Achsen werden von d3 generiert.
  xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
  yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

  /*******************************************************************************
   *
   *
   * Accessors für die Daten
   *
   *
   ******************************************************************************/

   index.accessor = function(d) {
     return d[index.row];
   };

   index.accessor_scaled = function(d) {
     return xScale(d[index.row]);
   };

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

   v_accessor_cord = function(index, entry) {
     return function(d) {
       return [index.accessor_scaled(d), v_accessor_scaled(entry)(d)];
     };
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

      console.log("loaded");

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
 * @param  {[type]} data  Die gemergten Datensätze
 */
function loadVisualization(data) {

  /**
   *
   *  Achsen initalisieren (d3)
   *
   */

   //  Wertebereich der Daten bestimmen mit d3: Um einen kleinen Abstand zwischen
   //  den maximalen Punkten und dem Ende des Rändern des Diagrammes zu bewahren,
   //  wird der Unterschied (Δ) des Minimums und dem untersuchten Wert mit 1.1
   //  mulitpliziert. Anschliessend wird die Summe des Minimums und des
   //  multiplizierten Wertes an d3 zurückgegeben.

  var xWertebereich = [];
  var yWertebereich = [];
  
  xWertebereich[0] = range.min(data, index.accessor);
  xWertebereich[1] = range.max(data, index.accessor);

  yWertebereich[0] = range.minMultipleSets(data, values, v_accessor);
  yWertebereich[1] = range.maxMultipleSets(data, values, v_accessor);

  xWertebereich[1] = range.applyOverflow(xWertebereich[0], xWertebereich[1],
    1.1, index.data_type);
  yWertebereich[1] = range.applyOverflow(yWertebereich[0], yWertebereich[1],
    1.1, values[0].data_type);

  xScale.domain(xWertebereich);
  yScale.domain(yWertebereich);

  /**
   *
   * Zoom (d3)
   *
   */

  // Zoom hinzufügen
  var zoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([0.9, 50])
    .on("zoom", draw);

  // die variable graph initialiseren, damit sie in der Funktion zoomed() ver-
  // wendet werden kann, obwohl sie erst später definiert wird.
  var graph;

  /**
   * Wird aufgerufen, sobald gezoomt wurde.
   */
  function draw() {
    // Achsen neu zeichnen
    xAxisContainer.call(xAxis);
    yAxisContainer.call(yAxis);

    // Punkte neu berechnen.
    for(var i = 0; i<values.length; i++) {
      var p = v.selectAll("circle.data-point[data-row='" + values[i].rowId + "']")
        .attr("cx", index.accessor_scaled)
        .attr("cy", v_accessor_scaled(values[i]));
    }

    // Tooltip, Linie bei Zoom aktualisieren
    for(var i = 0; i<values.length; i++) {
      tooltip.updateTooltip(filter.row(data, values[i].rowId), xScale, yScale, index, values[i], v_accessor, v_accessor_scaled, v_accessor_cord);
      line.update(filter.row(data, values[i].rowId), index, values[i], v_accessor_scaled, v_accessor_cord);
    }
  }

  /**
   *
   * Elemente einfügen
   *
   */

  // SVG-Element mit id 'visualization' extrahieren aus html
  var v = d3.select("#visualization")
    .attr("width", w)
    .attr("height", h)

  // Unterstützung für Zoom hinzufügen
    .call(zoom);

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
  graph = v.append("g")
    .attr("id", "graph")
    .attr("transform", "translate(" + graphTransform.xstart +
      "," + graphTransform.ytop + ")")
    .attr("mask", "url(#mask)");

  // Die Punkte zeichnen für jede Datenspalte (in values).
  for(var i = 0; i<values.length; i++) {

    // Die Punkte einer Spalte haben für das Attribut data-row die generierte id
    // (siehe Identifikations-Problem)
    var circles = graph.selectAll("circle[data-row='"+values[i].rowId+"']")

      // Aus dem gesamten gemergten Datensatz die Elemente extrahieren, die die
      // entsprechende Reihe besitzen. Siehe Merge-Problem.
      // Daten an Selektion binden, damit alle Aktionen an diesem Element für
      // alle gebundenen Datenelemente ausgeführt werden.
      .data(filter.row(data, values[i].rowId)).enter();

    // Aktionen an Datengebundener Selektion ausführen
    circles.append("circle")
        .attr("class", "data-point")
        .attr("data-row", values[i].rowId)
        .attr("cx", index.accessor_scaled)
        .attr("cy", v_accessor_scaled(values[i]));
  }

  // Sichtbarkeit der Punkte prüfen
  points.updateVisibility(values);

  /**
   *
   * d3-Achsen einfügen
   *
   */

  var xAxisContainer = v.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", "translate(" +
      graphTransform.xstart + "," +
      (h - graphTransform.ybottom) + ")")
    .call(xAxis);

  var yAxisContainer = v.append("g")
    .attr("class", "axis axis-y")
    .attr("transform", "translate("+graphTransform.xstart+",0)")
    .call(yAxis);

  /**
   *
   * Tooltip (nicht von d3, selber implementiert)
   *
   */

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
      tooltip.mouse = d3.mouse(this);
      for(var i = 0; i<values.length; i++) {
        tooltip.updateTooltip(filter.row(data, values[i].rowId), xScale, yScale,
          index, values[i], v_accessor, v_accessor_scaled, v_accessor_cord);
      }
    });

  /**
   *
   * Linien
   *
   */

   for(var i = 0; i<values.length; i++) {
      line.addLine(index, values[i], filter.row(data, values[i].rowId), v_accessor_cord(index, values[i]));
   }

   $('select').on('change', function() {
     line.mode = this.value;
     for(var i = 0; i<values.length; i++){
       line.update(filter.row(data, values[i].rowId), index, values[i], v_accessor_scaled, v_accessor_cord);
     }
   });

   $('#checkbox').on('change', function() {
     if($(this).is(":checked")){
       showPoints = true;
     } else {
       showPoints = false;
      }
      points.visible = showPoints;
      points.updateVisibility(values);
   });

   /**
    *
    * Toggles
    *
    */

    for(var i = 0; i<values.length; i++){
      d3.select("#select-row")
        .append("p")
        .attr("class", "select-row-item")
        .classed("inactive", !values[i].activated)
        .attr("style", "border-color:"+values[i].color)
        .attr("data-row", values[i].rowId)
        .text(values[i].name ? values[i].name : values[i].row);

      line.setActivated(values[i].activated, values[i].rowId, values);

      $(".select-row-item[data-row='" + values[i].rowId + "']").on('click', function() {
        var row = $(this).attr("data-row");

        if($(this).hasClass("inactive")){
          // activate this
          $(this).toggleClass("inactive", false);
          line.setActivated(true, row, values);
        } else {
          // deactivate this
          $(this).toggleClass("inactive", true);
          line.setActivated(false, row, values);
        }
      });
    }
}
