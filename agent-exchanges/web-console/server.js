import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number.parseInt(process.env.PORT || '8787', 10);
const HOST = '127.0.0.1';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_FULL_NAME = process.env.REPO_FULL_NAME || 'MATRIXNEO23/TESSA';
const CORRESPONDENCE_PATH = process.env.CORRESPONDENCE_PATH || 'agent-exchanges/correspondence/2026-09-17-bootstrap-001.md';
const BRANCH = process.env.BRANCH || 'main';
const POLL_MS = clampInteger(process.env.POLL_MS, 3000, 60000, 5000);

app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  },
}));

function clampInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function getRepoParts() {
  const [owner, repo] = REPO_FULL_NAME.split('/');
  if (!owner || !repo) {
    throw new Error('REPO_FULL_NAME must be in owner/repo format');
  }
  return { owner, repo };
}

function requireToken() {
  if (!GITHUB_TOKEN) {
    const err = new Error('Missing GITHUB_TOKEN in .env');
    err.status = 500;
    throw err;
  }
}

function encodeBase64Utf8(text) {
  return Buffer.from(text, 'utf8').toString('base64');
}

function decodeBase64Utf8(text) {
  return Buffer.from(text || '', 'base64').toString('utf8');
}

function githubContentUrl() {
  const { owner, repo } = getRepoParts();
  const encodedPath = CORRESPONDENCE_PATH.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
}

async function githubRequest(url, options = {}) {
  requireToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.message || `GitHub request failed with ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function fetchCorrespondence() {
  const url = `${githubContentUrl()}?ref=${encodeURIComponent(BRANCH)}&cacheBust=${Date.now()}`;
  const data = await githubRequest(url, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache' },
  });

  return {
    path: data.path,
    sha: data.sha,
    content: decodeBase64Utf8(data.content),
    html_url: data.html_url,
    fetchedAt: new Date().toISOString(),
  };
}

function romeTimestamp() {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
}

function normalizeManualTurnInput(body) {
  const text = String(body?.text || '').trim();
  const target = String(body?.target || 'entrambe').trim().toLowerCase();
  const priority = String(body?.priority || 'normale').trim().toLowerCase();

  const allowedTargets = new Set(['tessa', 'gptina', 'entrambe']);
  const allowedPriorities = new Set(['bassa', 'normale', 'alta']);

  if (!text) {
    const err = new Error('Il messaggio è vuoto.');
    err.status = 400;
    throw err;
  }

  if (text.length > 10000) {
    const err = new Error('Il messaggio è troppo lungo: massimo 10000 caratteri.');
    err.status = 400;
    throw err;
  }

  if (!allowedTargets.has(target)) {
    const err = new Error('Destinatario non valido. Usa: tessa, gptina, entrambe.');
    err.status = 400;
    throw err;
  }

  if (!allowedPriorities.has(priority)) {
    const err = new Error('Priorità non valida. Usa: bassa, normale, alta.');
    err.status = 400;
    throw err;
  }

  return { text, target, priority };
}

function buildManualTurn({ text, target, priority }) {
  return `\n---\n\n## Turno manuale — Alberto — ${romeTimestamp()} Europe/Rome\n\n### Destinatario\n\n${target}\n\n### Priorità\n\n${priority}\n\n### Messaggio\n\n${text}\n\n### Istruzione di continuità\n\nLa prossima istanza attivata deve leggere questo turno, decidere autonomamente come procedere, aggiungere un solo turno e fermarsi.\n`;
}

app.get('/api/config', (_req, res) => {
  res.json({
    repo: REPO_FULL_NAME,
    path: CORRESPONDENCE_PATH,
    branch: BRANCH,
    pollMs: POLL_MS,
    hasToken: Boolean(GITHUB_TOKEN),
  });
});

app.get('/api/correspondence', async (_req, res, next) => {
  try {
    const correspondence = await fetchCorrespondence();
    res.setHeader('Cache-Control', 'no-store');
    res.json(correspondence);
  } catch (error) {
    next(error);
  }
});

app.post('/api/turn', async (req, res, next) => {
  try {
    const input = normalizeManualTurnInput(req.body);
    const current = await fetchCorrespondence();
    const appendedBlock = buildManualTurn(input);
    const nextContent = `${current.content.replace(/\s*$/, '')}${appendedBlock}\n`;

    const payload = {
      message: `agent-exchanges: append Alberto manual turn to correspondence`,
      content: encodeBase64Utf8(nextContent),
      sha: current.sha,
      branch: BRANCH,
    };

    const updated = await githubRequest(githubContentUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    res.json({
      ok: true,
      commit: updated.commit?.sha || null,
      contentSha: updated.content?.sha || null,
      path: updated.content?.path || CORRESPONDENCE_PATH,
      appendedBlock,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    ok: false,
    error: error.message || 'Errore sconosciuto',
    details: error.data || null,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Correspondence Web Console running on http://${HOST}:${PORT}`);
  console.log(`Repo: ${REPO_FULL_NAME}`);
  console.log(`Path: ${CORRESPONDENCE_PATH}`);
  console.log(`Poll: ${POLL_MS}ms`);
});
