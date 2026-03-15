(function () {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]';

  function applyMatrix(el) {
    var originalText = el.getAttribute('data-text');
    var intervalId = null;

    el.addEventListener('mouseenter', function () {
      var iteration = 0;
      clearInterval(intervalId);
      intervalId = setInterval(function () {
        el.textContent = originalText
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
  }

  // nickname
  var nicknameEl = document.getElementById('matrix-nickname');
  if (nicknameEl) applyMatrix(nicknameEl);

  // navbar items
  var navEls = document.querySelectorAll('.matrix-nav');
  for (var i = 0; i < navEls.length; i++) {
    applyMatrix(navEls[i]);
  }
})();
