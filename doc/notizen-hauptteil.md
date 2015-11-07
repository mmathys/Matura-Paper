Notizen zum Hauptteil
=====================

### TODO

- Fussnote zu geschlechterneutral (Leser, Benutzer)
- @ dynamische diagramme: eigener begriff. fussnote.

__Sichau__:
1. Alles sollte in der Vergangenheit geschrieben sein im Abstract.
2. n-Dimensionales Diagramm: löschen und referenzen zu diesem Diagramm in
Einleitung und anderen Stellen löschen.
3. Am Ende (vor Schlusswort, letzter Punkt des Hauptteils) Diskussion, wieso
genau jetzt diese Diagramme besser sind als statische.
4. Schlusswort: Wo gab es Schwierigkeiten? hinzufügen. persönliche Erfahrungen,
Probleme, was gelernt?
5. Hauptteil umbenennen.
6. 1.1: Abschnitt "Diese Maturaarbeit wurde von ....." verschieben oder Sätze
einfügen, die den
vorgehenden Teil und den Abschnitt in Question "verbinden".
7. Pauschalaussage in 1.3 wegstreichen
8. Anfang von 2: Erhältlich auf GitHub und Stick.
9. 2.1.3-.5: nicht so genau, technisch beschreiben, sondern eher die Anwendung
der Technologie beschreiben.
10. 2.3: beschreiben, dass Filtering nicht zu verwechseln mit "Filtern des
Datensatzes" ist.
11. 2.4.1 Zoom: Was wurde umgesetzt?
12. 2.5: Warum wurde eine neue Applikation umgesetzt?
13. 2.5.1: Es gibt auch Lösungen dafür. siehe was geschrieben wurde.
14. Illustration der Projektionen: wo ist genau die kamera dann? wieso sieht man
da die Achse nicht?
vlcht verschieben der Illustration von unten nach oben.
15. Das 3d Diagramm redukktion wurde nicht selber erfunden.

__Format__:
1. Abbildung 1.1 und 1.2: In der Short description datum reintun.
2. Einzüge: Europa Style, nicht US Style.
3. Slash bei Abbildung 2.5: Kein Abstand dazwischen
4. subsubsubsection --> paragraph. (2.2.2 ff)
5. S.18 und/oder
6. Abbildung 2.6: V.o.n.u ausschreibens
7. 2.4.1 Quelle Kennedy
8. Bibliographie:
  - Nach Vorkommen ordnen, nicht alphabetisch.
  - Bei Büchern die Seitenzahlen oder Kapitel (besser Kapitel) angeben im Text.
  - et. al. anstatt u. a.
9. orthographische Projektion und perspektivische Projektion ist nicht der richtige Begriff. Wechseln.
10. 2.5.2 benutze eqn{} und sage Formeln 2.9 whatever
11. BAD WORDS

__Finish__:
- Abgabedatum einfügen.
- Seitenumbrüche (GANZ AM SCHLUSS)
- Export von Code auf Stick
- Export von pdf, drucken lassen.

### BAD WORDS

Punktediagramm (-> Punktdiagramm)               ✔︎

Shneidermann (-> Shneiderman)                   ✔︎

Nutzer (-> Benutzer)                            ✔︎

Software (-> Applikation)                       ✔︎

Programmierbibliothek (-> Programmbibliothek)   ✔︎

Visualisation (-> Visualisierung)               ✔︎

Applikantenachse (-> Applikatenachse)           ✔︎

(C02-) Verbrauch (-> Ausstoss)                  ⬅

# Abstract

Problemstellung, Aufbau, Ergebnisse / Schlussfolgerungen

- Untersucht, wie Punkte und Liniendiagramme durch interaktion verbessert werden können und suchen von lösungen.

dazu..

- Entwicklung einer Webapplikation.
  - Technologie
  - Prozess
  - Challenges bei der Entwicklung
- Interaktives Diagramm
  - Datenverarbeitung
  - verschiedene typen von punkte und liniendiagrammen: 2-d, 3-d, n-d dokumentieren
- durch interaktion bessere wege, datensätze zu erkunden
- ergebnisse: 2 interaktive diagramme

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

(wichtigste Resultate des Hauptteils)

__Interaktion, Interaktionsmethoden wurden verbessert, wie der Nutzer mit dem Diagrammm auseinandersetzen kann, effizienter, analyse besser, methoden aufzählen. in zwei von drei untersuchten diagrammtypen.__

- allgemein: technologie dokumentiert -> optimale datenverarbeitung entwickelt. mit konfigurationsfile.

- ++++++++ experience mit webentwicklung: es wurde viel wissen über javascript, buildsysteme (npm, gulp, browserify) und umgang mit programmbibliotheken (d3, three.js, tween.js) erarbeitet.


- 2d: methoden für interaktion mit benutzeroberflächen wurden entsprechend in unsere diagrammapplikation implementiert: Zoom, Tooltip, Detailanzeige, Datensatzauswahl; Techniken von diagrammdarstellung wurden implementiert: mit d3, achsen, skalierungen, interpolationen, wie auch ein wenig web design: css, minimalismus, pop unpop

- 3d: unkonvetionelle darstellung eines 3d scatterplots in einem prototyp dargestellt, mithilfe der projektionen 3d verständlicher gemacht.

- nd: erkannt, dass sich dieser diagrammtyp nicht wirklich gut eigent für die interaktion und der auch schwierig zu verstehen ist und nicht benutzerfreundlich.
