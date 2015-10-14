var sort = require('./modules/sort')
var id = require('./modules/id')
var format = require('./modules/format')
var filter = require('./modules/filter')
var domain = require('./modules/domain')
var range = require('./modules/range')

/* global d3, alert */

/*
 *
 *
 * Initialisierung Visualisation
 *
 *
 */

// Für die Visualisation benötigte Variablen

var config,           // Config-Array für _alle_ Elemente
  datasetsMeta,       // Das 'datasets'-Attribut von meta.json
  index,              // Config-Objekt für die Index-Spalte (X-Wert)
  values,             // Config-Array für Werte-Spalten (Y-Werte)
  v_accessor,         // Funktion, die den Werteaccessor zurückgibt
  v_accessor_scaled,  // Funktion, die den Skalierten Werteaccessor zurückgibt
  v_accessor_cord,    // Funktion, die den Koordinatenaccessor zurückgibt
  v_bundle,           // Objekt, das die drei v-Funktionen enthält.

  xScale,             // X-Skala
  yScale,             // Y-Skala

  w,                  // Breite der Visualisation
  h,                  // Höhe der Visualisation

  tileW,              // Breite eines Elements in der Matrix
  tileH               // Höhe eines Elements in der Matrix

/**
 * Laden der Konfigurationsdatei
 * @param  {[String]} "meta.json"             Der Dateiname für die
 *                                            Konfigurationsdatei
 * @param  {[Function]} function(err, config) Callback
 */
d3.json('meta.json', function (err, res) {
  if (err) {
    console.log(err)
    alert(err)
    return
  }

  config = []
  datasetsMeta = res.datasets

  index = {}
  values = []

  var colors = d3.scale.category20()

  for (var i = 0; i < datasetsMeta.length; i++) {
    var dataset = datasetsMeta[i]
    var url = dataset.url

    for (var j = 0; j < dataset.config.length; j++) {
      var c = dataset.config[j]
      c.url = url

      // Generiere id
      c.rowId = id.get(c)

      config.push(c)

      // Einfügen der Config in index oder values
      if (c.type === 'index') {
        index = c
      } else if (c.type === 'value') {
        // Spaltenspezifische Farbe generieren
        c.color = colors(values.length + 1)

        // Wenn das Attribut activated nicht gesetzt ist, setze es auch true.
        if (typeof c.activated === 'undefined') {
          c.activated = true
        }
        values.push(c)
      }
    }
  // Bei unbekannten Typen: nicht in values oder index einfügen.
  }

  // Datentyp der Skalen festlegen
  if (index.data_type === 'Number') {
    xScale = d3.scale.linear()
  } else if (index.data_type === 'Date') {
    xScale = d3.time.scale()
  }

  if (values[0].data_type === 'Number') {
    yScale = d3.scale.linear()
  } else if (values[0].data_type === 'Date') {
    yScale = d3.time.scale()
  }

  // Höhe und Breite des gesamten SVG-Elements definieren; Verschiebung des
  // Graphs
  w = 1100
  h = 550

  // TODO
  tileW = 200
  tileH = 200

  // Wertebereich der Achsenskalierungen definieren. Hier ist die Anzahl der Pixel
  // gemeint, über die sich die Achsen erstrecken. Die x-Achse und die y-Achse
  // verschieben wir um 50 nach rechts, damit man die y-Achse beschriften kann.
  xScale.range([0, tileW])
  yScale.range([tileH, 0])

  /*
   *
   *
   * Accessors für die Daten
   *
   *
   */

  // Index-Accessor-Funktion: Gibt für eine bestimmte Datenreihe den Wert der
    // Index-Spalte zurück.

  index.accessor = function (d) {
    return d[index.row]
  }

  // ..._scaled: Gibt den Skalierten Wert von accessor zurück.
  index.accessor_scaled = function (d) {
    return xScale(d[index.row])
  }

  // Funktion, die die Werte-Accessor-Funktion zurückgibt. Da sich die Werte-
  // Accessor-Funktionen im Gegensatz zum statischen Index-Accessor unterschei-
  // den, müssen sie für jede Spalte neu generiert werden. Diese Funktion ist
  // dafür zuständig.

  v_accessor = function (entry) {
    return function (d) {
      return d[entry.rowId]
    }
  }

  v_accessor_scaled = function (entry) {
    return function (d) {
      return yScale(d[entry.rowId])
    }
  }

  // Funktion, die den Koordinatenaccessor für die in entry angegebene Spalte
  // zurückgibt.
  v_accessor_cord = function (index, entry) {
    return function (d) {
      return [index.accessor_scaled(d), v_accessor_scaled(entry)(d)]
    }
  }

  v_bundle = {
    'raw': v_accessor,
    'scaled': v_accessor_scaled,
    'cord': v_accessor_cord
  }

  // Die Daten laden
  loadFiles()
})

/*
 *
 *
 * Laden der Daten
 *
 *
 */

