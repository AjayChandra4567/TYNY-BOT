(function () {
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const apiKey = currentScript.getAttribute('data-api-key');
  const siteURL = currentScript.getAttribute('data-site-url');

  if (!apiKey || !siteURL) {
    console.error("TYNYBOT SDK: Missing data-api-key or data-site-url.");
    return;
  }

  // Inject basic styles + chat UI
  const style = document.createElement('style');
  style.textContent = `
    #tyny-chat {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      height: 480px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
      z-index: 9999;
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
    .tyny-msg.user { background: #dbeafe; align-self: flex-end; }
    .tyny-msg.bot { background: #f3f4f6; align-self: flex-start; }
    #tyny-chat-form {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ddd;
    }
    #tyny-chat-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
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
        body: JSON.stringify({
          question,
          siteURL,
          apiKey
        })
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
})();