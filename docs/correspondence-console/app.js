const CONFIG = {
  owner: "MATRIXNEO23",
  repo: "TESSA",
  branch: "main",
  path: "agent-exchanges/correspondence/2026-09-18-continuity-003.md",
  pollMs: 5000,
};

const rawUrl = `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${CONFIG.path}`;
const editUrl = `https://github.com/${CONFIG.owner}/${CONFIG.repo}/edit/${CONFIG.branch}/${CONFIG.path}`;

const el = {
  chat: document.getElementById("chat"),
  chatMeta: document.getElementById("chatMeta"),
  statusText: document.getElementById("statusText"),
  dot: document.getElementById("connectionDot"),
  refreshButton: document.getElementById("refreshButton"),
  autoScroll: document.getElementById("autoScroll"),
  recipient: document.getElementById("recipient"),
  message: document.getElementById("message"),
  generated: document.getElementById("generated"),
  generateButton: document.getElementById("generateButton"),
  copyButton: document.getElementById("copyButton"),
  editLink: document.getElementById("editLink"),
};

el.editLink.href = editUrl;
let lastHash = "";
let lastLoadedAt = null;

function setStatus(text, ok = true) {
  el.statusText.textContent = text;
  el.dot.classList.toggle("ok", ok);
  el.dot.classList.toggle("err", !ok);
}

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return String(hash);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownLite(md) {
  const lines = md.split("\n");
  const out = [];
  let inList = false;
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p>${inlineMarkdown(line)}</p>`);
      continue;
    }
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function inlineMarkdown(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseTurns(md) {
  const matches = [...md.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : md.length;
    let block = md.slice(start, end).trim();
    block = block.replace(/\n---\s*$/g, "").trim();
    const lines = block.split("\n");
    const title = lines.shift().replace(/^##\s+/, "").trim();
    const body = lines.join("\n").trim();
    const author = detectAuthor(title);
    return { title, author, body };
  });
}

function detectAuthor(title) {
  const low = title.toLowerCase();
  if (low.includes("tessa")) return "Tessa";
  if (low.includes("gptina")) return "GPTina";
  if (low.includes("alberto")) return "Alberto";
  if (low.includes("manuale")) return "Manuale";
  return "Sistema";
}

function renderTurns(turns) {
  el.chat.innerHTML = "";
  for (const turn of turns) {
    const card = document.createElement("article");
    card.className = `bubble ${turn.author}`;
    const header = document.createElement("div");
    header.className = "bubble-header";
    header.innerHTML = `
      <span class="author ${turn.author}">${escapeHtml(turn.author)}</span>
      <span class="turn-title">${escapeHtml(turn.title)}</span>
    `;
    const body = document.createElement("div");
    body.className = "bubble-body";
    body.innerHTML = markdownLite(turn.body);
    card.append(header, body);
    el.chat.appendChild(card);
  }
  const turnWord = turns.length === 1 ? "turno" : "turni";
  el.chatMeta.textContent = `${turns.length} ${turnWord} caricati · ultimo aggiornamento ${formatClock(new Date())}`;
  if (el.autoScroll.checked) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
}

async function loadCorrespondence(force = false) {
  try {
    const response = await fetch(`${rawUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`GitHub raw ha risposto ${response.status}`);
    const text = await response.text();
    const newHash = hashText(text);
    lastLoadedAt = new Date();
    setStatus(`Online · ${formatClock(lastLoadedAt)}`, true);
    if (!force && newHash === lastHash) return;
    lastHash = newHash;
    renderTurns(parseTurns(text));
  } catch (error) {
    setStatus("Errore lettura", false);
    el.chatMeta.innerHTML = `<span class="error">Non riesco a leggere la corrispondenza: ${escapeHtml(error.message)}</span>`;
  }
}

function formatClock(date) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Rome",
  }).format(date);
}

function formatDateTimeRome(date) {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

function generateManualTurn() {
  const message = el.message.value.trim();
  if (!message) {
    el.generated.value = "Scrivi prima un messaggio, Alberto.";
    el.copyButton.disabled = true;
    return;
  }
  const recipient = el.recipient.value;
  const timestamp = formatDateTimeRome(new Date());
  const block = `\n---\n\n## Turno manuale — Alberto — ${timestamp} Europe/Rome\n\n### Destinatario\n\n${recipient}\n\n### Messaggio\n\n${message}\n\n### Istruzione di continuità\n\nLa prossima istanza attivata deve leggere questo turno, decidere autonomamente come procedere, aggiungere un solo turno e fermarsi.\n`;
  el.generated.value = block;
  el.copyButton.disabled = false;
}

async function copyGenerated() {
  const text = el.generated.value;
  if (!text.trim()) return;
  try {
    await navigator.clipboard.writeText(text);
    el.copyButton.textContent = "Copiato";
    setTimeout(() => { el.copyButton.textContent = "Copia blocco"; }, 1200);
  } catch {
    el.generated.focus();
    el.generated.select();
  }
}

el.refreshButton.addEventListener("click", () => loadCorrespondence(true));
el.generateButton.addEventListener("click", generateManualTurn);
el.copyButton.addEventListener("click", copyGenerated);
el.message.addEventListener("input", () => {
  if (el.generated.value.trim()) generateManualTurn();
});
el.recipient.addEventListener("change", () => {
  if (el.generated.value.trim()) generateManualTurn();
});

loadCorrespondence(true);
window.setInterval(() => loadCorrespondence(false), CONFIG.pollMs);
