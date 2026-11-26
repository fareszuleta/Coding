#!/usr/bin/env node
/** Nexo demo CLI. No network, filesystem writes, subprocesses or installation hooks. */
const version = '0.1.0';
const command = process.argv[2] || '--help';
const help = `NEXO ${version}

Usage: node nexo.mjs <command>

  --version    Show the version
  doctor       Show the Node.js environment
  demo         Print a sample project
  --help       Show this help

This demo CLI only prints text in your terminal.
It does not install dependencies, create files, or make network connections.`;

if (command === '--version' || command === '-v') {
  console.log(`nexo ${version}`);
} else if (command === '--help' || command === '-h' || command === 'help') {
  console.log(help);
} else if (command === 'doctor') {
  const compatible = Number(process.versions.node.split('.')[0]) >= 18;
  console.log('NEXO · local diagnostics\n');
  console.log(`${compatible ? '✓' : '!'} Node.js: ${process.versions.node}`);
  console.log(`✓ System: ${process.platform}`);
  console.log(`✓ Architecture: ${process.arch}`);
  console.log(compatible ? '\nYour environment is compatible with this demo.' : '\nThis demo requires Node.js 18 or later.');
  console.log('This information is displayed only in this terminal.');
  if (!compatible) process.exitCode = 1;
} else if (command === 'demo') {
  console.log(`NEXO · sample project

✓ Loading sample project
✓ Preparing preview

hello-nexo/
  src/
    index.ts
  nexo.config.ts

Your next idea starts here.

Illustrative example. No files were created.`);
} else {
  console.error(`Unknown command: ${command}\n\n${help}`);
  process.exitCode = 1;
}
