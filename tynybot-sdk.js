(function () {
  const currentScript = document.currentScript || document.getElementsByTagName('script')[0];
  const apiKey = currentScript.getAttribute('data-api-key');
  const siteURL = currentScript.getAttribute('data-site-url');
  const position = currentScript.getAttribute('data-position') || 'right'; // 'left' or 'right'
  const theme = currentScript.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (!apiKey || !siteURL) {
    console.error("TYNYBOT SDK: Missing data-api-key or data-site-url.");
    return;
  }

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #tynybot-toggle {
      position: fixed;
      bottom: 20px;
      ${position === 'left' ? 'left: 20px' : 'right: 20px'};
      background: #2563eb;
      color: white;
      padding: 12px 18px;
      border-radius: 24px;
      font-size: 15px;
      font-weight: 500;
      font-family: sans-serif;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      cursor: pointer;
      z-index: 9999;
      transition: background 0.3s;
    }
    #tynybot-toggle:hover {
      background: #1e40af;
    }
    #tyny-chat {
      position: fixed;
      bottom: 80px;
      ${position === 'left' ? 'left: 20px' : 'right: 20px'};
      width: 320px;
      height: 480px;
      background: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
      color: ${theme === 'dark' ? '#f3f4f6' : '#000'};
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      font-family: sans-serif;
      z-index: 9999;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    #tyny-chat.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
    }
    #tyny-chat-messages {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
    }
    .tyny-msg {
      margin: 6px 0;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 80%;
      font-size: 14px;
      white-space: pre-wrap;
    }
    .tyny-msg.user {
      background: ${theme === 'dark' ? '#334155' : '#dbeafe'};
      color: ${theme === 'dark' ? '#cbd5e1' : '#1e3a8a'};
      align-self: flex-end;
    }
    .tyny-msg.bot {
      background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
      color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
      align-self: flex-start;
    }
    #tyny-chat-form {
      display: flex;
      padding: 10px;
      border-top: 1px solid ${theme === 'dark' ? '#374151' : '#ddd'};
    }
    #tyny-chat-input {
      flex: 1;
      padding: 8px;
      background: ${theme === 'dark' ? '#1f2937' : '#fff'};
      color: ${theme === 'dark' ? '#f3f4f6' : '#000'};
      border: 1px solid ${theme === 'dark' ? '#4b5563' : '#ccc'};
      border-radius: 6px;
    }
    #tyny-chat-send {
      padding: 8px 12px;
      margin-left: 6px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Create toggle button
  const toggle = document.createElement('div');
  toggle.id = 'tynybot-toggle';
  toggle.textContent = '💬 Chat with TynyBot';
  document.body.appendChild(toggle);

  // Create chat box
  const chat = document.createElement('div');
  chat.id = 'tyny-chat';
  chat.innerHTML = `
    <div id="tyny-chat-messages"></div>
    <form id="tyny-chat-form">
      <input id="tyny-chat-input" placeholder="Type a message..." required />
      <button id="tyny-chat-send">Send</button>
    </form>
  `;
  document.body.appendChild(chat);

  const messagesEl = document.getElementById('tyny-chat-messages');
  const form = document.getElementById('tyny-chat-form');
  const input = document.getElementById('tyny-chat-input');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `tyny-msg ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, 'user');
    input.value = '';

    addMessage('Typing...', 'bot');

    try {
      const res = await fetch('https://tyny-bot.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, siteURL, apiKey })
      });

      const data = await res.json();
      const botMsg = messagesEl.querySelector('.tyny-msg.bot:last-child');
      botMsg.textContent = data.reply || 'No response.';
    } catch (err) {
      console.error('Bot error:', err);
      const botMsg = messagesEl.querySelector('.tyny-msg.bot:last-child');
      botMsg.textContent = 'Error talking to the bot.';
    }
  });

  toggle.addEventListener('click', () => {
    const open = chat.classList.contains('open');
    if (open) {
      chat.classList.remove('open');
      setTimeout(() => (chat.style.display = 'none'), 300);
    } else {
      chat.style.display = 'flex';
      setTimeout(() => chat.classList.add('open'), 10);
    }
  });
})();