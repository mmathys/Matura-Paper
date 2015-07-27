#Interaktive Diagramme darstellen
Maturitätsarbeit Max Mathys

## Ziel
Diese Arbeit soll Methoden in interaktiven Diagrammen darstellen, die zum **verbesserten Informationsertrag** führen sollen.

- Wir verwenden den Diagrammtyp **Scatterplot**, teilweise mit *Interpolation* als grundlegendes Beispiel
- Es werden Experimente mit dem **(Stacked) Line Diagram** durchgeführt
- Ein modifiziertes **Pie Diagram** wird vorgestellt. 


## Untersuchungsaspekte
### *Scatterplot*
Es werden verschiedene Aspekte des Diagrammes untersucht und verbessert:

- Einfügen
	- Importieren der Daten: Aus Excel oder aus sonstigem Tabellenprogramm: Paste that shit, csv Format
- Achsen
	- Beschriftungen: Range, Ticks... ✔︎
- Navigation
	- Zoom ✔︎
	- Pan ✔︎
 	- Vereinfachung der Daten für bessere Performance ╳ **NO**
- Datenmanipulation
	- Manipulation der Daten durch Schieberegler usw
- Linien
	- Interpolationen
		- Verschiedene Typen dokumentieren **(!)** ╳ **NO** zu kompliziert. nur lineare Interpolation selber programmieren.
		- mit d3 interpolationen ✔︎
	- Trendlinien
		- R^2 anzeigen
- Zustandsabhängige Informationsanzeige
	- Bei Tooltip dazugehörige Informationen anzeigen (z.B. den Wert) ✔︎
	- 2 Arten von Tooltip: 
		- Zum *echten* Punkt in der Nähe springen, also zum Wert, der wirklich aufgezeichnet wurde
		- An der Stelle bei der Trendlinie oder Interpolation den berechneten Wert anzeigen, der nicht wirklich gemessen wurde.
	- Punkt anwählen: Detailanzeige und Auflistung des ausgewählten Punktes
	- Mehrere Punkte anwählen: Vergleich zwischen Punkten
- Maximum, Minimum anzeigen

#### Probleme gelöst
- Überschwappen der Punkte: Lösung durch Anwenden einer SVG-Mask
- Nicht das ganze scalen: Pkt-radien selber werden skaliert.
- Skalierung: nichts anderes als die Achsenskalierunganpassen und die Daten neu laden.

### *(Stacked) Line Diagram*
Bei diesem *(Stacked) Line Diagram* werden folgende Interaktionsmöglichkeiten vorgestellt:

- Ändern der Linienordnung: Welche Linie als oberstes oder als unterstes etc. dargestellt wird
- Isolieren einer Linie
- "Unstacken" von Linien: Stack aufheben, Linien haben ihre Basis bei der x-Achse
- Schnittpunkte der Linien anzeigen
- Sichtbarkeit verändern
- Interpolation / Trendlinie ändern oder ganz entfernen (nur Punkte anzeigen)

### *Pie-Diagramm*
Ein modifiziertes Pie-Diagramm, das sich

- in den Winkelanteilen der Abschnitte
- im Radius der Abschnitte

unterscheidet.

## Mögliche Kritikpunkte der Maturaarbeit

- *Die Arbeit ist zu oberflächlich. Man hat nur einige Methoden anhand der d3-Library angewendet. Eine spezielle Schwierigkeit ist bei diesem Projekt nicht zu erkennen.*

Man muss dafür sorgen, dass die Darstellungen auch wirklich den Informationsertrag steigern und nicht nur unnötige Spielereien sind. Begründungen, wieso man diesen Aspekte auch wirklich hinzugefügt hat, sollten auch erwähnt werden.

- *Die für das Projekt relevanten Algorithmen sind nicht dokumentiert.* bzw. *Alle angewendeten Algorithmen stammen aus dem d3-Projekt, somit hat der Autor gar nichts **selber** geleistet in dieser Hinsicht, sondern fast nur Tutorials aus dem Internet befolgt.*

Man sollte klar abtrennen, für welche Aspekte der Arbeit und wieso man d3 verwendet hat.
