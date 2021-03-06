# Untersuchungsaspekte
### *2-D Scatterplot* @ `layout`

Daten: CO2-Verbrauch in kt/Jahr/Land

Quelle: Work Bank Group via Quandl

Es werden verschiedene Aspekte des Diagrammes untersucht und verbessert:

- Einfügen
	- Importieren der Daten: Aus Excel oder aus sonstigem Tabellenprogramm: Paste that, csv Format.
- Achsen
	- Beschriftungen:
		- Range ✔︎
		- Ticks ✔︎
		- Einheit
- Zustandsabhängige Informationsanzeige
	- Bei Tooltip dazugehörige Informationen anzeigen (z.B. den Wert) ✔︎
	- Punkt anwählen: Detailanzeige und Auflistung des ausgewählten Punktes
	- Mehrere Punkte anwählen: Vergleich zwischen Punkten

*erledigt:*

- Navigation ✔︎
	- Zoom ✔︎
	- Pan ✔︎
- Linien ✔︎
	- Interpolationen ✔︎
		- Verschiedene Typen dokumentieren ╳ *Verworfen:* Zu aufwendig im Vergleich zum Nutzen. Lineare Interpolation selber programmieren.
		- d3-Interpolationen ✔︎



#### Probleme gelöst
- Überfliessen der Punkte: Lösung durch Anwenden einer SVG-Maske
- Mehrere Dateien importieren: Im meta.json werden Optionen für einzelne Datenreihen definiert. Die Identifikation wird durch den Spaltennamen durchgeführt. Wenn man aber jetzt mehrere Dateien mit identischen Zeilennamen hat, wird es schwierig, sie zu unterscheiden und als separate Datenreihen zu definieren. Darum funktioniert die Merge-Strategie nicht. Für alle Elemente muss die url angegeben werden, auch die Definition im meta.json.
- Mehrere Dateien: meta.json
- Spalten unterscheiden, die den gleichen Spaltennamen besitzen: `row#url`-Lösung
- mkcb problem: Problem mit Variablen accessors.


### *3-D Scatterplot* @ `3d`
3-Dimensionaler Scatterplot.

### *n-D Scatterplot* @ `dimensions`
n-Dimensionaler Scatterplot, mit 2-D Scatterplots als Matrix-Elemente.

## Dokumentationsaspekte
- Anforderungen an eine gute Informationsvermittlung
	- Basierend auf diesem Buch

- Arbeitsprozess:
	- Studium der theoretischen Grundlagen
	- → Programm schreiben
	- → "Rückkoppelung"

- Datensammeln kein Problem
	- Auswertung + Darstellung das grösste "Problem"

## TODO

- **Mehrere y-Skalen unterstützen, Einheitenindex?**


- **Stacked Lines für gleiche Einheiten?**


- **Erstellen eines schriftlichen Erfahrungsberichts**


## Mögliche Kritikpunkte der Maturaarbeit

- *Die Arbeit ist zu oberflächlich. Man hat nur einige Methoden anhand der d3-Library angewendet. Eine spezielle Schwierigkeit ist bei diesem Projekt nicht zu erkennen.*

Man muss dafür sorgen, dass die Darstellungen auch wirklich den Informationsertrag steigern und nicht nur unnötige Spielereien sind. Begründungen, wieso man diese Funktionen auch wirklich hinzugefügt hat, sollten auch erwähnt werden.

- *Die für das Projekt relevanten Algorithmen sind nicht dokumentiert.* bzw. *Alle angewendeten Algorithmen stammen aus dem d3-Projekt, somit hat der Autor gar nichts **selber** geleistet in dieser Hinsicht, sondern fast nur Tutorials aus dem Internet befolgt.*

Man sollte klar darstellen, für welche Aspekte der Arbeit und wieso man d3 verwendet hat.
Die Verwendung von Tutorials erlaubt eine effiziente und kommeriziell kostengünstige Programmierung. (Eigene Erfahrung während eines Praktikums bei kommerziellen App-Entwicklern, welche u. a. die Swisscom Cloud entwickeln).
