Notizen zum Hauptteil
=====================

say which datasets were used in 3d and nd

replace "Programmierbibliothek" in "Programmbibliothek"

# Abstract

TODO

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

<!----->

## 2-Dimensionales Punktediagramm

  - 2-D Punktediagramme werden in der Praxis am meisten verwendet.
  - Der Benutzer ist sich 2-D Punktediagramme gewöhnt.
  - unabhängige (x) und abhängige (y) variable.

### Mantra

  Overview first, zoom/filter, details on demand.

### Grundlegende Features
  auch in statischen diagrammen, act as overview??

  - Achsen (Wertebereiche, Overflow)
    - Gitter
    - Ticks (Beschriftungen)
    - mehrere datensätze: müssen gleiche einheit haben in diesem fall.
      - Lösungen für mehrere einheiten: mehrere achsen (z.b. links und reechts.)
  - punkte werden auf achsen abgebildet in einem koordinatensystem
  - text pop und unpop Wahl der grauen Farben (hervorheben druch grösse und farbe TODO design medium article https://medium.com/@erikdkennedy/7-rules-for-creating-gorgeous-ui-part-2-430de537ba96#.zen9ym8tk) act as good overview effect
  - Linien
    - Interpolationen
    - Lineare Interpolation umgesetzt
    - lösung bei mehreren datensätzen: verschiedene farben zuordnen.

### Zoom

  - mit scroll.
  - beide achsen scrollen, ist am intuitivsten.
  - manche sagen, nur mit der x-achse zoomen ist am besten;
    - nachteil: nicht intutiv, verwirrt den benutzer.
    - nachteil: wenn wertebereich angepasst, verwirrt benutzer, neue umgebung/Skalierung
    - nachteil: änderungen in y-bereich werden nicht sichtbar.


### select
act as zoom/filter

  - nur bei mehreren datensätzen. rein und auszoomen. das prinzip des pop und unpop kommt vor.

### Tooltip
  act as details on demand

  - Tooltip und Beschriftung
    - Tooltip Funktionsweise: Springen zu nächsten Punkt. Algorithmus?
    - Beschriftung: Anzeige der genauen Daten (mit einheit)
      - exakte Daten

### Verbesserungsideen

  - Mantra: History


## 3-Dimensionales Punktediagramm

  - Typ von daten mit einer unabhängigen und zwei abhängigen variablen:
    - zwei attribute im verlauf der zeit.
    - drei attribute: geschwindigkeit, luftwiderstand, oberfläche
  - dreidimensionales punktediagramm
    - three.js
    - 3 pfeile mit farben als achsen.
    - spheres als punkte, abbildung auf drei achsen.
  - interaktion
    - mit maus rotierbar
      - bessere erkundung des datensatzes, interaktiv.
      - kein zoom, weil sehr verwirrend.
  - reduktion auf 2d
    - reduktion verzerrt bei perpective camera.
    - andere ansicht: ortho camera.
    - klickbar auf jede projektion.
    - verlauf auf jede position, weil sonst ist der nutzer verwirrt und versteht
      den vorgang nicht.

## n-Dimensionales Punktediagramm

  - mehr als zwei abhängige variablen
  - umgesetzt wie in Visualisierungen-Buch
  - Scatterplotmatrix:
    - ein scatterplot: darstellung basiert auf der auswahl von zwei interessierenden variablen.
    - scatterplot matrix hat n^2 elemente und n^2-1 scatterplots. n ist anzahl dimension.
    - anzahl scatterplots auch (m^2-1)/2, da sich scatterplots oberhalb und unterhalb der nebendiagonale nur durch die vertauschung der achsen unterscheiden.

# Schlusswort

TODO
