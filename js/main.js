document.addEventListener('DOMContentLoaded', function () {
  initNavActive();
  initCodeBlocks();
  initTables();
  initLightbox();
  initTOC();
});

/* ---- Active nav link ---- */
function initNavActive() {
  var path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var isHome = href === '/' && (path === '/' || path === '/index.html');
    var isOther = href !== '/' && path.indexOf(href) === 0;
    if (isHome || isOther) link.classList.add('active');
  });
}

/* ---- Code block: wrap with header + copy button ---- */
function initCodeBlocks() {
  var pres = document.querySelectorAll('.post-content pre');
  pres.forEach(function (pre) {
    if (pre.closest('.code-block')) return;

    var code = pre.querySelector('code');
    var lang = '';
    if (code) {
      var m = code.className.match(/language-(\S+)/);
      if (!m) m = code.className.match(/hljs\s+(\S+)/);
      if (m) lang = m[1];
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'code-block';

    var header = document.createElement('div');
    header.className = 'code-header';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'code-filename';
    nameSpan.textContent = lang;

    var copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy';
    copyBtn.textContent = 'copy';
    copyBtn.addEventListener('click', function () {
      var text = code ? code.innerText : pre.innerText;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'copied';
          setTimeout(function () { copyBtn.textContent = 'copy'; }, 1200);
        });
      }
    });

    header.appendChild(nameSpan);
    header.appendChild(copyBtn);

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}

/* ---- Table scroll wrapper ---- */
function initTables() {
  document.querySelectorAll('.post-content table').forEach(function (table) {
    if (table.parentNode.classList.contains('table-wrapper')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

/* ---- Lightbox image zoom ---- */
function initLightbox() {
  document.querySelectorAll('.post-content img').forEach(function (img) {
    var anchor = img.closest('a');
    if (anchor) {
      anchor.addEventListener('click', function (e) { e.preventDefault(); });
    }
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () {
      openLightbox(img.src || img.getAttribute('src'));
    });
  });
}

function openLightbox(src) {
  var overlay = document.createElement('div');
  overlay.className = 'lb-overlay';

  var imgEl = document.createElement('img');
  imgEl.className = 'lb-img';
  imgEl.src = src;

  overlay.appendChild(imgEl);
  document.body.appendChild(overlay);

  overlay.offsetHeight;
  overlay.classList.add('lb-open');

  var zoomed = false;
  var tx = 0, ty = 0;
  var skipClick = false;

  /* 2x 확대 시 이미지 경계 밖으로 나가지 않도록 translate를 제한
     transform: translate(tx, ty) scale(2) 에서 tx/ty는 스크린 픽셀 기준.
     zoomed image visual half-size = imgEl.offsetWidth (= CSS box * 2 / 2).
     blank space가 생기지 않으려면: |tx| <= max(0, iw - ow/2) */
  function clamp(x, y) {
    var maxX = Math.max(0, imgEl.offsetWidth  - overlay.clientWidth  / 2);
    var maxY = Math.max(0, imgEl.offsetHeight - overlay.clientHeight / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }

  function applyTransform(animated) {
    imgEl.style.transition = animated ? '' : 'none';
    imgEl.style.transform = zoomed
      ? 'translate(' + tx + 'px, ' + ty + 'px) scale(2)'
      : '';
    if (animated) imgEl.style.cursor = zoomed ? 'grab' : '';
  }

  imgEl.addEventListener('click', function (e) {
    e.stopPropagation();
    if (skipClick) { skipClick = false; return; }
    zoomed = !zoomed;
    if (!zoomed) { tx = 0; ty = 0; }
    applyTransform(true);
  });

  /* ---- mouse drag ---- */
  imgEl.addEventListener('mousedown', function (e) {
    if (!zoomed) return;
    e.preventDefault();
    var moved = false;
    var ox = e.clientX - tx;
    var oy = e.clientY - ty;
    imgEl.style.cursor = 'grabbing';

    function onMove(e) {
      moved = true;
      var c = clamp(e.clientX - ox, e.clientY - oy);
      tx = c.x; ty = c.y;
      applyTransform(false);
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      imgEl.style.transition = '';
      imgEl.style.cursor = 'grab';
      if (moved) skipClick = true;
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  /* ---- touch drag ---- */
  var t0x, t0y, t0tx, t0ty;

  imgEl.addEventListener('touchstart', function (e) {
    if (!zoomed || e.touches.length !== 1) return;
    t0x = e.touches[0].clientX;
    t0y = e.touches[0].clientY;
    t0tx = tx; t0ty = ty;
  }, { passive: true });

  imgEl.addEventListener('touchmove', function (e) {
    if (!zoomed || e.touches.length !== 1) return;
    e.preventDefault();
    var c = clamp(t0tx + e.touches[0].clientX - t0x, t0ty + e.touches[0].clientY - t0y);
    tx = c.x; ty = c.y;
    applyTransform(false);
  }, { passive: false });

  imgEl.addEventListener('touchend', function () {
    if (zoomed) imgEl.style.transition = '';
  });

  function close() {
    overlay.classList.remove('lb-open');
    overlay.addEventListener('transitionend', function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, { once: true });
    document.removeEventListener('keydown', onKey);
  }

  overlay.addEventListener('click', function (e) {
    if (e.target !== imgEl) close();
  });

  function onKey(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onKey);
}

/* ---- TOC active section highlighting ---- */
function initTOC() {
  var tocLinks = document.querySelectorAll('.toc-sidebar .toc-link');
  if (!tocLinks.length) return;

  var headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3');
  if (!headings.length) return;

  function getActive() {
    var scrollY = window.scrollY + 100;
    var active = null;
    headings.forEach(function (h) {
      if (h.offsetTop <= scrollY) active = h;
    });
    return active;
  }

  function updateTOC() {
    var active = getActive();
    tocLinks.forEach(function (link) {
      var id = active ? active.getAttribute('id') : null;
      link.classList.toggle('active', id && link.getAttribute('href') === '#' + id);
    });
  }

  window.addEventListener('scroll', updateTOC, { passive: true });
  updateTOC();
}
