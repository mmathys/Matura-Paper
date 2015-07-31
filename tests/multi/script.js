var tooltip = require('./modules/tooltip');
var line = require('./modules/line');
var sort = require('./modules/sort');
var range = require('./modules/range');
var row = require('./modules/row');
var points = require('./modules/points');

/*******************************************************************************
 *
 *
 * Initialisierung Visualisation
 *
 *
 ******************************************************************************/

// Für die Visualisation benötigte Variablen

var config, index, values, v_accessor, v_acessor_scaled, v_accessor_cord, xScale, yScale, w, h, graphTransform, mouse,
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

  config = res;

  //TODO: 1. Variablen global machen, die für den nächsten Teil benötigt werden✔︎
  //      2. load() unkommentieren ✔︎
  //      3. Die config auch wirklich anwenden

  index = {};
  // Der Array der Datenreihen (Config).
  values = [];

  var colors = d3.scale.category10();

  for(var i = 0; i<config.length; i++) {
    if(config[i].type == "index"){
      index = config[i];
    } else if(config[i].type == "value") {
      config[i].color = colors(values.length+1);
      config[i].activated = true;
      values.push(config[i]);
    }
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
  w = 1000;
  h = 600;

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
   }

   //TODO: figure out v_accessorcord

   v_accessor_cord = function(rowName) {
     return function(d) {
       return [index.accessor_scaled(d), yScale(d[rowName])];
     };
   };

   // Die Visualisation laden
   load();
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
      for(var i = 0; i<values.length; i++) {
        v.selectAll("circle.data-point[data-row='" + values[i].row + "']")
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
          .attr("data-row", values[i].row)
          //TODO: add here attribute data-row and add support in the whole code
          // for this.
          .attr("cx", index.accessor_scaled)
          .attr("cy", v_accessor_scaled(values[i]));
    }

    // Sichtbarkeit prüfen

    points.visibility(showPoints);

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
        points.visibility(showPoints);
     });

     /**
      * Toggles
      */

      for(var i = 0; i<values.length; i++){
        d3.select("#select-row")
          .append("p")
          .attr("class", "select-row-item")
          .attr("style", "border-color:"+values[i].color)
          .attr("data-row", values[i].row)
          .text(values[i].name ? values[i].name : values[i].row);

        $(".select-row-item[data-row='" + values[i].row + "']").on('click', function() {
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
  });
}
