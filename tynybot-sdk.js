// tynybot-sdk.js
(function () {
  // Get the current script tag
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Read data attributes
  var apiKey = currentScript.getAttribute('data-api-key');
  var siteURL = currentScript.getAttribute('data-site-url');

  if (!apiKey || !siteURL) {
    console.error("TYNYBOT SDK: Missing required parameters 'data-api-key' or 'data-site-url'.");
    return;
  }

  // Create a floating chat button
  var chatButton = document.createElement('div');
  chatButton.innerHTML = '💬';
  chatButton.style.position = 'fixed';
  chatButton.style.bottom = '20px';
  chatButton.style.right = '20px';
  chatButton.style.background = '#2563eb';
  chatButton.style.color = 'white';
  chatButton.style.fontSize = '24px';
  chatButton.style.padding = '12px';
  chatButton.style.borderRadius = '50%';
  chatButton.style.cursor = 'pointer';
  chatButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  chatButton.style.zIndex = '9999';
  document.body.appendChild(chatButton);

  var chatIframe = null;

  chatButton.addEventListener('click', function () {
    if (chatIframe) {
      chatIframe.style.display = chatIframe.style.display === 'none' ? 'block' : 'none';
      return;
    }

    chatIframe = document.createElement('iframe');
    chatIframe.src = siteURL + '/index.html';
    chatIframe.style.position = 'fixed';
    chatIframe.style.bottom = '80px';
    chatIframe.style.right = '20px';
    chatIframe.style.width = '400px';
    chatIframe.style.height = '600px';
    chatIframe.style.border = 'none';
    chatIframe.style.borderRadius = '16px';
    chatIframe.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
    chatIframe.style.zIndex = '9999';
    document.body.appendChild(chatIframe);
  });
})();