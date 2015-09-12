var tooltip = require('./modules/tooltip');
var line = require('./modules/line');
var sort = require('./modules/sort');
var points = require('./modules/points');
var id = require('./modules/id');
var format = require('./modules/format');
var filter = require('./modules/filter');
var domain = require('./modules/domain');
var toggle = require('./modules/toggle');
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
  , zScale            // Z-Skala
  , xWertebereich     // Bereich der X-Werte
  , yWertebereich     // Bereich der Y-Werte
  , zWertebereich     // Bereich der Z-Werte
  , xAxis             // X-Achse
  , yAxis             // Y-Achse

  , w                 // Breite der Visualisation
  , h                 // Höhe der Visualisation
  , graphTransform    // Verschiebung des Graphenbereichs

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

  if(values[1].data_type=="Number"){
    zScale = d3.scale.linear();
  } else if(values[1].data_type=="Date") {
    zScale = d3.time.scale();
  }


  // Höhe und Breite des gesamten SVG-Elements definieren; Verschiebung des
  // Graphs
  w = 1100;
  h = 550;

  graphTransform = {xstart: 70, ytop: 0, xend:0, ybottom:50};

  // Das Tooltip über die Transformation benachrichtigen
  tooltip.opt.graphTransform = graphTransform;

  // Globale Maus-Variable initalisieren
  mouse = [];

  // Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
  // gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
  // verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
  xScale.range([0,100]);
  yScale.range([0,100]);
  zScale.range([0,100]);

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

  $("#xtext").html((index.name?index.name:index.row));
  $("#ytext").html((values[0].name?values[0].name:values[0].row)+" in "+values[0].unit);
  $("#ztext").html((values[1].name?values[1].name:values[1].row)+" in "+values[1].unit);

  xWertebereich = domain.overflowX(data, index, 1.1);

  yWertebereich = [];
  zWertebereich = [];

  yWertebereich[0] = range.min(data, v_bundle.raw(values[0]));
  yWertebereich[1] = range.max(data, v_bundle.raw(values[0]));
  yWertebereich[1] = range.applyOverflow(yWertebereich[0], yWertebereich[1],
    1.1, values[0].data_type);

  zWertebereich[0] = range.min(data, v_bundle.raw(values[1]));
  zWertebereich[1] = range.max(data, v_bundle.raw(values[1]));
  zWertebereich[1] = range.applyOverflow(zWertebereich[0], zWertebereich[1],
    1.1, values[1].data_type);


    xScale.domain(xWertebereich)

    yScale.domain(yWertebereich)
    zScale.domain(zWertebereich)

  //OrbitControls.js used!
	var container, stats;
	var camera, controls, scene, renderer, material, material2;
	init();
	render();
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
  }
  function init() {
    scene = new THREE.Scene();

    var w = window.innerWidth*.8
    var h = window.innerHeight*.7

    camera = new THREE.PerspectiveCamera( 45, w/h, 1, 10000 );
    camera.position.x = 80
    camera.position.y = 70
    camera.position.z = 150

    controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    material = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false } );
    material2 = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize( w,h );

    axis();

    document.getElementById('visualization-wrap').appendChild( renderer.domElement );

    animate();

    xScale.range([0,100]);
    yScale.range([0,100]);

    points();

  }

  function render() {
    renderer.render( scene, camera );
  }

  function toScene(x, y, z){
    return [x-50, y-50, z-50]
  }

  function axis() {
    var origin = new THREE.Vector3( -50, -50, -50 );
    var length = 100;
    var hex = 0x000000;

    scene.add( new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), origin, length, 0xff0000 ) );
    scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), origin, length, 0x00ff00 ) );
    scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), origin, length, 0x0000ff ) );


    var dashed = new THREE.LineDashedMaterial({
           color: 0xdedede,
           dashSize: 3,
           gapSize: 2,
           scale: 1
       });

    var xy1 = [toScene(100,100,0), toScene(100,0,0)]
    var xy2 = [toScene(100,100,0), toScene(0,100,0)]
    var yz1 = [toScene(0,100,100), toScene(0,100,0)]
    var yz2 = [toScene(0,100,100), toScene(0,0,100)]
    var xz1 = [toScene(100,0,100), toScene(100,0,0)]
    var xz2 = [toScene(100,0,100), toScene(0,0,100)]
    var xyz1 = [toScene(100,100,100), toScene(100,100,0)]
    var xyz2 = [toScene(100,100,100), toScene(100,0,100)]
    var xyz3 = [toScene(100,100,100), toScene(0,100,100)]

    for (var i = 0; i < 9; i++) {
      a = [xy1, xy2, xz1, xz2, yz1, yz2, xyz1, xyz2, xyz3][i];
      lg = new THREE.Geometry();
      lg.vertices.push(new THREE.Vector3(a[0][0],a[0][1],a[0][2]));
      lg.vertices.push(new THREE.Vector3(a[1][0],a[1][1],a[1][2]));
      lg.computeLineDistances();
      line = new THREE.Line(lg, dashed);
      scene.add(line)
    }
  }

  function points() {
    var dataY = filter.row(data, values[0].rowId)
    var dataZ = filter.row(data, values[1].rowId)
    for(var i = 0; i<dataY.length; i++){
      var x = xScale(index.accessor(dataY[i]));
      var y = yScale(dataY[i][values[0].rowId]);
      var z = zScale(dataZ[i][values[1].rowId]);


      sphere = new THREE.SphereGeometry(.5, 8, 6 );
      smesh = new THREE.Mesh(sphere, material);
      var arr = toScene(x, y, z);
      console.log("@", x,y,z)
      console.log("@",arr)
      console.log(".")
      smesh.translateX(arr[0]);
      smesh.translateY(arr[1]);
      smesh.translateZ(arr[2]);
      scene.add(smesh);

    }
  }

}