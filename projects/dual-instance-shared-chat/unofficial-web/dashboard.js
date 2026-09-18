const els = {
  tessaTab: document.querySelector('#tessaTab'),
  gptinaTab: document.querySelector('#gptinaTab'),
  tessaStatus: document.querySelector('#tessaStatus'),
  gptinaStatus: document.querySelector('#gptinaStatus'),
  refreshTabs: document.querySelector('#refreshTabs'),
  timeline: document.querySelector('#timeline'),
  message: document.querySelector('#message'),
  send: document.querySelector('#send'),
  globalStatus: document.querySelector('#globalStatus')
};

const state = {
  tessaTabId: null,
  gptinaTabId: null,
  tabs: [],
  entries: []
};

const storageKeys = ['tessaTabId', 'gptinaTabId', 'entries'];

function agentForTab(tabId) {
  if (Number(state.tessaTabId) === Number(tabId)) return 'tessa';
  if (Number(state.gptinaTabId) === Number(tabId)) return 'gptina';
  return null;
}

function targetAgents() {
  const target = document.querySelector('input[name="target"]:checked')?.value ?? 'both';
  return target === 'both' ? ['tessa', 'gptina'] : [target];
}

function tabIdFor(agent) {
  return agent === 'tessa' ? state.tessaTabId : state.gptinaTabId;
}

function persist() {
  return chrome.storage.local.set({
    tessaTabId: state.tessaTabId,
    gptinaTabId: state.gptinaTabId,
    entries: state.entries.slice(-200)
  });
}

function renderTimeline() {
  els.timeline.replaceChildren();
  for (const entry of state.entries) {
    const node = document.createElement('article');
    node.className = 'msg ' + entry.author + (entry.pending ? ' pending' : '');

    const who = document.createElement('span');
    who.className = 'who';
    who.textContent =
      entry.author === 'alberto'
        ? 'Alberto'
        : entry.author === 'tessa'
          ? 'Tessa'
          : 'GPTina';

    const body = document.createElement('div');
    body.textContent = entry.text || (entry.pending ? 'sta scrivendo…' : '');

    node.append(who, body);
    els.timeline.append(node);
  }
  els.timeline.scrollTop = els.timeline.scrollHeight;
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function upsertAssistant(agent, requestId, text, final) {
  const id = requestId + ':' + agent;
  let entry = state.entries.find((item) => item.id === id);
  if (!entry) {
    entry = { id, author: agent, text: '', pending: true };
    state.entries.push(entry);
  }
  entry.text = text;
  entry.pending = !final;
  renderTimeline();
  void persist();
}

function setStatus(agent, value) {
  (agent === 'tessa' ? els.tessaStatus : els.gptinaStatus).textContent = value;
}

async function pingAgent(agent) {
  const tabId = tabIdFor(agent);
  if (!tabId) {
    setStatus(agent, 'non collegata');
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(Number(tabId), {
      type: 'dual-chat:ping'
    });
    setStatus(agent, response?.ok ? 'collegata' : 'non disponibile');
  } catch {
    setStatus(agent, 'riapri/ricarica il tab');
  }
}

function fillSelect(select, selectedId) {
  select.replaceChildren();

  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '— scegli un tab ChatGPT —';
  select.append(empty);

  for (const tab of state.tabs) {
    const option = document.createElement('option');
    option.value = String(tab.id);
    option.textContent = (tab.title || 'ChatGPT') + ' · tab ' + tab.id;
    option.selected = Number(selectedId) === Number(tab.id);
    select.append(option);
  }
}

async function refreshTabs() {
  state.tabs = await chrome.tabs.query({ url: ['https://chatgpt.com/*'] });
  fillSelect(els.tessaTab, state.tessaTabId);
  fillSelect(els.gptinaTab, state.gptinaTabId);
  await Promise.all([pingAgent('tessa'), pingAgent('gptina')]);
}

async function saveAssignment(agent, rawValue) {
  const value = rawValue ? Number(rawValue) : null;
  if (agent === 'tessa') state.tessaTabId = value;
  else state.gptinaTabId = value;
  await persist();
  await pingAgent(agent);
}

async function sendTo(agent, requestId, text) {
  const tabId = tabIdFor(agent);
  if (!tabId) throw new Error(agent + '_tab_not_assigned');

  upsertAssistant(agent, requestId, '', false);
  const response = await chrome.tabs.sendMessage(Number(tabId), {
    type: 'dual-chat:send',
    requestId,
    text
  });

  if (!response?.ok) {
    throw new Error(response?.error || 'send_failed');
  }
}

async function sendMessage() {
  const text = els.message.value.trim();
  if (!text) return;

  const agents = targetAgents();
  const missing = agents.filter((agent) => !tabIdFor(agent));
  if (missing.length) {
    els.globalStatus.textContent = 'Assegna prima: ' + missing.join(', ');
    return;
  }

  const requestId = crypto.randomUUID();
  state.entries.push({
    id: requestId + ':alberto',
    author: 'alberto',
    text,
    pending: false
  });
  renderTimeline();
  els.message.value = '';
  els.globalStatus.textContent = 'Invio…';
  els.send.disabled = true;
  await persist();

  const results = await Promise.allSettled(
    agents.map((agent) => sendTo(agent, requestId, text))
  );

  const errors = results
    .map((result, index) => ({ result, agent: agents[index] }))
    .filter(({ result }) => result.status === 'rejected');

  if (errors.length) {
    for (const { result, agent } of errors) {
      const reason = result.status === 'rejected'
        ? String(result.reason?.message ?? result.reason)
        : 'errore';
      upsertAssistant(agent, requestId, '[errore: ' + reason + ']', true);
    }
    els.globalStatus.textContent = 'Invio parziale/errore.';
  } else {
    els.globalStatus.textContent = 'In attesa delle risposte…';
  }

  els.send.disabled = false;
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return;
  const agent = agentForTab(sender.tab.id);
  if (!agent) return;

  if (message?.type === 'dual-chat:update') {
    upsertAssistant(
      agent,
      String(message.requestId),
      String(message.text ?? ''),
      Boolean(message.final)
    );
    setStatus(agent, message.final ? 'collegata' : 'sta scrivendo…');

    if (message.final) {
      const pending = state.entries.some((entry) => entry.pending);
      if (!pending) els.globalStatus.textContent = 'Pronta.';
    }
  }

  if (message?.type === 'dual-chat:error') {
    upsertAssistant(
      agent,
      String(message.requestId),
      '[errore: ' + String(message.error ?? 'unknown') + ']',
      true
    );
    setStatus(agent, 'errore');
  }
});

els.refreshTabs.addEventListener('click', refreshTabs);
els.tessaTab.addEventListener('change', (event) =>
  saveAssignment('tessa', event.target.value)
);
els.gptinaTab.addEventListener('change', (event) =>
  saveAssignment('gptina', event.target.value)
);
els.send.addEventListener('click', sendMessage);
els.message.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    void sendMessage();
  }
});

for (const button of document.querySelectorAll('[data-open]')) {
  button.addEventListener('click', async () => {
    const agent = button.dataset.open;
    const tabId = tabIdFor(agent);
    if (tabId) await chrome.tabs.update(Number(tabId), { active: true });
  });
}

const saved = await chrome.storage.local.get(storageKeys);
state.tessaTabId = saved.tessaTabId ?? null;
state.gptinaTabId = saved.gptinaTabId ?? null;
state.entries = Array.isArray(saved.entries) ? saved.entries : [];
renderTimeline();
await refreshTabs();
