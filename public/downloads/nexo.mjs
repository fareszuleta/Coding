#!/usr/bin/env node
/** Nexo demo CLI. No network, filesystem writes, subprocesses or installation hooks. */
const version = '0.1.0';
const command = process.argv[2] || '--help';
const help = `NEXO ${version}

Uso: node nexo.mjs <comando>

  --version    Mostrar la versión
  doctor       Mostrar el entorno de Node.js
  demo         Imprimir un proyecto de ejemplo
  --help       Mostrar esta ayuda

Esta CLI de demostración solo imprime texto en la terminal.
No instala dependencias, crea archivos ni realiza conexiones de red.`;

if (command === '--version' || command === '-v') {
  console.log(`nexo ${version}`);
} else if (command === '--help' || command === '-h' || command === 'help') {
  console.log(help);
} else if (command === 'doctor') {
  const compatible = Number(process.versions.node.split('.')[0]) >= 18;
  console.log('NEXO · diagnóstico local\n');
  console.log(`${compatible ? '✓' : '!'} Node.js: ${process.versions.node}`);
  console.log(`✓ Sistema: ${process.platform}`);
  console.log(`✓ Arquitectura: ${process.arch}`);
  console.log(compatible ? '\nEntorno compatible con esta demo.' : '\nEsta demo requiere Node.js 18 o posterior.');
  console.log('La información se muestra únicamente en esta terminal.');
  if (!compatible) process.exitCode = 1;
} else if (command === 'demo') {
  console.log(`NEXO · proyecto de ejemplo

✓ Cargando proyecto de ejemplo
✓ Preparando vista previa

hello-nexo/
  src/
    index.ts
  nexo.config.ts

Tu siguiente idea empieza aquí.

Ejemplo ilustrativo. No se han creado archivos.`);
} else {
  console.error(`Comando desconocido: ${command}\n\n${help}`);
  process.exitCode = 1;
}
