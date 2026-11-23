# Nexo · Coding

Plataforma de desarrollo ficticia, en español, preparada para usarse en local
o desplegarse como sitio estático en Render.

- Interfaz con estética de editor de código y diseño responsive.
- Guía de cuatro pasos para Windows, macOS y Linux.
- Descarga de una CLI portable de demostración, con su código fuente.
- Playground de ejemplos, búsqueda local, preferencias y progreso guardado.
- Los botones de copia usan exactamente el texto del comando visible.

## Ejecutar en local

Requiere Node.js 18 o posterior. No hay dependencias que instalar.

```sh
npm start
```

Abre <http://127.0.0.1:4173>. También puedes abrir `public/index.html`
directamente. Si la copia automática no está disponible, el sitio selecciona
el comando para copiarlo manualmente.

## Comprobar y compilar

```sh
npm test
npm run build
```

La compilación genera `dist/`. Las pruebas verifican los recursos locales,
los comandos de la CLI y la coincidencia entre texto visible y portapapeles,
incluido el caso en que el navegador rechaza la copia.

## Desplegar en Render

El repositorio incluye un `render.yaml` en la raíz. En Render, crea un
**Blueprint**, conecta este repositorio y revisa la configuración antes de
iniciar el despliegue.

Para crearlo manualmente como **Static Site**, utiliza:

| Campo | Valor |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Auto-deploy | Off |

No necesita base de datos, secretos ni un servicio PHP. El Blueprint deja
desactivados los despliegues automáticos; puedes iniciarlos manualmente.
Un Static Site desplegado en Render tiene una URL accesible por Internet.
La demo no incluye autenticación: para conservarla exclusivamente en local,
utiliza `npm start` sin desplegarla.

Referencia: [Blueprint YAML de Render](https://render.com/docs/blueprint-spec).

## CLI incluida

Extrae `public/downloads/nexo-demo-0.1.0.zip` y, desde su carpeta, ejecuta:

```sh
node nexo.mjs --version
node nexo.mjs doctor
node nexo.mjs demo
node nexo.mjs --help
```

La CLI imprime datos del runtime y ejemplos. No modifica archivos,
instala dependencias, ejecuta procesos secundarios ni realiza conexiones
de red. El playground muestra una salida ilustrativa dentro del navegador.

## Estructura

```text
public/
  index.html
  assets/        # Estilos, interacciones e icono
  downloads/     # CLI, instrucciones y ZIP
scripts/
  build.mjs      # Genera dist/
  serve.mjs      # Servidor local
tests/
  platform.test.mjs
render.yaml
```

Los comandos se editan en los bloques visibles de `public/index.html`.
Cada botón `data-copy-target` lee el `textContent` del bloque correspondiente.
No se incluyen campos de copia oculta, alternancia de comandos ni descargas
activadas por copiar.

El progreso y las preferencias se guardan en `localStorage`, con la clave
`nexo.demo.preferences.v1`. No se incorpora analítica ni se envía información
del visitante desde el código de la demo.
