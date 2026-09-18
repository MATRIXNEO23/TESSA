(() => {
  const assistantSelectors = [
    'article[data-turn="assistant"]',
    '[data-message-author-role="assistant"]'
  ];

  const composerSelectors = [
    '#prompt-textarea',
    'textarea[data-testid="prompt-textarea"]',
    '[contenteditable="true"][data-virtualkeyboard="true"]',
    'div[contenteditable="true"].ProseMirror'
  ];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function queryFirst(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function assistantNodes() {
    for (const selector of assistantSelectors) {
      const nodes = [...document.querySelectorAll(selector)];
      if (nodes.length) return nodes;
    }
    return [];
  }

  function assistantText(node) {
    if (!node) return '';
    const markdown = node.querySelector('.markdown, [class*="markdown"]');
    return (markdown?.innerText ?? node.innerText ?? '').trim();
  }

  function isGenerating() {
    const direct = document.querySelector(
      'button[data-testid="stop-button"], button[aria-label*="Stop"], button[aria-label*="Interrompi"]'
    );
    return Boolean(direct);
  }

  function setComposerText(composer, text) {
    composer.focus();

    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      const proto = composer instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter?.call(composer, text);
      composer.dispatchEvent(new Event('input', { bubbles: true }));
      composer.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(composer);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, text);
    } catch {
      inserted = false;
    }

    if (!inserted) composer.textContent = text;

    composer.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: text
      })
    );
  }

  function sendButton() {
    const direct = document.querySelector(
      'button[data-testid="send-button"], button[aria-label*="Send"], button[aria-label*="Invia"]'
    );
    if (direct) return direct;

    return [...document.querySelectorAll('button')].find((button) => {
      const label = [
        button.getAttribute('aria-label') ?? '',
        button.textContent ?? ''
      ].join(' ').toLowerCase();
      return /send|invia/.test(label);
    }) ?? null;
  }

  async function submitPrompt(text) {
    const composer = queryFirst(composerSelectors);
    if (!composer) throw new Error('composer_not_found');

    const baselineNodes = assistantNodes();
    const baselineCount = baselineNodes.length;
    const baselineText = assistantText(baselineNodes.at(-1));

    setComposerText(composer, text);

    for (let i = 0; i < 12; i += 1) {
      const button = sendButton();
      if (button && !button.disabled) {
        button.click();
        return { baselineCount, baselineText };
      }
      await sleep(100);
    }

    composer.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter'
      })
    );
    return { baselineCount, baselineText };
  }

  async function monitor(requestId, baseline) {
    const startedAt = Date.now();
    let lastText = '';
    let stableTicks = 0;
    let sawNewAnswer = false;

    while (Date.now() - startedAt < 5 * 60_000) {
      const nodes = assistantNodes();
      const latest = nodes.at(-1);
      const text = assistantText(latest);

      if (
        nodes.length > baseline.baselineCount ||
        (text && text !== baseline.baselineText)
      ) {
        sawNewAnswer = true;
      }

      if (sawNewAnswer && text && text !== lastText) {
        lastText = text;
        stableTicks = 0;
        chrome.runtime.sendMessage({
          type: 'dual-chat:update',
          requestId,
          text,
          final: false
        }).catch(() => {});
      } else if (sawNewAnswer && text === lastText && text) {
        stableTicks += 1;
      }

      if (sawNewAnswer && !isGenerating() && lastText && stableTicks >= 2) {
        chrome.runtime.sendMessage({
          type: 'dual-chat:update',
          requestId,
          text: lastText,
          final: true
        }).catch(() => {});
        return;
      }

      await sleep(450);
    }

    chrome.runtime.sendMessage({
      type: 'dual-chat:error',
      requestId,
      error: 'response_timeout'
    }).catch(() => {});
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'dual-chat:ping') {
      sendResponse({
        ok: true,
        url: location.href,
        title: document.title
      });
      return;
    }

    if (message?.type !== 'dual-chat:send') return;

    const text = String(message.text ?? '').trim();
    const requestId = String(message.requestId ?? '');
    if (!text || !requestId) {
      sendResponse({ ok: false, error: 'invalid_request' });
      return;
    }

    submitPrompt(text)
      .then((baseline) => {
        sendResponse({ ok: true });
        void monitor(requestId, baseline);
      })
      .catch((error) => {
        const value = error instanceof Error ? error.message : 'send_failed';
        sendResponse({ ok: false, error: value });
        chrome.runtime.sendMessage({
          type: 'dual-chat:error',
          requestId,
          error: value
        }).catch(() => {});
      });

    return true;
  });
})();
