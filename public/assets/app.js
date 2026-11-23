'use strict';

// Copy commands from their visible DOM block. There is no separate clipboard payload.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const storageKey = 'nexo.demo.preferences.v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch {}
const state = {
  completed: new Set(Array.isArray(saved.completed) ? saved.completed.filter(n => Number.isInteger(n) && n >= 0 && n < 4) : []),
  os: ['windows', 'macos', 'linux'].includes(saved.os) ? saved.os : 'windows',
  wrap: saved.wrap !== false,
  motion: saved.motion === true,
};
let toastTimer;
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ ...state, completed: [...state.completed] })); } catch {}
}
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}
function updateProgress() {
  const count = state.completed.size;
  $('#progress-count').textContent = `${count}/4`;
  $('#progress-fill').style.width = `${count * 25}%`;
  $('.progress-track').setAttribute('aria-valuenow', count);
  $('#progress-description').textContent = count === 4
    ? '¡Recorrido completo! Has confirmado los cuatro pasos de la demo.'
    : 'Marca cada paso cuando lo hayas completado en tu equipo.';
  $$('.step').forEach((step, index) => {
    const done = state.completed.has(index);
    step.classList.toggle('complete', done);
    const number = $('.step-number', step);
    number.textContent = done ? '✓' : String(index + 1);
    number.setAttribute('aria-label', done ? `Paso ${index + 1} completado` : `Paso ${index + 1}`);
  });
}
function openStep(index) {
  $$('.step').forEach((step, i) => {
    $('.step-heading', step).setAttribute('aria-expanded', String(i === index));
    $('.step-body', step).hidden = i !== index;
  });
}
function resetProgress() {
  state.completed.clear(); save(); updateProgress(); openStep(0);
  toast('Progreso reiniciado. Puedes comenzar de nuevo.');
}
function setOS(os) {
  state.os = os;
  const instructions = {
    windows: 'Haz clic derecho en el ZIP, selecciona «Extraer todo» y abre PowerShell dentro de la carpeta extraída que contiene nexo.mjs.',
    macos: 'Haz doble clic en el ZIP para extraerlo. Abre Terminal dentro de la carpeta extraída que contiene nexo.mjs.',
    linux: 'Extrae el ZIP con tu gestor de archivos. Abre una terminal dentro de la carpeta extraída que contiene nexo.mjs.',
  };
  const shells = { windows: 'POWERSHELL', macos: 'ZSH', linux: 'BASH' };
  $$('[data-os]').forEach(button => {
    const active = button.dataset.os === os;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  $('#setup-content').setAttribute('aria-labelledby', `os-${os}`);
  $('#extract-instruction').textContent = instructions[os];
  $$('.shell-name').forEach(label => { label.textContent = shells[os]; });
  save();
}
function applySettings() {
  document.documentElement.classList.toggle('reduce-motion', state.motion);
  document.body.classList.toggle('no-wrap', !state.wrap);
  $('#wrap-code').checked = state.wrap;
  $('#reduce-motion').checked = state.motion;
}
function closeSidebar() {
  $('#sidebar').classList.remove('is-open');
  $('.sidebar-scrim').hidden = true;
  $('.mobile-menu').setAttribute('aria-expanded', 'false');
}
function openDialog(name) {
  const dialog = $(`#dialog-${name}`);
  if (!dialog) return;
  closeSidebar();
  if (name === 'search') { $('#search-input').value = ''; renderSearch(''); }
  dialog.showModal();
  if (name === 'search') $('#search-input').focus();
}

// One explicit click writes only the exact text the visitor can see.
async function copyCommand(button) {
  const target = document.getElementById(button.dataset.copyTarget);
  if (!target || !target.getClientRects().length || button.disabled) return;
  const text = target.textContent;
  button.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    $('span', button).textContent = 'Copiado';
    toast('Comando visible copiado al portapapeles.');
    setTimeout(() => { $('span', button).textContent = 'Copiar'; }, 1800);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
    toast('Seleccionamos el comando. Usa Ctrl+C o ⌘C para copiarlo.');
  } finally {
    button.disabled = false;
  }
}

const examples = {
  demo: { command: 'node nexo.mjs demo', output: 'NEXO · proyecto de ejemplo\n\n✓ Cargando proyecto de ejemplo\n✓ Preparando vista previa\n\nhello-nexo/\n  src/\n    index.ts\n  nexo.config.ts\n\nTu siguiente idea empieza aquí.\n\nEjemplo ilustrativo. No se han creado archivos.' },
  doctor: { command: 'node nexo.mjs doctor', output: 'NEXO · diagnóstico de ejemplo\n\n✓ Node.js: versión compatible (ejemplo)\n✓ Sistema: plataforma de ejemplo\n✓ Arquitectura: arquitectura de ejemplo\n\nLa CLI descargada muestra los valores reales\nde tu equipo, únicamente en tu terminal.' },
  help: { command: 'node nexo.mjs --help', output: 'NEXO 0.1.0\n\nUso: node nexo.mjs <comando>\n\n  --version    Mostrar la versión\n  doctor       Mostrar el entorno de Node.js\n  demo         Imprimir un proyecto de ejemplo\n  --help       Mostrar esta ayuda\n\nSin conexión de red ni cambios en archivos.' },
};
let example = 'demo';
function selectExample(name) {
  example = name;
  $$('[data-example]').forEach(button => {
    const active = button.dataset.example === name;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#playground-command').textContent = examples[name].command;
  $('#playground-output').textContent = 'Tu terminal está lista. Ejecuta un ejemplo para empezar.';
}
const searchItems = [
  { title: 'Descargar Nexo', description: 'Kit portable y código fuente de la demo', keywords: 'descarga zip programa cli', step: 0 },
  { title: 'Instalar y comprobar la versión', description: 'Extraer el ZIP y abrir tu terminal', keywords: 'instalacion instalar node windows macos linux version', step: 1 },
  { title: 'Diagnosticar el entorno', description: 'Conocer el comando doctor', keywords: 'doctor diagnostico entorno node', step: 2 },
  { title: 'Ejecutar la demo', description: 'Tu primer comando de Nexo', keywords: 'demo ejecutar proyecto comando', step: 3 },
  { title: 'Playground', description: 'Probar ejemplos dentro del navegador', keywords: 'simulacion terminal ejemplo', dialog: 'playground' },
  { title: 'Guía rápida', description: 'Ayuda, requisitos y solución de problemas', keywords: 'ayuda documentacion requisitos error desinstalar', dialog: 'docs' },
  { title: 'Preferencias', description: 'Ajuste de líneas, movimiento y portapapeles', keywords: 'configuracion clipboard copia copiar portapapeles progreso', dialog: 'settings' },
];
const normalized = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function renderSearch(query) {
  const root = $('#search-results');
  root.replaceChildren();
  const words = normalized(query).trim().split(/\s+/);
  const results = searchItems.filter(item => words.every(word => normalized(`${item.title} ${item.description} ${item.keywords}`).includes(word)));
  if (!results.length) {
    const message = document.createElement('p'); message.className = 'search-empty';
    message.textContent = 'No hay resultados. Prueba «instalación», «demo» o «ayuda».';
    root.append(message);
  }
  results.forEach(item => {
    const button = document.createElement('button'); button.className = 'search-result';
    const label = document.createElement('span'); label.textContent = item.title;
    const description = document.createElement('small'); description.textContent = item.description;
    label.append(description); button.append(label);
    button.addEventListener('click', () => {
      $('#dialog-search').close();
      if (item.dialog) openDialog(item.dialog);
      else { openStep(item.step); location.hash = 'instalacion'; $(`.step[data-step="${item.step}"] .step-heading`).focus({ preventScroll: true }); }
    });
    root.append(button);
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('button, a');
  if (!button) return;
  if (button.hasAttribute('data-copy-target')) void copyCommand(button);
  if (button.hasAttribute('data-open')) openDialog(button.dataset.open);
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (button.hasAttribute('data-os')) setOS(button.dataset.os);
  if (button.hasAttribute('data-complete')) {
    const step = Number(button.dataset.complete);
    state.completed.add(step); save(); updateProgress();
    const next = [0, 1, 2, 3].find(n => !state.completed.has(n));
    if (next !== undefined) { openStep(next); $(`.step[data-step="${next}"] .step-heading`).focus({ preventScroll: true }); }
    else toast('¡Recorrido completo! Tu demo está lista para explorar.');
  }
  if (button.matches('.step-heading')) {
    const step = Number(button.closest('[data-step]').dataset.step);
    openStep(button.getAttribute('aria-expanded') === 'true' ? -1 : step);
  }
  if (button.hasAttribute('data-example')) selectExample(button.dataset.example);
  if (button.hasAttribute('data-editor')) {
    $$('[data-editor]').forEach(tab => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      $(`#editor-${tab.dataset.editor}`).hidden = !active;
    });
  }
  if (button.hasAttribute('data-download')) toast('Descarga solicitada. Extrae el ZIP para empezar.');
  if (button.matches('a[href^="#"]')) closeSidebar();
});

// Standard keyboard controls for each tab group.
$$('[role="tablist"]').forEach(group => group.addEventListener('keydown', event => {
  const tabs = $$('[role="tab"]', group);
  const index = tabs.indexOf(document.activeElement);
  if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].focus(); tabs[next].click();
}));
$('#reset-progress').addEventListener('click', resetProgress);
$('#settings-reset').addEventListener('click', resetProgress);
$('#wrap-code').addEventListener('change', event => { state.wrap = event.target.checked; applySettings(); save(); });
$('#reduce-motion').addEventListener('change', event => { state.motion = event.target.checked; applySettings(); save(); });
$('#search-input').addEventListener('input', event => renderSearch(event.target.value));
$('#run-example').addEventListener('click', () => { $('#playground-output').textContent = examples[example].output; });
$('.mobile-menu').addEventListener('click', () => {
  const open = !$('#sidebar').classList.contains('is-open');
  $('#sidebar').classList.toggle('is-open', open); $('.sidebar-scrim').hidden = !open;
  $('.mobile-menu').setAttribute('aria-expanded', String(open));
});
$('.sidebar-scrim').addEventListener('click', closeSidebar);
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $$('dialog[open]').forEach(dialog => dialog.close());
    openDialog('search');
  }
  if (event.key === 'Escape') closeSidebar();
});
function updateNavigation() {
  const current = location.hash === '#instalacion' ? 'instalacion' : 'inicio';
  $$('[data-nav]').forEach(link => {
    const active = link.dataset.nav === current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  $('#breadcrumb-current').textContent = current === 'instalacion' ? 'Instalación' : 'Vista general';
}
window.addEventListener('hashchange', updateNavigation);
applySettings(); setOS(state.os); updateProgress(); updateNavigation();
