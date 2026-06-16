# Video del carosello hero (home)

Il carosello video nella prima sezione della home prende i file da questa
cartella. La lista e l'ordine si impostano in **`js/main.js`**, in cima, nella
costante `HERO_VIDEOS`:

```js
const HERO_VIDEOS = [
  'video/c0035.mp4',   // ⭐ il primo della lista = mostrato per primo
  'video/c0033.mp4',
  ...
];
```

- Il **primo** della lista è quello che parte appena si atterra sul sito.
  Per cambiare l'ordine basta spostare le righe.
- I video partono **da soli** e **senza audio** (muted), in orizzontale, e si
  avvicendano in automatico (frecce + puntini per cambiarli a mano).
- Se la cartella è vuota, la hero mostra lo sfondo animato di riserva.

## Da dove arrivano questi file
I 6 `.mov/.MP4` originali (1920x1080, ~200–320 MB l'uno) sono stati convertiti
in `.mp4` web leggeri con ffmpeg: ridimensionati, **audio rimosso**, ottimizzati
con `+faststart`. Comando usato per ciascuno:

```bash
ffmpeg -i C00xx.MP4 -an -c:v libx264 -crf 23 -preset medium -movflags +faststart -pix_fmt yuv420p video/c00xx.mp4
```

`-an` = rimuove l'audio · `-crf 23` = qualità/peso (più alto = più leggero).

Per aggiungere nuovi video: convertili così, mettili qui e aggiungili a
`HERO_VIDEOS` in `js/main.js`.
