var tooltip = require('./modules/tooltip');
var line = require('./modules/line');
var sort = require('./modules/sort');
var range = require('./modules/range');
var row = require('./modules/row');
var points = require('./modules/points');
var id = require('./modules/id');

/*******************************************************************************
 *
 *
 * Initialisierung Visualisation
 *
 *
 ******************************************************************************/

// Für die Visualisation benötigte Variablen

var config, datasetsMeta, datasets, index, values, v_accessor, v_acessor_scaled, accessor_data, v_accessor_cord, xScale, yScale, w, h, graphTransform, mouse,
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

  //TODO old
  config = [];

  datasetsMeta = res.datasets;

  // TODO: well im fucked.
  //
  // loadVisualization ist für eine einzige Tabelle geschrieben.
  //
  // Wir haben aber n variablen.
  //
  // überall, wo data vorkommt, müssen wir über diese stelle iterieren und data
  // durch data[h] ersetzen... einziger weg.
  //
  // bei maximum und minimum müssen wir über die sammlung der fucking reihen it-
  // erieren oder so. idk.
  //
  //
  //
  // ANDERE möglichkeit: - in den datensätzen die reihennamen durch die gene-
  // rierte id ersetzen. dann mergen.
  //
  // was ist mit mit dem index? glaub den einfach lassen. der braucht keine id
  // dann hat aber nicht jedes element die spalte - überspringen?
  //
  // das ist so unclean.
  //
  // ne idk ich machs einfach so. mit datsets.
  //
  // array mit nem map von datenreihen.
  //
  // bsp: dat binding d3:
  //
  // iterieren über das. data = datasets[h].
  // values haben ja die rowId dabei. schon eingebaut. easy.

  index = {};
  // Der Array der Datenreihen (Config).
  values = [];

  var colors = d3.scale.category10();

  //TODO: add ofFile attribut zu dem Value? ja.
  // wenn man den Datensatz zu der value-config haben will -> datasets[url] -> data
  //

  for(var i = 0; i<datasetsMeta.length; i++) {
    var dataset = datasetsMeta[i];
    var url = dataset.url;

    for(var j = 0; j<dataset.config.length; j++){
      var c = dataset.config[j];
      c.url = url;

      // Generiere id
      c.rowId = id.get(c);

      config.push(c);
      if(c.type == "index"){
        index = c;
      } else if(c.type == "value") {
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

  graphTransform = {xstart: 50, ytop: 0, xend:0, ybottom:50};

  // Das Tooltip über die Transformation benachrichtigen
  tooltip.opt.graphTransform = graphTransform;

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
       return d[entry.row];
     };
   };

   v_accessor_scaled = function(entry) {
     return function(d) {
       return yScale(d[entry.row])
     }
   };

   v_accessor_cord = function(rowName) {
     return function(d) {
       return [index.accessor_scaled(d), yScale(d[rowName])];
     };
   };

   // Die Visualisation laden
   loadFiles();
});


/*******************************************************************************
 *
 *
 * Laden der Daten
 *
 *
 ******************************************************************************/

function loadFiles() {

  // TODO: Don't merge.

  var loaded = 0;
  datasets = [];

  console.log(datasetsMeta[0].url);

  function mkcb(i) {return function(err, resp) {
    if(err){
      alert(err);
      console.log(err);
      return;
    }

    datasets[datasetsMeta[i].url] = resp;

    if(++loaded == datasetsMeta.length){
      console.log("loaded");
      console.log(datasets);
      //loadVisualization(datasets);
    }
  };}

  for(var i = 0; i<datasetsMeta.length; i++){
    d3.csv(datasetsMeta[i].url, mkcb(i));
  }


  /**
   * Laden des Datensatzes durch d3, wird in den Array data geladen.
   * @param  {[String]} 'data.csv'            Pfad der csv-Datei
   * @param  {[Function]} function(err, data) callback-Funktion, mit Fehlerelement und
   *                                			 		Datenarray
   */
  d3.csv('data.csv', function(err, data) {
    loadVisualization(data);
  });
}

function loadVisualization(data) {
  /**
   *
   * Formatieren des Datensatzes
   *
   */

  // Sortieren, denn wir brauchen dies für unseren Tooltip-Algorithmus
  data = sort(data, index);

  // Schleife, um die Einträge zu formatieren: Strings in ein Javascript-
  // Objekt konvertieren.
  for(var i = 0; i<data.length; i++) {

    for(var j = 0; j<config.length; j++) {
      if(config[j].data_type == "Number") {
        data[i][config[j].row] = parseFloat(data[i][config[j].row]);
      } else if(config[j].data_type == "Date") {
        data[i][config[j].row] =  d3.time.format(config[j].date_format)
                                    .parse(data[i][config[j].row]);
      }
    }

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
  var yWertebereich = [];

  xWertebereich[0] = range.min(data, index.accessor);
  xWertebereich[1] = range.max(data, index.accessor);

  yWertebereich[0] = range.minMultipleSets(data, values, v_accessor);
  yWertebereich[1] = range.maxMultipleSets(data, values, v_accessor);

  console.log(yWertebereich);

  xWertebereich[1] = range.applyOverflow(xWertebereich[0], xWertebereich[1],
    1.1, index.data_type);
  yWertebereich[1] = range.applyOverflow(yWertebereich[0], yWertebereich[1],
    1.1, values[0].data_type);

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
    .scaleExtent([0.9, 50])
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
    for(var i = 0; i<values.length; i++) {
      v.selectAll("circle.data-point[data-row='" + values[i].rowId + "']")
        .attr("cx", index.accessor_scaled)
        .attr("cy", v_accessor_scaled(values[i]));
    }

    // Tooltip bei Zoom auch aktualisieren
    tooltip.updateTooltip(data, xScale, yScale, index, values, v_accessor, v_accessor_scaled, v_accessor_cord);

    // Linie bei Zoom aktualisieren
    line.update(data, index, values, v_accessor_scaled, v_accessor_cord);
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
    .attr("mask", "url(#mask)");

  // Die Daten zum Element mit der d3-Binding-Method binden: Die nach dem
  // enter() stehenden Befehle werden für alle Elemente in dem Array
  // ausgeführt.
  var circles = graph.selectAll("circle")
    .data(data).enter();

  for(var i = 0; i<values.length; i++) {
    circles.append("circle")
        .attr("class", "data-point")
        .attr("data-row", values[i].rowId)
        //TODO: add here attribute data-row and add support in the whole code
        // for this.
        .attr("cx", index.accessor_scaled)
        .attr("cy", v_accessor_scaled(values[i]));
  }

  // Sichtbarkeit prüfen

  points.updateVisibility(values);

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
   * Tooltip (nicht von d3)
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
      tooltip.updateTooltip(data, xScale, yScale, index, values, v_accessor, v_accessor_scaled, v_accessor_cord);
    });

  /**
   *
   * Linien
   *
   */

   for(var i = 0; i<values.length; i++) {
      line.addLine(index, values[i], data, v_accessor_cord(values[i].row));
   }

   $('select').on('change', function() {
     line.mode = this.value;
     line.update(data, index, values, v_accessor_scaled, v_accessor_cord);
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
    * Toggles
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
