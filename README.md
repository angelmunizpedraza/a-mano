# A mano

Humanizador de textos, diseñado y programado por **Ángel Muñiz**. Pegas un texto, lo reescribe para que suene a persona y te puntúa seis señales que miran los detectores de IA: variación, concreción, muletillas, huella tipográfica, voz y transiciones.

App: https://angelmunizpedraza.github.io/a-mano/

## Qué hace

- Reescribe con IA en dos modos. **Rápido**: dos partes a la vez y repaso automático. **A fondo**: dos redactores en paralelo, un juez que revisa frase a frase y un corrector.
- Sin límite de tamaño: los textos largos se dividen por párrafos y se reescriben por partes, manteniendo el hilo.
- Limpieza automática de caracteres invisibles, rayas, comillas curvas y conectores de relleno.
- Se instala en el móvil. iPhone: Safari, Compartir, Añadir a pantalla de inicio. Android: Chrome, menú, Instalar aplicación.

## Resultados reales (4 de octubre de 2026, reescribiendo con Claude)

| Texto | ZeroGPT | GPTZero |
|---|---|---|
| Texto de IA sin tocar | 100 % IA | 100 % IA |
| Humanizado por la app | 0 % IA | 99 % IA |

GPTZero reconoce las reescrituras hechas con IA aunque suenen humanas. Si un texto va a pasar por GPTZero, reescribe tú las frases que la app marca y añade detalles reales.

## IA gratis en tu cuenta de Cloudflare

Dentro de Claude la app usa Claude. En GitHub Pages usa tu propio Worker con Workers AI (Llama 3.3 70B para redactar, Llama 4 Scout para juez y corrector). Capa gratuita de 10.000 neuronas al día, sin tarjeta.

Montaje, una sola vez, desde el navegador:

1. dash.cloudflare.com, Workers y Pages, Crear, Worker. Nómbralo `a-mano-ia` y despliégalo.
2. Editar código: pega `worker/worker.js` y despliega.
3. Configuración, Enlaces (Bindings), Añadir, Workers AI, nombre `AI`.
4. Configuración, Variables y secretos: `APP_KEY` (secreto, una clave larga inventada) y `ALLOWED_ORIGINS` (texto): `https://angelmunizpedraza.github.io`
5. En la app: Conectar IA, pega la dirección del Worker y la clave, Probar y guardar.

Con CLI: `cd worker && npx wrangler deploy && npx wrangler secret put APP_KEY`.

La clave se guarda solo en tu móvil. Ninguna clave de API va dentro de la página.
