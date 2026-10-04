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

Hearthstone es una marca de Blizzard Entertainment. Este proyecto no está afiliado a Blizzard.
