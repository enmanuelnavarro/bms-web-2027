# Estadísticas automáticas desde LatinBasket

Cada 48 horas se releen las fichas de LatinBasket de los representados y se
actualizan sus estadísticas en `lib/players.json`. Al guardarse el cambio,
Vercel redespliega y la web queda al día sin que nadie toque nada.

## Cómo funciona

```
.github/workflows/latinbasket.yml   dispara a las 06:15 UTC todos los días
        ↓
scripts/actualiza-latinbasket.ts    comprueba si han pasado 48 h; si no, sale
        ↓
lib/latinbasket.ts                  el mismo parser que ya usa la web
        ↓
lib/players.json                    se escriben las estadísticas
docs/latinbasket-estado.json        se escribe el informe de la revisión
        ↓
commit + push → Vercel redespliega
```

El disparador es **diario** pero el intervalo real son **48 horas**, y quien lo
hace cumplir es el script, no el cron. Es a propósito: «cada dos días» en cron
(`*/2` sobre el día del mes) se descuadra al final de cada mes —del día 31
salta al 1— y dejaría huecos. Con un disparador diario y el reloj dentro del
script, la cadencia es exacta.

## Qué se escribe y qué no

De la misma página salen dos cosas muy distintas.

**La tabla de estadísticas es fiable.** Es tabular, el parser la lee bien y en
la prueba completa acertó en las 50 fichas, sin un solo fallo. Eso **sí se
escribe automáticamente**, reemplazando la temporada entera: si la fuente
corrige un número a la baja, fusionar dejaría el viejo para siempre.

**El resto sale de una frase en inglés** interpretada con expresiones
regulares, y se equivoca lo bastante como para no publicarlo a ciegas:

| Campo | Lo que devuelve la fuente | Qué es en realidad |
|---|---|---|
| `lugar_nacimiento` de Víctor Liz | `Puerto Rican BSN` | su liga |
| `liga_actual` de 12 jugadores | `Dominican Rep` | un país |
| `equipo_actual` de Parham Jr. | `Nicaraguan National Team. Parham Jr. graduated University of Pikeville` | media biografía |

Eso **no se escribe nunca**. Se anota como diferencia pendiente en
`docs/latinbasket-estado.json` para que una persona la revise y, si procede, la
corrija en el Excel de la agencia, que sigue mandando en los datos del roster.

Entre esas diferencias hay información de verdad útil —Jassel Pérez aparece en
Basquet Girona cuando la web dice Covirán Granada— así que **conviene mirar el
informe de vez en cuando**, aunque nada de eso llegue solo a la web.

### Resumen

| | |
|---|---|
| Se escribe solo | `estadisticas_temporada` |
| Se anota, no se escribe | `equipo_actual`, `liga_actual`, `fecha_nacimiento`, `seleccion` |
| No se toca nunca | todo lo demás |
| Si la lectura falla | la ficha se queda como estaba |

Los **3 jugadores con ficha de Eurobasket** se saltan: no hay parser para ese
sitio, y afirmar que un dato viene de ahí sin haberlo leído sería falso.

## Ejecutarlo a mano

```bash
# Simulación: enseña lo que haría, no escribe nada
node scripts/actualiza-latinbasket.ts --dry

# Un jugador suelto (se salta el intervalo de 48 h)
node scripts/actualiza-latinbasket.ts --dry --solo jassel-perez

# Ahora, sin esperar a que pasen las 48 h
node scripts/actualiza-latinbasket.ts --force
```

Desde GitHub: pestaña **Actions → Estadísticas desde LatinBasket → Run
workflow**. Tiene dos casillas, «saltarse el intervalo» y «simulación».

Hace falta **Node 24**, que ejecuta TypeScript sin compilar. Así el script
importa `lib/latinbasket.ts` directamente en vez de duplicar el parser.

## Leer el informe

`docs/latinbasket-estado.json` guarda la última revisión:

```json
{
  "ultima_revision": "2026-09-25T...",
  "intervalo_horas": 48,
  "resumen": { "revisados": 53, "actualizados": 50, "sin_lectura": 0, "omitidos": 3 },
  "resultados": [ { "jugador": "jassel-perez", "estado": "actualizado", "diferencias": [...] } ]
}
```

Ese fichero es además el reloj: de su `ultima_revision` sale la cuenta de las
48 horas. Si se borra, la próxima ejecución revisa todo.

## Si algo va mal

**Deja de actualizarse.** Mira Actions en GitHub. Lo más probable es que
LatinBasket haya cambiado la maquetación: el parser devuelve `null` en vez de
lanzar un error, así que el trabajo termina en verde con
`sin_lectura` alto. Revisa ese número en el informe.

**Actualiza datos que no debería.** Quita el campo de `revisa()` en
`scripts/actualiza-latinbasket.ts`. Hoy solo escribe estadísticas.

**Quiero pararlo.** Comenta el bloque `schedule:` del workflow. El botón manual
sigue funcionando.

**Está haciendo demasiadas peticiones.** Sube `PAUSA_MS` en el script. Ahora
son 1,5 s entre fichas: 50 fichas en unos 75 segundos.
