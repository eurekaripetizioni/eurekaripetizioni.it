# eurekaripetizioni.it

Sito web ufficiale di **Eureka! APS** — doposcuola, ripetizioni e metodo di studio a Pomezia e
Aprilia.

Sito statico: solo HTML, CSS e JavaScript vanilla. Nessun framework, nessun passo di build,
nessuna dipendenza.

## Struttura

| Percorso | Contenuto |
|---|---|
| `index.html` | Home (hero, chi siamo, obiettivi, programmi, sedi, contatti) |
| `privacy.html` | Informativa privacy (GDPR) |
| `css/index.css` | Design system + stili della home |
| `css/privacy.css` | Stili specifici della pagina privacy (usa i token di `index.css`) |
| `js/index.js` | Menu mobile, smooth scroll, sedi con mappa, reveal on scroll, banner cookie, Google Analytics |
| `js/privacy.js` | Indice laterale, banner cookie, Google Analytics |
| `icons/` | Icone SVG delle sezioni |
| `logo.png` | Logo e favicon |
| `CNAME` | Dominio per GitHub Pages |
| `robots.txt`, `sitemap.xml` | SEO — riferiscono l'URL assoluto `https://eurekaripetizioni.it/` |

## Anteprima locale

```sh
python3 -m http.server 8765
# apri http://localhost:8765/
```

Serve un server locale (non aprire i file con `file://`): la mappa Google delle sedi e alcuni
comportamenti dei link non funzionano altrimenti.

## Deploy

Il sito è pubblicato con **GitHub Pages** sul dominio `eurekaripetizioni.it` (file `CNAME`).
La root del repository viene servita così com'è: fare push sul branch di Pages e le modifiche
vanno online senza altri passaggi.

## Note per la modifica

- **Header, footer, banner cookie e pulsante WhatsApp** sono duplicati in `index.html` e
  `privacy.html`: una modifica va replicata su entrambi i file.
- La logica **cookie + Google Analytics** è duplicata in `js/index.js` e `js/privacy.js`.
  L'ID di misurazione (`G-E2C088Q8M9`) è scritto in entrambi. Il consenso è salvato in
  `localStorage` (`cookie-consent`); Analytics si carica solo dopo "Accetta".
- Il tema è forzato su **light** (`<html data-theme="light">`); il CSS per il tema scuro è già
  presente ma disattivato.
- Le animazioni entrano solo con JavaScript attivo (classe `.js-enabled`): il sito resta
  leggibile e navigabile anche senza JS.
- I link email aprono la finestra di composizione di **Gmail**, non `mailto:`.

Vedi `CLAUDE.md` per il dettaglio dell'architettura.