/**
 * Die Funktion, die den Datensatz lädt und vorbereitet.
 *
 * Vorgehen:  1. Laden der Daten
 * 						2. Formatieren des Datensatzes (data_types und id)
 * 						3. 'Mergen' mit den anderen Datensätzen, d. h. zusammenfügen
 * 						4. Sortieren
 * 						5. Die gemergten Datensätze weitergeben
 */
function loadFiles () {
  // Anzahl von Dateien, die schon heruntergeladen wurden
  var loaded = 0

  // Die Variable für die gemergten Datensätze
  var data = []

  // Jedes einzelne File herunterladen (1)
  for (var i = 0; i < datasetsMeta.length; i++) {
    d3.csv(datasetsMeta[i].url, mkcb(i))
  }

  /**
   * Funktion, die die Callback-Funktion für einen bestimmten Datensatz-Meta-
   * daten-Objekt mit Index i zurückgibt. Siehe auch: MKCB-Problem.
   * @param  {[Number]} i   Index des Datensatz-Metadaten-Objekts aus
   *                        datasetsMeta.
   * @return {[Function]}   Das generierte Callback, das nach dem Laden der
   *                        Datei ausgeführt wird.
   */
  function mkcb (i) {
    return function (err, resp) {
      if (err) {
        alert(err)
        console.log(err)
        return
      }

      // Formatieren (2)
      resp = format.data_types(resp, datasetsMeta[i].config)
      resp = format.ids(resp, datasetsMeta[i].config)

      // Merge (3)
      for (var j = 0; j < resp.length; j++) {
        data.push(resp[j])
      }

      if (++loaded === datasetsMeta.length) {
        // Alle Datein sind heruntergeladen worden und gemergt.

        // Sortieren (4)
        data = sort(data, index)

        // Weitergeben (5)
        loadVisualization(data)
      }
    }
  }
}

/*
 *
 *
 * Laden der Visualisation
 *
 *
 */

/**
 * Lädt die Visualisation
 * @param  {[Array]} data Die gemergten Datensätze
 */
