NEXO — PLATAFORMA DE DEMOSTRACIÓN

Sitio estático en español con estética de editor de código, guía de cuatro
pasos, descarga real de una CLI de ejemplo, playground, búsqueda local,
preferencias y progreso guardado en el navegador.

El botón Copiar siempre copia el comando visible. No se incluyen modos de
copia oculta, alternancia de comandos ni descargas iniciadas al copiar.
El ZIP original del proyecto de referencia no se distribuye.

USO LOCAL
Requiere Node.js 18 o posterior; no necesita npm install.

  npm start

Abre http://127.0.0.1:4173
También puedes abrir public/index.html directamente. Si el navegador no
permite copiar desde un archivo local, el comando se selecciona para que
lo copies manualmente.

COMPROBACIONES
  npm test
  npm run build

RENDER
El archivo render.yaml configura un Static Site. Para usarlo:
1. Conecta el repositorio fareszuleta/Coding a tu cuenta de Render.
2. Crea un Blueprint usando el render.yaml de la raíz.
3. Revisa la configuración y despliega cuando quieras publicarlo.

Configuración equivalente si lo creas manualmente como Static Site:
  Build command: npm run build
  Publish directory: dist
  Auto-deploy: Off

No requiere base de datos, variables secretas ni un servidor PHP.
El Blueprint está preparado para desplegar; no crea un servicio por sí solo.
Un Static Site desplegado en Render tiene una URL accesible por Internet.
Si la demostración debe seguir siendo local, utiliza npm start y no lo despliegues.
No se ha añadido autenticación a esta demo.

Documentación de referencia: https://render.com/docs/blueprint-spec

ESTRUCTURA
  public/index.html       Página y diálogos
  public/assets/          Estilos, interacciones e icono
  public/downloads/       CLI, instrucciones y ZIP descargable
  scripts/build.mjs       Copia public/ a dist/
  scripts/serve.mjs       Servidor de vista previa local
  tests/                 Comprobaciones de la CLI y del portapapeles
  render.yaml            Blueprint de Render

DESCARGA DE DEMOSTRACIÓN
Dentro del ZIP se incluyen nexo.mjs y LEEME.txt.
  node nexo.mjs --version
  node nexo.mjs doctor
  node nexo.mjs demo
  node nexo.mjs --help

La CLI solo imprime datos del runtime y texto de ejemplo. No crea archivos,
instala paquetes, ejecuta procesos secundarios ni realiza conexiones de red.
El playground del sitio muestra ejemplos ilustrativos y no ejecuta shell.

CONFIGURACIÓN DE COPIA
Cada botón usa data-copy-target con el ID de su bloque visible. assets/app.js
lee textContent de ese mismo bloque al hacer clic. El texto no se obtiene de
un endpoint ni de un campo oculto. Los comandos se editan en index.html.

PRIVACIDAD
La interfaz guarda progreso, sistema operativo y preferencias en localStorage
con la clave nexo.demo.preferences.v1. No incorpora analítica ni formularios.
