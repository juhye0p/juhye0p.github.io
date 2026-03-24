(function () {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]';

  var nicknameEl = document.getElementById('matrix-nickname');
  if (!nicknameEl) return;

  var originalText = nicknameEl.getAttribute('data-text');
  var intervalId = null;

  nicknameEl.addEventListener('mouseenter', function () {
    var iteration = 0;
    clearInterval(intervalId);
    intervalId = setInterval(function () {
      nicknameEl.textContent = originalText
        .split('')
        .map(function (char, index) {
          if (index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= originalText.length) {
        clearInterval(intervalId);
        intervalId = null;
      }
      iteration += 1 / 3;
    }, 30);
  });
})();
