Notizen zum Hauptteil
=====================

## Technologie

- Javascript (Standard Style, npm packages, modules mit browserify)
- D3 Data Driven Documents, Prinzip erklären, wieso diese Bibliothek gewählt
- SVG, Prinzip erklären kurz
- CSS, Prinzip erklären kurz
- HTML, Prinzip erklären kurz

## Datenverarbeitung

- Bevor das Diagramm erstellt werden kann, müssen Daten geladen werden
- Typische Datenquellen angeben (Open (Government) Data)
- Verarbeitung: Standardablauf von Visualisierungen-Buch zitieren

### Rohdaten

  - Format CSV, Prinzip erklären
  - Von URL Laden (d3)

### Filtering

  - CSV in JSON
  - Hard coding.
  - meta.json (JSON auch erklären), Format und URL des Datensatzes spezifizieren.

  (Jeder Datensatz in meta.json)
  - Formatieren durch data_types (Modul format, format.data_types)
  - Spalten-ID-Zuweisung (format.ids mit Modul id)
  - Merge zu den vorhandenen Daten.

  (Am Schluss)
  - Sortieren (am Schluss, Modul sort)

### Aufbereitete Daten

  - Wie das Programm intern die Daten verwendet

### Mapping

  - Wertebereiche (overflow)
    - -> Skalierung
  - Daten werden an d3 mit accessoren gebunden (Beispiel auflisten)

### Geometriedaten

  - Geometriedaten in Form von SVG-Elementen

### Rendering

  - CSS
  - Browser rendert SVG und CSS

### Bilddaten

  - Ansicht = Bilddaten

## 2-Dimensionales Punktediagramm

  - 2-D Punktediagramme werden in der Praxis am meisten verwendet.
  - unabhängige (x) und abhängige (y) variable.

### Grundlegende Features

  - Grössen
  - Achsen (Wertebereiche, Overflow)
  - Gitter
  - Ticks (Beschriftungen)
  - Wahl der grauen Farben (hervorheben druch grösse und farbe TODO design medium article)

## 3-Dimensionales Punktediagramm

## n-Dimensionales Punktediagramm
