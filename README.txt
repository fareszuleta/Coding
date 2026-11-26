NEXO — DEMO PLATFORM

An English-language static site with a code editor aesthetic, a four-step
setup guide, a downloadable demo CLI, a playground, local search,
preferences, and progress saved in the browser.

Copy buttons always copy the visible command. The site does not include
hidden clipboard payloads, alternating commands, or downloads triggered by
copying. The original reference project ZIP is not distributed.

LOCAL USE
Requires Node.js 18 or later. No npm install is needed.

  npm start

Open http://127.0.0.1:4173
You can also open public/index.html directly. If the browser does not allow
copying from a local file, the command is selected for manual copying.

CHECKS
  npm test
  npm run build

RENDER
The render.yaml file configures a Static Site:
1. Connect fareszuleta/Coding to your Render account.
2. Create a Blueprint using render.yaml at the repository root.
3. Review the configuration and deploy when ready.

Equivalent settings for manual Static Site creation:
  Build command: npm run build
  Publish directory: dist
  Auto-deploy: Off

No database, secret environment variables, or PHP server are required.
The Blueprint is ready to deploy; it does not create a service by itself.
A static site deployed on Render has an Internet-accessible URL.
To keep this demo local, use npm start without deploying it.
The demo does not include authentication.

Reference: https://render.com/docs/blueprint-spec

STRUCTURE
  public/index.html       Page and dialogs
  public/assets/          Styles, interactions, and icon
  public/downloads/       CLI, instructions, and downloadable ZIP
  scripts/build.mjs       Copies public/ into dist/
  scripts/serve.mjs       Local preview server
  tests/                 CLI and clipboard checks
  render.yaml            Render Blueprint

DEMO DOWNLOAD
The ZIP includes nexo.mjs and README.txt.
  node nexo.mjs --version
  node nexo.mjs doctor
  node nexo.mjs demo
  node nexo.mjs --help

The CLI only prints runtime information and sample text. It does not create
files, install packages, run subprocesses, or make network connections.
The playground displays illustrative examples and does not execute a shell.

COPY CONFIGURATION
Each button uses data-copy-target with the ID of its visible code block.
assets/app.js reads textContent from that block when clicked. The text is
not fetched from an endpoint or a hidden field. Edit commands in index.html.

PRIVACY
The interface saves progress, operating system, and preferences in
localStorage under nexo.demo.preferences.v1. It includes no analytics or forms.
