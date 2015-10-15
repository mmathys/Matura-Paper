# Notizen zum Hauptteil

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

  - Von URL Laden (d3)
  - Format CSV, Prinzip erklären
  - meta.json (JSON auch erklären), Format des Datensatzes spezifizieren.

### Filtering

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

               <!----------------- TODO
                                   VVVV ------------------>

## 2-D Scatterplot

## 3-D Scatterplot

# n-D Scatterplot
