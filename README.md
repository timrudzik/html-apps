# html-apps
All kinds of little programs

## Struktur

Jede App liegt in einem eigenen Ordner und hat dort eine `index.html`.

Beispiel:

```
/
	index.html        <- Startseite mit Links zu allen Apps
	/Timer
		index.html
	/Imposter
		index.html
	/AndereApp
		index.html
```

## GitHub Pages aktivieren

1. GitHub Repo öffnen: `https://github.com/timrudzik/html-apps`
2. `Settings` -> `Pages`
3. `Source`: `Deploy from a branch`
4. Branch: `main`, Folder: `/ (root)`
5. Speichern

Dann ist die Seite unter
`https://timrudzik.github.io/html-apps/` erreichbar.

Beispiele:

- Startseite: `https://timrudzik.github.io/html-apps/`

## iPhone Nutzung

Safari öffnen -> URL aufrufen -> Teilen -> `Zum Home-Bildschirm`.
So fühlt sich jede App fast wie eine native App an.

## KI-generierte Animationen sinnvoll einbringen

Wenn du KI-Animationen einbauen willst, sind diese Stellen in diesem Repo am sinnvollsten:

1. **Startseite (`/index.html`)**
   - Nutze eine kurze, dezente Hero-Animation (z. B. abstrakter Loop oder animierter Hintergrund), um das Projekt lebendiger zu machen.
   - Wichtig: klein halten (komprimiertes MP4/WebM oder Lottie), damit die Seite schnell bleibt.

2. **`/Imposter` (spielerisch + Story)**
   - Hier passen KI-Animationen am besten, weil die App bereits ein visuelles, thematisches UI hat.
   - Gute Einsatzpunkte:
     - Intro beim Start einer Runde
     - Reveal-Moment für Rollen
     - kurzer Übergang bei Moduswechseln

3. **`/Timer` (funktional + Fokus)**
   - Animationen sollten hier eher „informativ“ sein:
     - sanfte Puls-/Glow-Effekte bei Countdown-Ende
     - kurze Success-/Alert-Animationen statt Dauer-Loop
   - Ziel: Feedback geben, ohne die Lesbarkeit zu stören.

### Praktische Leitlinien

- **Priorität auf Performance:** Für mobile Nutzung lieber kurze Loops, lazy loading und reduzierte Auflösung.
- **Formatwahl:** Für Illustrationen eher Lottie/SVG, für cineastische Sequenzen eher komprimiertes MP4/WebM.
- **Barrierefreiheit:** Optionalen „Animationen reduzieren“-Schalter anbieten (`prefers-reduced-motion` beachten).
- **Stil-Konsistenz:** Pro App nur 1 visueller Animationsstil, damit es nicht unruhig wirkt.
