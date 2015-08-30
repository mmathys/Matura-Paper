# Interaktive Diagramme darstellen (Disposition)
Maturitätsarbeit Max Mathys

## Disposition

### Einleitung 
- Erläutern, für welche Gebiete oder Probleme Diagramme nützlich sind; Anwendungsbereich der Diagramme erläutern
- Erläutern: Das Datensammeln ist oft nicht aufwendig; das Auswerten/Darstellen ist oft ein Problem
- Problem erläutern: Was will man verbessern (durch Interaktion (u. a.) den Informationsertrag bei Diagrammen erhöhen)

### (theoretischer teil)*
- Theoretischer Teil: Welche Rolle spielen Farben, Formen, Linien, Interaktion...
- Begründung der "Theorien": Methoden, die man im Programm umsetzen will festhalten

### Arbeitsprozess / Praktischer Teil
- Umsetzung der Theorie
- Erkenntnisse bezüglich Informationsvermittlung (-> Verbesserungen am Programm?)
- Beschreiben der Algorithmen (z. B. Interpolation)

### Reflexion
- angetroffenene (technische) Probleme beim Programmieren

**muss noch angepasst werden*

# Notizen
## Ziel
Diese Arbeit soll Methoden in einem interaktiven Diagramme darstellen, die zum **verbesserten Informationsertrag** führen sollen.

Es gibt viele verschiedene Typen von Diagrammen...

## Untersuchungsaspekte
### *Scatterplot*
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
- Überschwappen der Punkte: Lösung durch Anwenden einer SVG-Maske
- Mehrere Dateien importieren: Im meta.json werden Optionen für einzelne Datenreihen definiert. Die Identifikation wird durch den Spaltennamen durchgeführt. Wenn man aber jetzt mehrere Dateien mit identischen Zeilennamen hat, wird es schwierig, die zu unterscheiden und als separate Linien zu definieren. Darum funktioniert die Merge-Strategie nicht. Für alle Elemente muss die url angegeben werden, auch die Definition im meta.json.
- Mehrere Dateien: meta.json
- Spalten unterscheiden, die den gleichen Spaltennamen besitzen: `row#url`-Lösung
- mkcb problem: Problem mit Variablen accessors.


### *Pie-Diagramm*
Ein modifiziertes Pie-Diagramm, das sich

- in den Winkelanteilen der Abschnitte
- im Radius der Abschnitte

unterscheidet.

## Dokumentationsaspekte
- Anforderungen an eine gute Informationsvermittlung
	- Basierend auf diesem Buch

- Arbeitsprozess:
	- Studium der theoretischen Grundlagen 
	- → Programm schreiben
	- → "Rückkoppelung"

- Datensammeln kein Problem
	- Auswertung + Darstellung das grösste "Problem

## TODO

- **Mehrere y-Skalen unterstützen, Einheitenindex?**



- **Stacked Lines für gleiche Einheiten?**


- **Erstellen eines schriftlichen Erfahrungsberichts**


## Mögliche Kritikpunkte der Maturaarbeit

- *Die Arbeit ist zu oberflächlich. Man hat nur einige Methoden anhand der d3-Library angewendet. Eine spezielle Schwierigkeit ist bei diesem Projekt nicht zu erkennen.*

Man muss dafür sorgen, dass die Darstellungen auch wirklich den Informationsertrag steigern und nicht nur unnötige Spielereien sind. Begründungen, wieso man diesen Aspekte auch wirklich hinzugefügt hat, sollten auch erwähnt werden.

- *Die für das Projekt relevanten Algorithmen sind nicht dokumentiert.* bzw. *Alle angewendeten Algorithmen stammen aus dem d3-Projekt, somit hat der Autor gar nichts **selber** geleistet in dieser Hinsicht, sondern fast nur Tutorials aus dem Internet befolgt.*

Man sollte klar abtrennen, für welche Aspekte der Arbeit und wieso man d3 verwendet hat.
Die Verwendung von Tutorials erlaubt eine effiziente und kommeriziell kostengünstige Programmierung. (Eigene Erfahrung während eines Praktikums bei kommerziellen App-Entwicklern).
										
