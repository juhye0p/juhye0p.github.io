(function () {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]';
  var BLOCK = '\u2588'; // █

  var nicknameEl = document.getElementById('matrix-nickname');
  if (!nicknameEl) return;

  var originalText = nicknameEl.getAttribute('data-text');
  var intervalId = null;

  nicknameEl.addEventListener('mouseenter', function () {
    var iteration = 0;
    clearInterval(intervalId);
    intervalId = setInterval(function () {
      var cursorPos = Math.floor(iteration);
      nicknameEl.textContent = originalText
        .split('')
        .map(function (char, index) {
          if (index < iteration) return originalText[index];
          // Flash a block cursor character at the reveal edge.
          if (index === cursorPos && Math.random() < 0.5) return BLOCK;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= originalText.length) {
        clearInterval(intervalId);
        intervalId = null;
        nicknameEl.textContent = originalText;
      }
      iteration += 1 / 3;
    }, 30);
  });
})();
