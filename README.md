# Nexo · Coding

A fictional development platform in English, ready to run locally or deploy
as a static site on Render.

- Responsive interface inspired by a code editor.
- Four-step setup guide for Windows, macOS, and Linux.
- Downloadable portable demo CLI with source code.
- Example playground, local search, preferences, and saved progress.
- Copy buttons always copy the exact command shown on screen.

## Run locally

Requires Node.js 18 or later. There are no dependencies to install.

```sh
npm start
```

Open <http://127.0.0.1:4173>. You can also open `public/index.html` directly.
If automatic copying is unavailable, the page selects the command so you
can copy it manually.

## Check and build

```sh
npm test
npm run build
```

The build generates `dist/`. Tests check local assets, CLI commands, and
whether the clipboard matches the visible text, including the case where
the browser denies clipboard access.

## Deploy on Render

The repository includes `render.yaml` at its root. Create a **Blueprint**
in Render, connect this repository, and review the configuration before
deploying.

To create it manually as a **Static Site**, use:

| Field | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Auto-deploy | Off |

No database, secrets, or PHP service are required. Automatic deployments
are disabled in the Blueprint; deployments can be started manually.
A static site deployed on Render has an Internet-accessible URL. This demo
does not include authentication. To keep it local, use `npm start` without
deploying it.

Reference: [Render Blueprint YAML](https://render.com/docs/blueprint-spec).

## Included CLI

Extract `public/downloads/nexo-demo-0.1.0.zip` and run these commands from
its folder:

```sh
node nexo.mjs --version
node nexo.mjs doctor
node nexo.mjs demo
node nexo.mjs --help
```

The CLI prints runtime information and examples. It does not modify files,
install dependencies, run subprocesses, or make network connections.
The playground displays illustrative output inside the browser.

## Structure

```text
public/
  index.html
  assets/        # Styles, interactions, and icon
  downloads/     # CLI, README.txt, and ZIP
scripts/
  build.mjs      # Generates dist/
  serve.mjs      # Local server
tests/
  platform.test.mjs
render.yaml
```

Edit commands in the visible blocks in `public/index.html`.
Each `data-copy-target` button reads `textContent` from its corresponding
block. There are no hidden clipboard payloads, alternating commands,
or downloads triggered by copying.

Progress and preferences are saved in `localStorage` under
`nexo.demo.preferences.v1`. The demo code does not include analytics or
send visitor information to an external service.
