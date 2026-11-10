# Instrucciones técnicas del servidor de clase

Ficha técnica para quien programe la app «Adivina el personaje». La lógica del juego vive en el servidor del aula
(https://ia.socarrat.com): la app solo muestra lo que el servidor le dice y le avisa cuando alguien pulsa un botón.

## Entrar en el juego

`POST https://ia.socarrat.com/api/app/juego/entrar` con JSON `{"codigo":"XXXX","nombre":"Ana"}`

- Respuesta 200: `{"id":"…","nombre":"Ana"}`. Guarda el `id` en el móvil (localStorage), junto con el código y el nombre.
- 403: el código de la clase es incorrecto → vuelve a pedirlo.
- 400: falta el nombre.

## Estado de la partida (cada segundo)

`GET https://ia.socarrat.com/api/app/juego?id=ID`

```json
{
  "fase": "espera | ruleta | jugando | acierto",
  "ruletaMs": 4000,
  "jugadores": ["Ana", "Marc", "Hugo"],
  "responde": "Hugo",
  "orden": ["Marc", "Ana"],
  "turno": "Marc",
  "preguntas": 3,
  "puntos": [{"nombre": "Ana", "puntos": 2}],
  "desvelado": {"famoso": "…", "foto": "https://…", "acertante": "…"},
  "yo": {"nombre": "Ana", "puntos": 2, "respondo": false, "miTurno": false,
         "eres": {"nombre": "…", "foto": "https://…"}}
}
```

- 404: ese jugador ya no existe → vuelve a la pantalla de entrar.
- `responde` = quien es el famoso. `orden` = la cola de los que preguntan; `turno` = quien pregunta ahora.
- `yo.eres` solo llega al móvil de quien es el famoso. `desvelado` solo llega en la fase `acierto`.

## Qué se ve en cada fase

| Fase | Quién | Pantalla |
|---|---|---|
| `espera` | todos | «Esperando a que el profe pulse Nuevo juego» + `jugadores` |
| `ruleta` | todos | durante `ruletaMs` ms: los nombres pasando rápido, pitidos (Web Audio) cada vez más lentos, vibración si se puede |
| `jugando` | `yo.respondo` | «ERES…», foto `yo.eres.foto`, nombre enorme, «Responde solo sí o no», botón «¡Lo ha adivinado!» |
| `jugando` | `yo.miTurno` | toda la pantalla verde, «¡TE TOCA PREGUNTAR!», a quién (`responde`), botón «Ya he preguntado»; pitido al empezar el turno |
| `jugando` | los demás | toda la pantalla roja: quién pregunta (`turno`), quién responde, la cola (`orden`) con su nombre resaltado |
| `acierto` | todos | foto `desvelado.foto`, «¡{acertante} lo ha adivinado!», confeti |

Siempre abajo: tabla pequeña con `puntos`.

## Botones

- «Ya he preguntado»: `POST https://ia.socarrat.com/api/app/juego/pase` con `{"id":"ID"}`
- «¡Lo ha adivinado!»: `POST https://ia.socarrat.com/api/app/juego/acierto` con `{"id":"ID"}` (el punto es para quien tenía el turno)
- 409 = ahora no se puede (no es tu turno, o la ronda ya acabó): no pasa nada, el siguiente estado lo corrige.

## Instalable y que se actualice sola

- `manifest.json` (nombre, colores #0B0B0A / #FFED00, `icon.png` en 192 y 512, `display: standalone`) + etiquetas para iPhone (`apple-touch-icon`, `apple-mobile-web-app-capable`).
- Service worker **red primero**: pide siempre los archivos de la app a internet y usa la caché solo sin conexión.
  Nunca guarda en caché las respuestas de `ia.socarrat.com`.
- Una constante de versión en el service worker (`const VERSION = 'v1'`) que se sube en cada cambio, con `skipWaiting()` + `clients.claim()` y borrado de cachés antiguas.
- Archivos estáticos sencillos (HTML, CSS, JS), rutas relativas, para que GitHub Pages lo publique tal cual en `/la-app-de-la-clase/`.
