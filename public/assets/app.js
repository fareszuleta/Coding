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
    ? 'All done! You have confirmed all four demo steps.'
    : 'Mark each step after completing it on your computer.';
  $$('.step').forEach((step, index) => {
    const done = state.completed.has(index);
    step.classList.toggle('complete', done);
    const number = $('.step-number', step);
    number.textContent = done ? '✓' : String(index + 1);
    number.setAttribute('aria-label', done ? `Step ${index + 1} completed` : `Step ${index + 1}`);
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
  toast('Progress reset. You can start again.');
}
function setOS(os) {
  state.os = os;
  const instructions = {
    windows: 'Right-click the ZIP, select “Extract All,” and open PowerShell in the extracted folder containing nexo.mjs.',
    macos: 'Double-click the ZIP to extract it. Open Terminal in the extracted folder containing nexo.mjs.',
    linux: 'Extract the ZIP with your file manager. Open a terminal in the extracted folder containing nexo.mjs.',
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
    $('span', button).textContent = 'Copied';
    toast('Visible command copied to the clipboard.');
    setTimeout(() => { $('span', button).textContent = 'Copy'; }, 1800);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
    toast('Command selected. Press Ctrl+C or ⌘C to copy.');
  } finally {
    button.disabled = false;
  }
}

const examples = {
  demo: { command: 'node nexo.mjs demo', output: 'NEXO · sample project\n\n✓ Loading sample project\n✓ Preparing preview\n\nhello-nexo/\n  src/\n    index.ts\n  nexo.config.ts\n\nYour next idea starts here.\n\nIllustrative example. No files were created.' },
  doctor: { command: 'node nexo.mjs doctor', output: 'NEXO · sample diagnostics\n\n✓ Node.js: compatible version (example)\n✓ System: sample platform\n✓ Architecture: sample architecture\n\nThe downloaded CLI shows your actual system details\nonly in your terminal.' },
  help: { command: 'node nexo.mjs --help', output: 'NEXO 0.1.0\n\nUsage: node nexo.mjs <command>\n\n  --version    Show the version\n  doctor       Show the Node.js environment\n  demo         Print a sample project\n  --help       Show this help\n\nNo network connections or file changes.' },
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
  $('#playground-output').textContent = 'Your terminal is ready. Run an example to get started.';
}
const searchItems = [
  { title: 'Download Nexo', description: 'Portable kit and source code', keywords: 'download zip program cli source', step: 0 },
  { title: 'Set up and check the version', description: 'Extract the ZIP and open your terminal', keywords: 'installation install setup node windows macos linux version', step: 1 },
  { title: 'Check your environment', description: 'Explore the doctor command', keywords: 'doctor diagnostics environment node', step: 2 },
  { title: 'Run the demo', description: 'Your first Nexo command', keywords: 'demo run project command', step: 3 },
  { title: 'Playground', description: 'Try examples in your browser', keywords: 'simulation terminal example', dialog: 'playground' },
  { title: 'Quick guide', description: 'Help, requirements, and troubleshooting', keywords: 'help documentation requirements error uninstall', dialog: 'docs' },
  { title: 'Preferences', description: 'Line wrapping, motion, and clipboard', keywords: 'settings preferences clipboard copy progress', dialog: 'settings' },
];
const normalized = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function renderSearch(query) {
  const root = $('#search-results');
  root.replaceChildren();
  const words = normalized(query).trim().split(/\s+/);
  const results = searchItems.filter(item => words.every(word => normalized(`${item.title} ${item.description} ${item.keywords}`).includes(word)));
  if (!results.length) {
    const message = document.createElement('p'); message.className = 'search-empty';
    message.textContent = 'No results. Try “setup,” “demo,” or “help.”';
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
    else toast('All done! Your demo is ready to explore.');
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
  if (button.hasAttribute('data-download')) toast('Download requested. Extract the ZIP to get started.');
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
  $('#breadcrumb-current').textContent = current === 'instalacion' ? 'Installation' : 'Overview';
}
window.addEventListener('hashchange', updateNavigation);
applySettings(); setOS(state.os); updateProgress(); updateNavigation();
