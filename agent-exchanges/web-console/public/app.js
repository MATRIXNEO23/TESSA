const state = {
  config: null,
  lastSha: null,
  timer: null,
  loading: false,
};

const el = {
  repoInfo: document.querySelector('#repoInfo'),
  statusDot: document.querySelector('#statusDot'),
  statusText: document.querySelector('#statusText'),
  meta: document.querySelector('#meta'),
  chat: document.querySelector('#chat'),
  refreshButton: document.querySelector('#refreshButton'),
  form: document.querySelector('#turnForm'),
  target: document.querySelector('#target'),
  priority: document.querySelector('#priority'),
  message: document.querySelector('#message'),
  sendButton: document.querySelector('#sendButton'),
  formResult: document.querySelector('#formResult'),
};

function setStatus(kind, text) {
  el.statusDot.className = `dot ${kind}`;
  el.statusText.textContent = text;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

function parseTurns(markdown) {
  const headingRegex = /^##\s+(.+)$/gm;
  const matches = [...markdown.matchAll(headingRegex)];

  if (!matches.length) {
    return [{ title: 'Documento', author: 'system', body: markdown.trim() }];
  }

  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const body = markdown.slice(start, end).trim();
    return { title, author: detectAuthor(title), body };
  });
}

function detectAuthor(title) {
  if (/\bTessa\b/i.test(title)) return 'tessa';
  if (/\bGPTina\b/i.test(title)) return 'gptina';
  if (/\bAlberto\b/i.test(title) || /manuale/i.test(title)) return 'alberto';
  return 'system';
}

function renderTurns(markdown) {
  const turns = parseTurns(markdown);
  el.chat.innerHTML = turns.map((turn) => {
    const safeTitle = escapeHtml(turn.title);
    const safeBody = escapeHtml(turn.body);
    return `
      <article class="message ${turn.author}">
        <div class="messageTitle">${safeTitle}</div>
        <pre class="messageBody">${safeBody}</pre>
      </article>
    `;
  }).join('');
}

function shouldStickToBottom() {
  const distanceFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  return distanceFromBottom < 180;
}

async function loadConfig() {
  const config = await requestJson('/api/config');
  state.config = config;
  el.repoInfo.textContent = `${config.repo} · ${config.path} · refresh ${Math.round(config.pollMs / 1000)}s`;

  if (!config.hasToken) {
    setStatus('error', 'Token GitHub mancante');
  }

  return config;
}

async function refresh({ force = false } = {}) {
  if (state.loading) return;

  const stick = shouldStickToBottom();
  state.loading = true;
  setStatus('loading', 'Aggiorno…');

  try {
    const data = await requestJson(`/api/correspondence?t=${Date.now()}`);

    if (force || data.sha !== state.lastSha) {
      renderTurns(data.content);
      state.lastSha = data.sha;
      if (stick) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }

    const fetchedAt = new Date(data.fetchedAt).toLocaleString('it-IT');
    el.meta.textContent = `Ultimo aggiornamento: ${fetchedAt} · SHA ${data.sha.slice(0, 12)}`;
    setStatus('ok', 'Sincronizzata');
  } catch (error) {
    setStatus('error', 'Errore sync');
    el.meta.textContent = error.message;
  } finally {
    state.loading = false;
  }
}

function startPolling() {
  if (state.timer) window.clearInterval(state.timer);
  const interval = state.config?.pollMs || 5000;
  state.timer = window.setInterval(() => refresh(), interval);
}

async function submitTurn(event) {
  event.preventDefault();

  const text = el.message.value.trim();
  if (!text) {
    el.formResult.textContent = 'Scrivi un messaggio prima di inviare.';
    el.formResult.className = 'formResult error';
    return;
  }

  el.sendButton.disabled = true;
  el.formResult.textContent = 'Invio turno e creo commit…';
  el.formResult.className = 'formResult';
  setStatus('loading', 'Invio…');

  try {
    const result = await requestJson('/api/turn', {
      method: 'POST',
      body: JSON.stringify({
        target: el.target.value,
        priority: el.priority.value,
        text,
      }),
    });

    el.message.value = '';
    el.formResult.textContent = `Turno aggiunto. Commit: ${result.commit || 'n/d'}`;
    el.formResult.className = 'formResult ok';
    await refresh({ force: true });
  } catch (error) {
    el.formResult.textContent = error.message;
    el.formResult.className = 'formResult error';
    setStatus('error', 'Errore invio');
  } finally {
    el.sendButton.disabled = false;
  }
}

el.refreshButton.addEventListener('click', () => refresh({ force: true }));
el.form.addEventListener('submit', submitTurn);

try {
  await loadConfig();
  await refresh({ force: true });
  startPolling();
} catch (error) {
  setStatus('error', 'Avvio fallito');
  el.meta.textContent = error.message;
}