function loadVisualization (data) {
  /**
   * Keine Achsen
   * Jede Untereinander
   * Anzahl Spalten -> Höhe, Lage der Kasten
   * Für jede Datenreihe: Wertebereich
   */

  // SVG-Element mit id 'visualization' extrahieren aus html
  var v = d3.select('#visualization')
    .attr('width', w)
    .attr('height', h)

  var spaltenAnzahl = values.length + 1
  tileW = w / spaltenAnzahl
  tileH = h / spaltenAnzahl

  // Domains
  xScale.domain(domain.overflowX(data, index, 1.1))

  // testen, ob alle datensätze die gleiche länge haben.
  var buf
  for (var i = 0; i < values.length; i++) {
    if (!buf) {
      buf = filter.row(data, values[i].rowId).length
    }
    if (buf !== filter.row(data, values[i].rowId).length) {
      alert('datasets mismatch')
    }
  }

  var graphConfArray = []

  // Funktionen, die entweder den Accessor oder die Skalierung für die entsprechende
  // Datenspalte zurückgeben: x_ac und y_ac sind für die Accessoren zuständig,
  // x_sc und y_sc für die Skalierungen.

  function x_ac (ide) {
    var x_i = ide.split(',')[0]
    var y_i = ide.split(',')[1]
    x_i = parseInt(x_i, 10)
    y_i = parseInt(y_i, 10)
    return x_i === 0 ? index.accessor : v_bundle.raw(values[x_i - 1])
  }

  function y_ac (ide) {
    var x_i = ide.split(',')[0]
    var y_i = ide.split(',')[1]
    x_i = parseInt(x_i, 10)
    y_i = parseInt(y_i, 10)
    return y_i === 0 ? index.accessor : v_bundle.raw(values[y_i - 1])
  }

  function x_sc (ide) {
    var x_i = ide.split(',')[0]
    x_i = parseInt(x_i, 10)

    var sc
    if (x_i === 0) {
      sc = xScale
    } else {
      // Datentyp der Spalte festlegen
      if (values[x_i - 1].data_type === 'Number') {
        sc = d3.scale.linear()
      } else if (values[x_i - 1].data_type === 'Date') {
        sc = d3.time.scale()
      }

      // Wertebereich der Daten bestimmen
      var xD = []
      xD[0] = range.min(data, v_bundle.raw(values[x_i - 1]))
      xD[1] = range.max(data, v_bundle.raw(values[x_i - 1]))
      xD[1] = range.applyOverflow(xD[0], xD[1],
        1.1, values[x_i - 1].data_type)
      sc.domain(xD)
    }

    // Wertebereich der Skalierung bestimmen
    sc.range([0, tileW])
    return sc
  }
  function y_sc (ide) {
    var y_i = ide.split(',')[1]
    y_i = parseInt(y_i, 10)

    var sc
    if (y_i === 0) {
      sc = xScale
    } else {
      // Datentyp bestimmen
      if (values[y_i - 1].data_type === 'Number') {
        sc = d3.scale.linear()
      } else if (values[y_i - 1].data_type === 'Date') {
        sc = d3.time.scale()
      }

      // Wertebereich der Daten bestimmen
      var xD = []
      xD[0] = range.min(data, v_bundle.raw(values[y_i - 1]))
      xD[1] = range.max(data, v_bundle.raw(values[y_i - 1]))
      xD[1] = range.applyOverflow(xD[0], xD[1],
        1.1, values[y_i - 1].data_type)
      sc.domain(xD)
    }

    // Wertebereich der Skalierung bestimmen
    sc.range([tileH, 0])
    return sc
  }

  for (var i = 0; i < spaltenAnzahl; i++) {
    for (var j = 0; j < spaltenAnzahl; j++) {
      if (i !== j) {
        var xConfig
        var data_tmp = []
        var copy = []

        if (i === 0) {
          xConfig = index
        } else {
          xConfig = values[i - 1]
          copy = filter.row(data, values[i - 1].rowId)
        }

        var yConfig

        if (j === 0) {
          yConfig = index
          data_tmp = copy
        } else {
          yConfig = values[j - 1]
          // Datensatz zusammenführen, falls im ersten Fall bei X ebenfalls
          // eine Wertespalte benutzt wurde

          var data_to_merge = []
          data_to_merge = filter.row(data, values[j - 1].rowId)

          // Daten unlinken, Referenz zum Original-Objekt zerstören
          var here = JSON.parse(JSON.stringify(copy))

          // Zusammenführen
          if (here.length !== 0) {
            for (var k = 0; k < data_to_merge.length; k++) {
              here[k][values[j - 1].rowId] = y_ac(i + ',' + j)(data_to_merge[k])
            }
            data_tmp = here
            copy = undefined
          } else {
            data_tmp = data_to_merge
          }
        }

        // Die berechneten Attribute in ein Objekt speichern und graphConfArray
        // übergeben.
        var obj = {
          xConfig: xConfig,
          yConfig: yConfig,
          data: data_tmp,
          id: i + ',' + j
        }
        graphConfArray.push(obj)
      }
    }
  }

  // Matrix zeichnen
  var c = 0
  for (var i = 0; i < spaltenAnzahl; i++) {
    for (var j = 0; j < spaltenAnzahl; j++) {
      if (i !== j) {
        drawGraph(i, j, graphConfArray[c++])
      } else {
        var name
        if (i === 0) {
          name = (index.name ? index.name : index.row) + (index.unit ? (' in ' + index.unit) : '')
        } else {
          name = (values[i - 1].name ? values[i - 1].name : values[i - 1].row) + (values[i - 1].unit ? (' in ' + values[i - 1].unit) : '')
        }
        drawLabel(i, j, name)
      }
    }
  }

  /**
   * Zeichnet die Beschriftung
   */
  function drawLabel (zeile, spalte, name) {
    v.append('rect')
      .attr('x', spalte * tileW)
      .attr('y', zeile * tileH)
      .attr('width', tileW)
      .attr('height', tileH)
      .classed('label', true)
    v.append('text')
      .classed('label-text', true)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('x', spalte * tileW + tileW * 0.5)
      .attr('y', zeile * tileH + tileH * 0.5)
      .html(name)
  }

  /**
   * Zeichnet den Graphen
   */
  function drawGraph (zeile, spalte, config) {
    var x = spalte * tileW
    var y = zeile * tileH
    items(x, y, config, (zeile + '-' + spalte))
  }

  /**
   * Zeichnet die einzelnen Graphen in der Matrix an der Position x, y
   */
  function items (x, y, config, graphId) {
    // Container für die Visualisation hinzufügen und zu der Maske linken
    // Transformation nach den definierten Angaben mit transform, translate

    var graph = v.append('g')
      .attr('id', graphId)
      .attr('transform', 'translate(' + x +
        ',' + y + ')')

    graph.append('rect')
      .attr('class', 'tile')
      .attr('width', tileW)
      .attr('height', tileH)

    var circles = graph.selectAll('circle')

      // Aus dem gesamten gemergten Datensatz die Elemente extrahieren, die die
      // entsprechende Reihe besitzen. Siehe Merge-Problem.
      // Daten an Selektion binden: Alle Aktionen, die an diesem einem Element
      // ausgeführt werden, werden auch auf alle anderen Datenreihen ausgeführt.
      .data(config.data).enter()

    // Aktionen an Datengebundener Selektion ausführen
    circles.append('circle')
      .attr('class', 'data-point')
      .attr('cx', function (d) {
        // Skalierung und Accessor durch Superaccessoren abrufen
        var scale = x_sc(config.id)
        var ac = x_ac(config.id)
        return scale(ac(d))
      })
      .attr('cy', function (d) {
        // Skalierung und Accessor durch Superaccessoren abrufen
        var scale = y_sc(config.id)
        var ac = y_ac(config.id)
        return scale(ac(d))
      })
  }
}
