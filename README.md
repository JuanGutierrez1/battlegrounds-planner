# Battlegrounds Planner

Planner de tableros para Hearthstone Battlegrounds. Armá tu tablero de 7 esbirros eligiendo del pool
actual, con filtros por tipo (tribu), tier y texto.

Hecho con React + TypeScript + Vite.

## Desarrollo

```bash
npm install
npm run dev
```

## Datos de esbirros

Los esbirros salen de [HearthstoneJSON](https://hearthstonejson.com/) en inglés (`enUS`) y español
(`esMX`), y se guardan reducidos en `src/data/minions.json`. Para actualizarlos después de un parche:

```bash
npm run fetch-minions
```

Las imágenes se cargan desde `art.hearthstonejson.com`.

## Overlay en vivo (Electron)

Una ventana chica que queda arriba del juego y, durante una partida de Battlegrounds, muestra los
esbirros de la taberna marcando los que son clave para alguna composición, y qué comps te quedan
más cerca según tu tablero y tu mano.

```bash
npm run overlay
```

- Lee el `Power.log` de Hearthstone (en `C:\Program Files (x86)\Hearthstone\Logs`). Si el juego está
  en otra carpeta, definí la variable de entorno `HEARTHSTONE_PATH`.
- Si el log no está activado, el overlay ofrece activarlo (edita `%LOCALAPPDATA%\Blizzard\Hearthstone\log.config`);
  después hay que reiniciar Hearthstone.
- El juego tiene que estar en modo ventana o pantalla completa sin bordes para que el overlay se vea encima.
- `npm run overlay:dev` lo abre con recarga en caliente para desarrollar.
- Para probar el parser con un log guardado: `node scripts/test-powerlog.mjs "<ruta al Power.log>"`.

## Composiciones

Las composiciones (tier, resumen y cartas core) se importan de la tier list de
[HSReplay](https://hsreplay.net/battlegrounds/comps/) para uso personal. El archivo generado,
`src/data/comps.json`, está en el `.gitignore` y no se sube al repo. Sin él, la app funciona igual
pero sin comps.

1. Abrí https://hsreplay.net/battlegrounds/comps/ en el navegador y guardala con **Ctrl+S**.
2. Importala:

```bash
npm run import-comps -- "C:\ruta\a\Battlegrounds Comps - HSReplay.net.html"
```

Si hubo parche y alguna carta no aparece, corré antes `npm run fetch-minions`.

Hearthstone es una marca de Blizzard Entertainment. Este proyecto no está afiliado a Blizzard.
