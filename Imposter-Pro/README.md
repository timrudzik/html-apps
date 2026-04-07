# Imposter Royale (Production Build)

## Was ist enthalten?

- Vollständige Social-Deduction Web-App (ohne Debug-UI)
- Professioneller Spielablauf:
  - Konfiguration (Spieler, Imposter, Zeit, Schwierigkeit)
  - Rollen-Deck-Generierung
  - Einzel-Reveal pro Spieler
  - Runden-Timer
  - Session-Persistenz mit `localStorage`
- Visuelle Premium-Themes mit großen Artwork-SVGs
- Flüssige UI-Animationen inkl. Reduced-Motion-Fallback

## Starten

Einfach im Browser öffnen:

```bash
open Imposter-Pro/index.html
```

oder per lokalem Webserver:

```bash
cd /workspace/html-apps
python -m http.server 8080
```

Dann:

- `http://localhost:8080/Imposter-Pro/`

## Bedienung

1. Spieleranzahl, Imposter-Anzahl, Rundenzeit und Schwierigkeit einstellen.
2. Theme auswählen.
3. `Runde generieren` klicken.
4. Gerät weitergeben und pro Spieler `Rolle anzeigen` klicken.
5. Timer starten, Diskussion führen, danach abstimmen.

## Produktionshinweise

- Komplett statisch deploybar (GitHub Pages, Netlify, Vercel Static).
- Keine Backend-Abhängigkeit.
- Mobilfreundlich und mit Fokus-/ARIA-Verbesserungen umgesetzt.
