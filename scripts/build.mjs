import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../public/', import.meta.url));
const destination = fileURLToPath(new URL('../dist/', import.meta.url));
for (const file of ['index.html', 'assets/style.css', 'assets/app.js', 'downloads/nexo-demo-0.1.0.zip']) {
  await stat(`${source}/${file}`);
}
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
console.log('Nexo: static site ready in dist/.');
